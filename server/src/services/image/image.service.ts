import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../../db/entities/image.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image) private readonly imageRepo: Repository<Image>,
    private userService: UserService,
  ) {}

  async getImageOwnerId(id: string) {
    const image = await this.imageRepo.findOne({
      where: { id },
      relations: ['post', 'post.uploader'],
      select: { post: { uploader: { id: true } } },
    });

    return image?.post.uploader.id;
  }

  async canDeleteImage(id: string, userId: string) {
    const ownerId = await this.getImageOwnerId(id);
    if (ownerId !== userId && userId !== this.userService.ADMIN_USER_ID)
      return false;
    return true;
  }
}
