import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { LoginBody } from '../controllers.utils';
import { UserService } from '../../services/user/user.service';

@Controller()
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Req() req: FastifyRequest,
    @Body() { userToken }: LoginBody,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    let CURRENT_USER_ID: string = '';

    if (
      userToken == null ||
      userToken.email === '' ||
      userToken.email === 'WF_GUEST'
    ) {
      CURRENT_USER_ID = this.userService.GUEST_USER_ID;
    } else {
      CURRENT_USER_ID = await this.userService.createUserIfNew({
        ...userToken,
      });
    }
    req.cookies.userId = CURRENT_USER_ID;

    res.clearCookie('userId');
    res.setCookie('userId', CURRENT_USER_ID, { path: '/' });
    return true;
  }
}
