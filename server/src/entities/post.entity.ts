import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Comment } from './comment.entity';
import { Image } from './image.entity';

@Entity({ name: 'Post' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  body!: string;

  @OneToMany(() => Image, (image) => image.post)
  images!: Image[];

  @ManyToOne(() => User, (user) => user.posts)
  uploader!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Category, (category) => category.posts, {
    onDelete: 'CASCADE',
  })
  category!: Category;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];
}
