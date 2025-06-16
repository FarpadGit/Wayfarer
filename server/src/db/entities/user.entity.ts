import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { Post } from './post.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  email!: string;

  @Column()
  name!: string;

  @Column()
  oauth2_sub!: string;

  @OneToMany(() => Category, (category) => category.creator)
  categories!: Category[];

  @OneToMany(() => Post, (post) => post.uploader)
  posts!: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes!: Like[];
}
