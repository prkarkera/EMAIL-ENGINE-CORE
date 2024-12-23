import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Get('callback')
  async handleOAuthCallback(@Query('code') code: string) {
    return await this.authService.handleOAuthCallback(code);
  }
}
