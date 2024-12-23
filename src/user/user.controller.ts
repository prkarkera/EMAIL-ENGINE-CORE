import { Controller, Post, Body, Get, Query, Redirect } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('create')
  async createAccount(@Body('email') email: string) {
    return this.userService.createUserAccount(email);
  }
}
