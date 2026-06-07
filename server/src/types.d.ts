type categoryType = {
  title: string;
  creatorId: string;
};
type postType = {
  title: string;
  body: string;
  noOfImages: number;
  uploaderId: string;
  categoryId: string;
};
type imageType = {
  name: string;
  url: string;
  postId: string;
};
type commentType = {
  id: string;
  message: string;
  parentId?: string | null;
  postId: string;
  userId: string;
};
type userType = {
  email: string;
  name: string;
  sub: string;
};
