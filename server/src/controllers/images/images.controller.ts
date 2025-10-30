import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ImagesBody } from '../controllers.utils';
import { ImageService } from '../../services/image/image.service';
import { FastifyRequest, FastifyReply } from 'fastify';

@Controller('images')
export class ImagesController {
  constructor(private imageService: ImageService) {}

  @Post()
  async sendImages(
    @Req() req: FastifyRequest,
    @Body() { files, folder, uploaderName, postId, temporary }: ImagesBody,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    if (!files || files.length == 0 || !uploaderName || !postId)
      return res.badRequest('Rosszul megadott paraméterek!');

    const payload = JSON.stringify({
      files,
      folder,
      uploader_id: req.cookies.userId!,
      uploader_name: uploaderName,
      post_id: postId,
      temporary,
    });

    // for mocking reasons these helper functions should be imported inline
    const postImagesToImageServer = (
      await import('../../services/image/imageServer.utils')
    ).postImagesToImageServer;
    await postImagesToImageServer(payload);

    return true;
  }

  @Delete()
  @HttpCode(204)
  async deleteImage(
    @Req() req: FastifyRequest,
    @Body() { imageName }: { imageName: string },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const canDelete = await this.imageService.canDeleteImage(
      imageName,
      req.cookies.userId!,
    );

    if (canDelete == false)
      return res.unauthorized('Nincs jogosultságod törölni ezt a csatolmányt!');

    const deleteImageFromImageServer = (
      await import('../../services/image/imageServer.utils')
    ).deleteImageFromImageServer;
    await deleteImageFromImageServer([imageName]);

    return true;
  }
}
