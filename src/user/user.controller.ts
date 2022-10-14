import { UpdateUserDto } from './dto/updateUser.dto';
import { AuthGuard } from './../../guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import { ExpressRequest } from './../../types/expressRequest.interface';
import { LoginUserDto } from './dto/loginUser.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { UserService } from '@app/user/user.service';
import { Request } from 'express';
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { User } from 'decorators/user.decorator';

@Controller()
export class UserController {
  constructor(private readonly userSerive: UserService) {}

  @Post('users')
  @UsePipes(new ValidationPipe())
  async createUser(@Body() createUserDto: CreateUserDto): Promise<any> {
    const user = await this.userSerive.createUser(createUserDto);
    return this.userSerive.buildUserResponse(user);
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.userSerive.login(loginUserDto);
    return this.userSerive.buildUserResponse(user);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(@Req() request: ExpressRequest, @User() user: UserEntity) {
    // console.log('request ttttttt', request);
    // console.log('aaaaaaaaa ', user);
    return this.userSerive.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User('id') currentUserId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userSerive.updateUser(currentUserId, updateUserDto);
    return this.userSerive.buildUserResponse(user);
  }
}
