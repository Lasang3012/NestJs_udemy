import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from 'decorators/user.decorator';
import { AuthGuard } from 'guards/auth.guard';
import { ProfileService } from './profile.service';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfile(
      currentUserId,
      profileUsername,
    );

    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.followProfile(
      currentUserId,
      profileUsername,
    );
    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unFollowProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUsername: string,
  ) {
    return await this.profileService.unFollowProfile(
      currentUserId,
      profileUsername,
    );
  }
}
