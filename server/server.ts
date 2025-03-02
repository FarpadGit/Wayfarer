import fastify, { FastifyListenOptions } from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import * as dotenv from "dotenv";
import * as service from "./service.js";

dotenv.config();

const { GUEST_USER_ID } = service;

const app = fastify();
app.register(sensible);
app.register(cookie, {
  secret: process.env.COOKIE_SECRET,
  parseOptions: { sameSite: "none", secure: true },
});
app.register(cors, {
  origin: process.env.CLIENT_URL,
  credentials: true,
  exposedHeaders: "userId",
});
app.addHook("onRequest", (req, res, done) => {
  if (!req.cookies.userId) {
    req.cookies.userId = GUEST_USER_ID;
    res.clearCookie("userId");
    res.setCookie("userId", GUEST_USER_ID, { path: "/" });
  }
  done();
});

app.addHook("onSend", async (req, res) => {
  res.headers({ userId: req.cookies.userId });
});

type ReqParamsType = {
  categoryId?: string;
  postId?: string;
  commentId?: string;
};
type ReqBodyForCategoriesType = {
  title?: string;
};
type ReqBodyForPostsType = {
  title?: string;
  body?: string;
};
type ReqBodyForCommentsType = {
  message?: string;
  parentId?: string;
};
type ReqBodyForLoginType = {
  userToken?: {
    email: string;
    name: string;
    sub: string;
  };
};

app.post("/login", async (req, res) => {
  const { userToken } = req.body as ReqBodyForLoginType;
  let CURRENT_USER_ID: string = "";

  if (
    userToken == null ||
    userToken.email === "" ||
    userToken.email === "WF_GUEST"
  ) {
    CURRENT_USER_ID = GUEST_USER_ID;
  } else {
    CURRENT_USER_ID = await service.createUserIfNew({ ...userToken });
  }
  req.cookies.userId = CURRENT_USER_ID;

  res.clearCookie("userId");
  res.setCookie("userId", CURRENT_USER_ID, { path: "/" });
  return true;
});

app.get("/categories", async (req, res) => {
  return await resolveAsync(service.getCategories());
});

app.post("/categories", async (req, res) => {
  const { title } = req.body as ReqBodyForCategoriesType;
  return await resolveAsync(
    service.createCategory({ title, creatorId: req.cookies.userId })
  );
});

app.delete("/categories/:categoryId", async (req, res) => {
  const { categoryId } = req.params as ReqParamsType;

  const response = await resolveAsync(
    service.deleteCategory(categoryId, req.cookies.userId)
  );

  if (Object.keys(response).includes("PrivilegeError"))
    return res.send(
      app.httpErrors.unauthorized("Nincs jogosultságod törölni ezt a járást!")
    );

  return response;
});

app.get("/categories/:categoryId/posts", async (req, res) => {
  const { categoryId } = req.params as ReqParamsType;
  return await resolveAsync(service.getPostsByCategory(categoryId));
});

app.post("/categories/:categoryId/posts", async (req, res) => {
  const { title, body } = req.body as ReqBodyForPostsType;
  const { categoryId } = req.params as ReqParamsType;

  if (categoryId === "" || categoryId == null) {
    return res.send(
      app.httpErrors.badRequest(
        "Minden posztnak tartoznia kell egy kategóriához"
      )
    );
  }

  if (title === "" || title == null) {
    return res.send(app.httpErrors.badRequest("A poszt címe kötelező"));
  }

  if (body === "" || body == null) {
    return res.send(app.httpErrors.badRequest("A poszt törzse kötelező"));
  }

  return await resolveAsync(
    service.createPost({
      title,
      body,
      categoryId,
      uploaderId: req.cookies.userId,
    })
  );
});

app.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params as ReqParamsType;
  return await resolveAsync(
    service.getPostWithComments(postId, req.cookies.userId)
  );
});

app.delete("/posts/:postId", async (req, res) => {
  const { postId } = req.params as ReqParamsType;

  const response = await resolveAsync(
    service.deletePost(postId, req.cookies.userId)
  );
  if (Object.keys(response).includes("PrivilegeError"))
    return res.send(
      app.httpErrors.unauthorized("Nincs jogosultságod törölni ezt a posztot!")
    );

  return response;
});

app.post("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params as ReqParamsType;
  const { message, parentId = null } = req.body as ReqBodyForCommentsType;
  if (message === "" || message == null) {
    return res.send(app.httpErrors.badRequest("Az üzenet szövege kötelező"));
  }

  return await resolveAsync(
    service.createComment({
      message,
      postId,
      parentId,
      userId: req.cookies.userId,
    })
  );
});

app.put("/comments/:commentId", async (req, res) => {
  const { commentId } = req.params as ReqParamsType;
  const { message } = req.body as ReqBodyForCommentsType;
  if (message === "" || message == null) {
    return res.send(app.httpErrors.badRequest("Az üzenet szövege kötelező"));
  }

  const response = await resolveAsync(
    service.updateComment({
      id: commentId,
      message,
      userId: req.cookies.userId,
    })
  );
  if (Object.keys(response).includes("PrivilegeError"))
    return res.send(
      app.httpErrors.unauthorized(
        "Nincs jogosultságod szerkeszteni ezt az üzenetet!"
      )
    );

  return response;
});

app.delete("/comments/:commentId", async (req, res) => {
  const { commentId } = req.params as ReqParamsType;

  const response = await resolveAsync(
    service.deleteComment(commentId, req.cookies.userId)
  );
  if (Object.keys(response).includes("PrivilegeError"))
    return res.send(
      app.httpErrors.unauthorized(
        "Nincs jogosultságod törölni ezt az üzenetet!"
      )
    );

  return response;
});

app.post("/comments/:commentId/toggleLike", async (req, res) => {
  const { commentId } = req.params as ReqParamsType;
  return await resolveAsync(service.toggleLike(commentId, req.cookies.userId));
});

async function resolveAsync(promise: Promise<any>) {
  const [error, data] = await app.to(promise);
  if (error) {
    console.error(error.message);
    return app.httpErrors.internalServerError(
      "Sajnos ismeretlen eredetű hiba történt a szerver oldalán."
    );
  }
  return data;
}

app.listen(<FastifyListenOptions>{ port: +process.env.PORT });

export default async function handler(req: any, res: any) {
  await app.ready();
  app.server.emit("request", req, res);
}
