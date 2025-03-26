import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(@Body() loginDto: { username: string, apiSecret: string }) {
    return await this.authService.login(loginDto.username, loginDto.apiSecret);
  }
}
