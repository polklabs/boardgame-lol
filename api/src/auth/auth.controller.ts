import {
  Body,
  Post,
  Controller,
  UseGuards,
  UnauthorizedException,
  Request,
  Param,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from './auth.guard';
import { ThrottlerBehindProxyGuard } from 'src/guards/throttler-behind-proxy.guard';
import { UserManager } from 'src/managers/User.manager';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ClubUserManager } from 'src/managers/ClubUser.manager';
import { ValidationError } from 'src/errors/validation.error';
import { AuthorizationError } from 'src/errors/authorization.error';

const validateThrottle = { default: { limit: 5, ttl: 300000 } }; // 5 tries in 5 minutes
const secureThrottle = { default: { limit: 5, ttl: 60000 } }; // 5 tries per minute
const shortThrottle = { default: { limit: 30, ttl: 60000 } }; // 30 tries per minute
const longThrottle = { default: { limit: 120, ttl: 60000 } }; // 120 per minute

@UseGuards(ThrottlerBehindProxyGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userManager: UserManager,
    private clubUserManager: ClubUserManager,
  ) {}

  getUserId(request: any) {
    if (request['user']) {
      return request['user'].userId;
    } else {
      throw new UnauthorizedException();
    }
  }

  handleErrors(e: any) {
    if (e instanceof ValidationError) {
      throw new HttpException(e.message, HttpStatus.UNPROCESSABLE_ENTITY);
    } else if (e instanceof AuthorizationError) {
      throw new HttpException(e.message, HttpStatus.UNAUTHORIZED);
    } else {
      console.error(e);
      throw new HttpException(e.toString(), HttpStatus.BAD_REQUEST);
    }
  }

  // @Throttle(secureThrottle)
  @Post('signup')
  async signup(@Body() signupDto: Record<string, any>) {
    try {
      return await this.authService.signup(signupDto.Email, signupDto.Username, signupDto.Password);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(secureThrottle)
  @Post('login')
  async signIn(@Body() signInDto: Record<string, any>) {
    try {
      return await this.authService.signIn(signInDto.Username, signInDto.Password, signInDto.RememberMe);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(validateThrottle)
  @Post('login_verify')
  async verifyEmail(@Body() signInDto: Record<string, any>) {
    try {
      return await this.authService.verifyEmail(
        signInDto.Username,
        signInDto.Password,
        signInDto.RememberMe,
        signInDto.Verification,
      );
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(secureThrottle)
  @Post('reset_password_request')
  async resetPasswordRequest(@Body() passResetDto: Record<string, any>) {
    try {
      return await this.authService.resetPasswordRequest(passResetDto.Username);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(validateThrottle)
  @Post('reset_password_check')
  resetPasswordCheck(@Body() passResetDto: Record<string, any>) {
    try {
      return this.authService.resetPasswordCheck(passResetDto.Username, passResetDto.Verification);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(validateThrottle)
  @Post('reset_password')
  async resetPassword(@Body() passResetDto: Record<string, any>) {
    try {
      return await this.authService.resetPassword(
        passResetDto.Username,
        passResetDto.Verification,
        passResetDto.Password,
      );
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(secureThrottle)
  @UseGuards(AuthGuard)
  @Post('change_password')
  changePassword(@Request() req: any, @Body() passChangeDto: Record<string, any>) {
    return this.authService.changePassword(this.getUserId(req), passChangeDto.CurrentPassword, passChangeDto.Password);
  }

  @Throttle(longThrottle)
  @Get('username_check/:username')
  checkUsername(@Param() params: { username: string }) {
    try {
      return this.userManager.isUsernameUnique(params.username);
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @Throttle(shortThrottle)
  @Get('passwords_common')
  commonPasswords() {
    try {
      if (process.env.NODE_ENV === 'development') {
        const file = readFileSync(join(process.cwd(), 'src/assets/1000_common_passwords.json'), 'utf8');
        return file;
      } else {
        const file = readFileSync('/app/data/1000_common_passwords.json', 'utf8');
        return file;
      }
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @UseGuards(AuthGuard)
  @Get('club_access')
  getClubAccess(@Request() req: any) {
    try {
      return this.clubUserManager.loadManyWithName(this.getUserId(req)).map((x) => ({ id: x.ClubId, name: x.Name }));
    } catch (e) {
      this.handleErrors(e);
    }
  }

  @UseGuards(AuthGuard)
  @Get('club_access_admin')
  getClubAccessAdmin(@Request() req: any) {
    try {
      return this.clubUserManager.loadManyWithAdmin(this.getUserId(req)).map((x) => x.ClubId);
    } catch (e) {
      this.handleErrors(e);
    }
  }
}
