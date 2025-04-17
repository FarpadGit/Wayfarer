export type CategoriesBody = {
  title?: string;
};
export type PostsBody = {
  title?: string;
  body?: string;
};
export type CommentsBody = {
  message?: string;
  parentId?: string | null;
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
