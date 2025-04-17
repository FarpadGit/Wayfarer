export type categoryType = {
  title: string;
  creatorId: string;
};
export type postType = {
  title: string;
  body: string;
  uploaderId: string;
  categoryId: string;
};
export type commentType = {
  id: string;
  message: string;
  parentId?: string | null;
  postId: string;
  userId: string;
};
export type userType = {
  email: string;
  name: string;
  sub: string;
};
