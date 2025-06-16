export type categoryType = {
  title: string;
  creatorId: string;
};
export type postType = {
  title: string;
  body: string;
  noOfImages: number;
  uploaderId: string;
  categoryId: string;
};
export type imageType = {
  name: string;
  url: string;
  postId: string;
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
