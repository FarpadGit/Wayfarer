import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const ADMIN_USER_ID = await getAdminId();
export const GUEST_USER_ID = await getGuestId();

const COMMENT_SELECT_FIELDS = {
  id: true,
  message: true,
  parentId: true,
  createdAt: true,
  user: {
    select: {
      email: true,
      name: true,
    },
  },
};

type categoryType = {
  title: string;
  creatorId: string;
};
type postType = {
  title: string;
  body: string;
  uploaderId: string;
  categoryId: string;
};
type commentType = {
  id: string;
  message: string;
  parentId?: string;
  postId: string;
  userId: string;
};
type userType = {
  email: string;
  name: string;
  sub: string;
};

async function getAdminId() {
  const admin = await prisma.user.findFirst({
    where: { email: "WF_ADMIN" },
    select: { id: true },
  });
  return admin.id;
}

async function getGuestId() {
  const guest = await prisma.user.findFirst({
    where: { email: "WF_GUEST" },
    select: { id: true },
  });
  return guest.id;
}

export async function createUserIfNew(user: userType) {
  let userInDB = await prisma.user.findFirst({
    where: { email: user.email },
    select: { id: true },
  });
  if (userInDB == null)
    userInDB = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        oauth2_sub: user.sub,
      },
      select: { id: true },
    });
  return userInDB.id;
}

export async function getCategories() {
  return await prisma.category.findMany({
    select: {
      id: true,
      title: true,
      createdAt: true,
      creator: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });
}

export async function createCategory(category: categoryType) {
  return await prisma.category.create({
    data: {
      title: category.title,
      creatorId: category.creatorId,
    },
  });
}

export async function deleteCategory(id: string, userId: string) {
  const creatorId = await getCategoryOwnerId(id);

  if (creatorId !== userId && userId !== ADMIN_USER_ID) {
    return { PrivilegeError: "Nincs jogosultságod törölni ezt a járást!" };
  }

  return await prisma.category.delete({
    where: { id },
    select: { id: true },
  });
}

async function getCategoryOwnerId(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { creatorId: true },
  });
  return category.creatorId;
}

export async function getPostsByCategory(categoryId: string) {
  return await prisma.post.findMany({
    where: { categoryId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      categoryId: true,
      uploader: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });
}

export async function createPost(post: postType) {
  return await prisma.post.create({
    data: {
      title: post.title,
      body: post.body,
      uploaderId: post.uploaderId,
      categoryId: post.categoryId,
    },
  });
}

async function getPostAuthorId(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { uploaderId: true },
  });
  return post.uploaderId;
}

export async function getPostWithComments(id: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id },
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
  });

  const likes = await prisma.like.findMany({
    where: {
      userId: userId,
      commentId: { in: post.comments.map((comment) => comment.id) },
    },
  });

  return {
    ...post,
    comments: post.comments.map((comment) => {
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
}

export async function deletePost(id: string, userId: string) {
  const uploaderId = await getPostAuthorId(id);

  if (uploaderId !== userId && userId !== ADMIN_USER_ID) {
    return { PrivilegeError: "Nincs jogosultságod törölni ezt a posztot!" };
  }

  return await prisma.post.delete({
    where: { id },
    select: { id: true },
  });
}

export async function createComment(comment: Omit<commentType, "id">) {
  return await prisma.comment
    .create({
      data: {
        message: comment.message,
        userId: comment.userId,
        parentId: comment.parentId,
        postId: comment.postId,
      },
      select: { id: true },
    })
    .then((comment) => comment.id);
}

async function getCommentAuthorId(commentId: string) {
  const post = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });
  return post.userId;
}

export async function updateComment(
  newComment: Omit<commentType, "parentId" | "postId">
) {
  const authorId = await getCommentAuthorId(newComment.id);
  if (authorId !== newComment.userId && newComment.userId !== ADMIN_USER_ID) {
    return {
      PrivilegeError: "Nincs jogosultságod szerkeszteni ezt az üzenetet!",
    };
  }

  return await prisma.comment.update({
    where: { id: newComment.id },
    data: { message: newComment.message },
    select: { message: true },
  });
}

export async function deleteComment(id: string, userId: string) {
  const authorId = await getCommentAuthorId(id);
  if (authorId !== userId && userId !== ADMIN_USER_ID) {
    return { PrivilegeError: "Nincs jogosultságod törölni ezt az üzenetet!" };
  }

  return await prisma.comment.delete({
    where: { id },
    select: { id: true },
  });
}

export async function toggleLike(commentId: string, userId: string) {
  const like = await prisma.like.findUnique({
    where: { userId_commentId: { commentId, userId } },
  });

  if (like == null) {
    await prisma.like.create({ data: { commentId, userId } });
    return { isLikeAdded: true };
  } else {
    await prisma.like.delete({
      where: { userId_commentId: { commentId, userId } },
    });
    return { isLikeAdded: false };
  }
}
