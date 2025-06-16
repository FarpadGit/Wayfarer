import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity({ name: 'Category' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'NO ACTION' })
  creator!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Post, (post) => post.category)
  posts!: Post[];
}
