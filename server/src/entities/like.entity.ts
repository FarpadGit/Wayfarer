import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';

@Entity({ name: 'Like' })
export class Like {
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @PrimaryColumn({
    name: 'userId',
    type: 'text',
    primaryKeyConstraintName: 'like_PK',
  })
  user!: User | string;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  @PrimaryColumn({
    name: 'commentId',
    type: 'text',
    primaryKeyConstraintName: 'like_PK',
  })
  comment!: Comment | string;
}
