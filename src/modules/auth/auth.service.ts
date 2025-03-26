import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  // Method to log in a user and return a JWT token
  async login(username: string,  apiSecret: string) {
    const user = await this.userService.findUser(username);
    if (!user) {
        throw new Error('User not found');
      }
  
      // Validate API Secret
      const isApiSecretValid = await bcrypt.compare(apiSecret, user.apiSecretHash);
      if (!isApiSecretValid) {
        throw new Error('Invalid API Secret');
      }

    // Create JWT token
    const payload = { username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,  // Return the token to the user
      user: {
        username: user.username,
        role: user.role,
      },
    };
  }
}
