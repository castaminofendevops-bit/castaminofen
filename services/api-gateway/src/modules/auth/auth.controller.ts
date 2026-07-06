import { Controller, Post, Get, Body, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, UpdateProfileDto } from './auth.dto';
import { Auth, Public } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/utils/response.util';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'ثبت‌نام کاربر جدید' })
  async register(@Body() dto: RegisterDto) {
    return successResponse(await this.authService.register(dto));
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'ورود' })
  async login(@Body() dto: LoginDto) {
    return successResponse(await this.authService.login(dto));
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'تازه‌سازی توکن' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return successResponse(await this.authService.refresh(dto.refreshToken));
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'پروفایل کاربر' })
  async me(@CurrentUser('id') userId: string) {
    return successResponse(await this.authService.getProfile(userId));
  }

  @Patch('me')
  @Auth()
  @ApiOperation({ summary: 'به‌روزرسانی پروفایل' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, email: true, displayName: true, avatarUrl: true },
    });
    return successResponse(user);
  }
}
