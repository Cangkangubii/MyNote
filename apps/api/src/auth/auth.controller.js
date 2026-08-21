import {
  Body,
  Controller,
  Dependencies,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

@Controller('auth')
@Dependencies(AuthService)
export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  @Post('register')
  async register(@Body() registerDto) {
    const user = await this.authService.register(registerDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Registration successful',
      data: { user },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto, @Res({ passthrough: true }) res) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);
    this.setRefreshCookie(res, refreshToken);
    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: { access_token: accessToken },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req, @Res({ passthrough: true }) res) {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    const { accessToken, refreshToken } = await this.authService.refresh(rawRefreshToken);
    this.setRefreshCookie(res, refreshToken);
    return {
      statusCode: HttpStatus.OK,
      message: 'Token refreshed',
      data: { access_token: accessToken },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await this.authService.logout(rawRefreshToken);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
    return {
      statusCode: HttpStatus.OK,
      message: 'Logout successful',
      data: null,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Current user retrieved',
      data: { user },
    };
  }

  setRefreshCookie(res, token) {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });
  }
}