import {
  categoryTitleType,
  commentType,
  postTitleType,
  postType,
  userType,
} from '../app/types';

export const mockUser: userType = {
  name: 'Fake User',
  email: 'user@email.com',
};

export const mockCategory: categoryTitleType = {
  id: 'fakeCategoryID',
  title: 'Fake Category',
  creator: mockUser,
  createdAt: new Date().toString(),
};

export const mockPostTitle: postTitleType = {
  id: 'fakePostTitleID',
  title: 'Fake Post Title',
  categoryId: '',
  createdAt: new Date().toString(),
  uploader: mockUser,
};

export const mockPost: postType = {
  title: 'Fake Post Title',
  body: 'Lorem Ipsum Dolor Sit Amet',
  comments: [],
};

export const mockComment: commentType = {
  id: 'fakeParentCommentID',
  message: 'Lorem Ipsum',
  parentId: null,
  user: mockUser,
  createdAt: new Date().toString(),
  isLikedByMe: false,
  likeCount: 15,
};

export const mockComment_child: commentType = {
  id: 'fakeChildCommentID',
  message: 'Dolor Sit Amet',
  parentId: mockComment.id,
  user: mockUser,
  createdAt: new Date().toString(),
  isLikedByMe: true,
  likeCount: 10,
};
