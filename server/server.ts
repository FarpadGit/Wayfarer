import fastify, { FastifyListenOptions } from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = fastify();
app.register(sensible);
app.register(cookie, {
  secret: process.env.COOKIE_SECRET,
  parseOptions: { sameSite: "none", secure: true },
});
app.register(cors, {
  origin: process.env.CLIENT_URL,
  credentials: true,
});
app.addHook("onRequest", (req, res, done) => {
  if (!req.cookies.userId) {
    req.cookies.userId = GUEST_USER_ID;
    res.clearCookie("userId");
    res.setCookie("userId", GUEST_USER_ID, { path: "/" });
  }
  done();
});

const prisma: PrismaClient = new PrismaClient();
let CURRENT_USER_ID: string = "";
const ADMIN_USER_ID: string = <string>(
  (await prisma.user.findFirst({ where: { name: "Admin" } }))?.id
);
const GUEST_USER_ID: string = <string>(
  (await prisma.user.findFirst({ where: { name: "Guest" } }))?.id
);
const COMMENT_SELECT_FIELDS = {
  id: true,
  message: true,
  parentId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};

type ReqParamsType = { postId: string; commentId?: string };
type ReqBodyForPostsType = {
  title?: string;
  body?: string;
  uploaderId?: string;
};
type ReqBodyForCommentsType = {
  id?: string;
  message?: string;
  parentId?: string;
  postId?: string;
};
type ReqBodyForLoginType = {
  userToken?: string;
};

app.post("/login", async (req, res) => {
  const body = req.body as ReqBodyForLoginType;

  if (body.userToken === "" || body.userToken == null) {
    CURRENT_USER_ID = GUEST_USER_ID;
  } else {
    CURRENT_USER_ID =
      (await prisma.user.findFirst({ where: { name: body.userToken } }))?.id ??
      (await prisma.user.create({ data: { name: <string>body.userToken } }))
        ?.id;
  }
  req.cookies.userId = CURRENT_USER_ID;
  res.clearCookie("userId");
  res.setCookie("userId", CURRENT_USER_ID, { path: "/" });
  return true;
});

app.get("/posts", async (req, res) => {
  return await resolveAsync(
    prisma.post.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  );
});

app.post("/posts", async (req, res) => {
  const body = req.body as ReqBodyForPostsType;
  if (body.title === "" || body.title == null) {
    return res.send(app.httpErrors.badRequest("A poszt címe kötelező"));
  }

  if (body.body === "" || body.body == null) {
    return res.send(app.httpErrors.badRequest("A poszt törzse kötelező"));
  }

  return await resolveAsync(
    prisma.post.create({
      data: {
        title: <string>body.title,
        body: <string>body.body,
        uploaderId: <string>req.cookies.userId,
      },
    })
  );
});

app.get("/posts/:postId", async (req, res) => {
  return await resolveAsync(
    prisma.post
      .findUnique({
        where: { id: (req.params as ReqParamsType).postId },
        select: {
          body: true,
          title: true,
          comments: {
            orderBy: { createdAt: "desc" },
            select: {
              ...COMMENT_SELECT_FIELDS,
              _count: { select: { likes: true } },
            },
          },
        },
      })
      .then(async (post) => {
        const likes = await prisma.like.findMany({
          where: {
            userId: req.cookies.userId,
            commentId: { in: post?.comments.map((comment) => comment.id) },
          },
        });

        return {
          ...post,
          comments: post?.comments.map((comment) => {
            const { _count, ...commentFields } = comment;
            return {
              ...commentFields,
              isLikedByMe: Boolean(
                likes.find((like) => like.commentId === comment.id)
              ),
              likeCount: _count.likes || 0,
            };
          }),
        };
      })
  );
});

app.delete("/posts/:postId", async (req, res) => {
  const userId: string = <string>(
    await prisma.post.findUnique({
      where: { id: (req.params as ReqParamsType).postId },
      select: { uploaderId: true },
    })
  )?.uploaderId;
  if (userId !== req.cookies.userId && req.cookies.userId !== ADMIN_USER_ID) {
    return res.send(
      app.httpErrors.unauthorized("Nincs jogosultságod törölni ezt a posztot!")
    );
  }

  return await resolveAsync(
    prisma.post.delete({
      where: { id: (req.params as ReqParamsType).postId },
      select: { id: true },
    })
  );
});

app.post("/posts/:postId/comments", async (req, res) => {
  const body = req.body as ReqBodyForCommentsType;
  if (body.message === "" || body.message == null) {
    return res.send(app.httpErrors.badRequest("Az üzenet szövege kötelező"));
  }

  return await resolveAsync(
    prisma.comment
      .create({
        data: {
          message: <string>body.message,
          userId: <string>req.cookies.userId,
          parentId: <string>body.parentId,
          postId: <string>body.id,
        },
        select: COMMENT_SELECT_FIELDS,
      })
      .then((comment) => {
        return {
          ...comment,
          likeCount: 0,
          isLikedByMe: false,
        };
      })
  );
});

app.put("/posts/:postId/comments/:commentId", async (req, res) => {
  const body = req.body as ReqBodyForCommentsType;
  if (body.message === "" || body.message == null) {
    return res.send(app.httpErrors.badRequest("Az üzenet szövege kötelező"));
  }

  const userId: string = <string>(
    await prisma.comment.findUnique({
      where: { id: (req.params as ReqParamsType).commentId },
      select: { userId: true },
    })
  )?.userId;
  if (userId !== req.cookies.userId && req.cookies.userId !== ADMIN_USER_ID) {
    return res.send(
      app.httpErrors.unauthorized(
        "Nincs jogosultságod szerkeszteni ezt az üzenetet!"
      )
    );
  }

  return await resolveAsync(
    prisma.comment.update({
      where: { id: (req.params as ReqParamsType).commentId },
      data: { message: body.message },
      select: { message: true },
    })
  );
});

app.delete("/posts/:postId/comments/:commentId", async (req, res) => {
  const userId: string = <string>(
    await prisma.comment.findUnique({
      where: { id: (req.params as ReqParamsType).commentId },
      select: { userId: true },
    })
  )?.userId;
  if (userId !== req.cookies.userId && req.cookies.userId !== ADMIN_USER_ID) {
    return res.send(
      app.httpErrors.unauthorized(
        "Nincs jogosultságod törölni ezt az üzenetet!"
      )
    );
  }

  return await resolveAsync(
    prisma.comment.delete({
      where: { id: (req.params as ReqParamsType).commentId },
      select: { id: true },
    })
  );
});

app.post("/posts/:postId/comments/:commentId/toggleLike", async (req, res) => {
  const data = {
    commentId: <string>(req.params as ReqParamsType).commentId,
    userId: <string>req.cookies.userId,
  };

  const like = await prisma.like.findUnique({
    where: { userId_commentId: data },
  });

  if (like == null) {
    return await resolveAsync(prisma.like.create({ data })).then(() => {
      return { isLikeAdded: true };
    });
  } else {
    return await resolveAsync(
      prisma.like.delete({ where: { userId_commentId: data } })
    ).then(() => {
      return { isLikeAdded: false };
    });
  }
});

async function resolveAsync(promise: Promise<any>) {
  const [error, data] = await app.to(promise);
  if (error) return app.httpErrors.internalServerError(error.message);
  return data;
}

app.listen(<FastifyListenOptions>{ port: +process.env.PORT });

module.exports = app;
