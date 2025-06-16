import { User } from 'src/db/entities/user.entity';
import { Category } from 'src/db/entities/category.entity';
import { Post } from 'src/db/entities/post.entity';
import { Image } from 'src/db/entities/image.entity';
import { Comment } from 'src/db/entities/comment.entity';
import { Like } from 'src/db/entities/like.entity';

export const mockUser: User = {
  id: 'fakeUserID',
  name: 'Fake User',
  email: 'user@mail.com',
  oauth2_sub: '12345',
  categories: [],
  posts: [],
  comments: [],
  likes: [],
};

export const mockAdmin: User = {
  id: 'fakeAdminUserID',
  name: 'WF_ADMIN',
  email: 'WF_ADMIN',
  oauth2_sub: '',
  categories: [],
  posts: [],
  comments: [],
  likes: [],
};

export const mockGuest: User = {
  id: 'fakeGuestUserID',
  name: 'WF_GUEST',
  email: 'WF_GUEST',
  oauth2_sub: '',
  categories: [],
  posts: [],
  comments: [],
  likes: [],
};

export const mockCategory: Category = {
  id: 'fakeCategoryID',
  title: 'Fake Category',
  posts: [],
  creator: mockUser,
  createdAt: new Date(),
};

export const mockPost: Post = {
  id: 'fakePostID',
  title: 'Fake Post Title',
  body: 'lorem ipsum',
  images: [],
  uploader: mockUser,
  category: mockCategory,
  comments: [],
  createdAt: new Date(),
};

export const mockImage: Image = {
  id: 'fakeImageID',
  name: 'fakeImage.jpg',
  url: 'fakeurl.com',
  thumbnail: 'fakeurl.com',
  post: mockPost,
};

export const mockComment: Comment = {
  id: 'fakeCommentID',
  post: mockPost,
  message: 'Fake Comment',
  children: [],
  user: mockUser,
  likes: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockLike: Like = { comment: mockComment, user: mockUser };
