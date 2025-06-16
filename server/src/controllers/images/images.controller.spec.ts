import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from './images.controller';
import { ImageService } from '../../services/image/image.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { mockPost, mockUser } from '../../../test/mocks';

describe('ImagesController', () => {
  let imagesController: ImagesController;

  const mockImagesService = {
    canDeleteImage: jest.fn().mockResolvedValue(true),
  };

  let mockImageServerUtils: {
    postImagesToImageServer: (payload: string) => Promise<void>;
    deleteImageFromImageServer: (images: string[]) => Promise<void>;
  };

  const mockRequest = {
    cookies: { userId: 'fakeUserID' },
  } as unknown as FastifyRequest;

  beforeAll(async () => {
    jest.mock('../../services/image/imageServer.utils', () => {
      return {
        postImagesToImageServer: jest.fn(),
        deleteImageFromImageServer: jest.fn(),
      };
    });

    mockImageServerUtils = await import(
      '../../services/image/imageServer.utils'
    );
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [ImageService],
    })
      .overrideProvider(ImageService)
      .useValue(mockImagesService)
      .compile();

    imagesController = module.get<ImagesController>(ImagesController);
  });

  it('should be defined', () => {
    expect(imagesController).toBeDefined();
  });

  describe('create image', () => {
    const mockResponse = {
      badRequest: jest.fn().mockReturnValue('badRequest called'),
    } as unknown as FastifyReply;
    const newImageFiles = [{ name: 'fakeImage.jpg', url: 'fakeUrl' }];
    const newImageUploader = mockUser.name;

    it('should create a new attachment under a post', async () => {
      await imagesController.sendImages(
        mockRequest,
        {
          files: newImageFiles,
          uploaderName: newImageUploader,
          postId: mockPost.id,
          temporary: true,
        },
        mockResponse,
      );

      expect(mockImageServerUtils.postImagesToImageServer).toHaveBeenCalledWith(
        expect.stringMatching(
          /^(?=.*files)(?=.*uploader_id)(?=.*uploader_name)(?=.*post_id)(?=.*temporary).*$/,
        ),
      );
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
    });

    it('should return error if image parameters were wrong', async () => {
      const result = await imagesController.sendImages(
        mockRequest,
        { files: [], uploaderName: '', postId: '', temporary: true },
        mockResponse,
      );

      expect(result).toBe('badRequest called');
      expect(mockResponse.badRequest).toHaveBeenCalled();
    });
  });

  describe('delete image', () => {
    const mockResponse = {
      unauthorized: jest.fn().mockReturnValue('unauthorized called'),
    } as unknown as FastifyReply;
    const deletedImageName = 'fakeImageName.jpg';

    it('should delete an attachment', async () => {
      await imagesController.deleteImage(
        mockRequest,
        { imageName: deletedImageName },
        mockResponse,
      );

      expect(
        mockImageServerUtils.deleteImageFromImageServer,
      ).toHaveBeenCalledWith([deletedImageName]);
      expect(mockResponse.unauthorized).not.toHaveBeenCalled();
    });

    it('should return error if user is not allowed to delete attachment', async () => {
      mockImagesService.canDeleteImage.mockReturnValue(false);

      const result = await imagesController.deleteImage(
        mockRequest,
        { imageName: deletedImageName },
        mockResponse,
      );

      expect(result).toBe('unauthorized called');
      expect(mockResponse.unauthorized).toHaveBeenCalled();
    });
  });
});
