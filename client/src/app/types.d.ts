/* Mainly types of data recieved from the server as a response */
type userType = {
  email: string;
  name: string;
};

type categoryTitleType = {
  id: string;
  title: string;
  createdAt: string;
  creator: userType;
};

type postTitleType = {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  uploader: userType;
  categoryId: string;
};

type postType = {
  id: string;
  title: string;
  body: string;
  uploaderEmail: string;
  images?: {
    name: string;
    url: string;
    thumbnail?: string;
  }[];
  comments: commentType[];
};

type commentType = {
  id: string;
  isLikedByMe: boolean;
  likeCount: number;
  createdAt: string;
  message: string;
  parentId: string | null;
  user: userType;
};
