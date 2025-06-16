export type CategoriesBody = {
  title?: string;
};
export type PostsBody = {
  title?: string;
  body?: string;
  images?: number;
};
export type ImagesBody = {
  files: {
    name: string;
    url: string;
  }[];
  uploaderName: string;
  postId: string;
  temporary: boolean;
};
export type CommentsBody = {
  message?: string;
  parentId?: string | null;
};
export type ImageServerBody = {
  images: {
    name: string;
    url: string;
    thumbnailUrl: string;
    postId: string;
  }[];
};
export type LoginBody = {
  userToken?: {
    email: string;
    name: string;
    sub: string;
  };
};
export function isPrivilegeError(obj: any): obj is { PrivilegeError: string } {
  return obj.PrivilegeError !== undefined;
}
