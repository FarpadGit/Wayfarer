/* Mainly types of data recieved from the server as a response */
export type userType = {
  email: string;
  name: string;
};

export type categoryTitleType = {
  id: string;
  title: string;
  createdAt: string;
  creator: userType;
};

export type postTitleType = {
  id: string;
  title: string;
  createdAt: string;
  uploader: userType;
  categoryId: string;
};

export type postType = {
  title: string;
  body: string;
  images?: {
    name: string;
    url: string;
    thumbnail?: string;
  }[];
  comments: commentType[];
};

export type commentType = {
  id: string;
  isLikedByMe: boolean;
  likeCount: number;
  createdAt: string;
  message: string;
  parentId: string | null;
  user: userType;
};
