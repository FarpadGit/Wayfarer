import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Post } from './post.entity';

@Entity({ name: 'Image' })
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  url!: string;

  @Column()
  thumbnail!: string;

  @ManyToOne(() => Post, (post) => post.images, { onDelete: 'CASCADE' })
  post!: Post;
}
