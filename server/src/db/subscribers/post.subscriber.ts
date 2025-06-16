import {
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
} from 'typeorm';
import { Post } from '../entities/post.entity';
import { deleteImageFromImageServer } from '../../services/image/imageServer.utils';

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Post> {
  listenTo() {
    return Post;
  }

  async beforeRemove(event: RemoveEvent<Post>) {
    const images = (
      await event.manager.findOne(Post, {
        where: { id: event.entity?.id },
        relations: ['images'],
        select: {
          id: true,
          images: true,
        },
      })
    )?.images;

    const imageNames = images?.map((image) => image.name) ?? [];
    if (imageNames.length > 0) deleteImageFromImageServer(imageNames);
  }
}
