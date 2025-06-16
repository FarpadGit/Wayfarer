import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';
import { Like } from './like.entity';

@Entity({ name: 'Comment' })
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  message!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post!: Post;

  @ManyToOne(() => Comment, (parent) => parent.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ foreignKeyConstraintName: 'ParentChildComment' })
  parent?: Comment;

  @OneToMany(() => Comment, (children) => children.id)
  @JoinColumn({ foreignKeyConstraintName: 'ParentChildComment' })
  children: Comment[];

  @OneToMany(() => Like, (like) => like.comment)
  likes!: Like[];
}
