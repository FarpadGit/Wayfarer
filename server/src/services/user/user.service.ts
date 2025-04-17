import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { userType } from '../../types';

@Injectable()
export class UserService {
  private _ADMIN_USER_ID?: string;
  private _GUEST_USER_ID?: string;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    this.initUserIDs();
  }

  private async initUserIDs() {
    this._ADMIN_USER_ID = await this.getAdminId();
    this._GUEST_USER_ID = await this.getGuestId();
  }

  get ADMIN_USER_ID() {
    return this._ADMIN_USER_ID || '';
  }

  get GUEST_USER_ID() {
    return this._GUEST_USER_ID || '';
  }

  async getAdminId() {
    const admin = await this.userRepo.findOne({
      where: { email: 'WF_ADMIN' },
      select: { id: true },
    });
    return admin?.id;
  }

  async getGuestId() {
    const guest = await this.userRepo.findOne({
      where: { email: 'WF_GUEST' },
      select: { id: true },
    });
    return guest?.id;
  }

  async createUserIfNew(user: userType) {
    let userInDB = await this.userRepo.findOne({
      where: { email: user.email },
      select: { id: true },
    });
    if (userInDB == null) {
      const newUser = this.userRepo.create({
        email: user.email,
        name: user.name,
        oauth2_sub: user.sub,
      });
      await this.userRepo.save(newUser);
      userInDB = newUser;
    }
    return userInDB.id;
  }
}
