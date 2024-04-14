/* Mainly types of data recieved from the server as a response */

export type postTitleType = {
  id: string;
  title: string;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
  };
};

export type postType = {
  title: string;
  body: string;
  comments: commentType[];
};

export type commentType = {
  id: string;
  isLikedByMe: boolean;
  likeCount: number;
  createdAt: string;
  message: string;
  parentId: string | null;
  user: {
    id: string;
    name: string;
  };
};
