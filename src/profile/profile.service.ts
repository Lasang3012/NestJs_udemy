import { ProfileResponseInterface } from './types/profileResponse.interface';
import { UserEntity } from '@app/user/user.entity';
import { ProfileController } from './profile.controller';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileType } from './types/profile.type';
import { Repository } from 'typeorm';
import { profile } from 'console';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRespository: Repository<UserEntity>,

    @InjectRepository(FollowEntity)
    private readonly followResposiroty: Repository<FollowEntity>,
  ) {}

  async getProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRespository.findOne({
      where: {
        username: profileUsername,
      },
    });

    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    const follow = await this.followResposiroty.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });

    return { ...user, following: Boolean(follow) };
  }

  async followProfile(currentUserId: number, profileUsername: string) {
    const user = await this.userRespository.findOne({
      where: { username: profileUsername },
    });

    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === user.id) {
      const error = "Follower and Following can't be equal";
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }

    const follow = await this.followResposiroty.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = currentUserId;
      followToCreate.followingId = user.id;
      await this.followResposiroty.save(followToCreate);
    }

    return { ...user, following: true };
  }

  async unFollowProfile(currentUserId: number, profileUsername: string) {
    const user = await this.userRespository.findOne({
      where: { username: profileUsername },
    });

    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === user.id) {
      const error = "Follower and Following can't be equal";
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }

    await this.followResposiroty.delete({
      followerId: currentUserId,
      followingId: user.id,
    });
    return { ...user, flowwing: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return { profile };
  }
}
