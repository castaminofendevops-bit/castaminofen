import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService, CreatePlaylistDto, AddToPlaylistDto } from './user.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/utils/response.util';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('follow/:creatorId')
  @Auth()
  @ApiOperation({ summary: 'دنبال کردن سازنده' })
  async follow(@CurrentUser('id') userId: string, @Param('creatorId') creatorId: string) {
    return successResponse(await this.userService.followCreator(userId, creatorId));
  }

  @Delete('follow/:creatorId')
  @Auth()
  @ApiOperation({ summary: 'لغو دنبال' })
  async unfollow(@CurrentUser('id') userId: string, @Param('creatorId') creatorId: string) {
    return successResponse(await this.userService.unfollowCreator(userId, creatorId));
  }

  @Get('following')
  @Auth()
  @ApiOperation({ summary: 'لیست دنبال‌شده‌ها' })
  async following(@CurrentUser('id') userId: string) {
    return successResponse(await this.userService.getFollowing(userId));
  }

  @Post('library/:contentId')
  @Auth()
  @ApiOperation({ summary: 'افزودن به کتابخانه' })
  async addLibrary(@CurrentUser('id') userId: string, @Param('contentId') contentId: string) {
    return successResponse(await this.userService.addToLibrary(userId, contentId));
  }

  @Delete('library/:contentId')
  @Auth()
  @ApiOperation({ summary: 'حذف از کتابخانه' })
  async removeLibrary(@CurrentUser('id') userId: string, @Param('contentId') contentId: string) {
    return successResponse(await this.userService.removeFromLibrary(userId, contentId));
  }

  @Get('library')
  @Auth()
  @ApiOperation({ summary: 'کتابخانه' })
  async library(@CurrentUser('id') userId: string) {
    return successResponse(await this.userService.getLibrary(userId));
  }

  @Post('playlists')
  @Auth()
  @ApiOperation({ summary: 'ایجاد پلی‌لیست' })
  async createPlaylist(@CurrentUser('id') userId: string, @Body() dto: CreatePlaylistDto) {
    return successResponse(await this.userService.createPlaylist(userId, dto));
  }

  @Get('playlists')
  @Auth()
  @ApiOperation({ summary: 'لیست پلی‌لیست‌ها' })
  async playlists(@CurrentUser('id') userId: string) {
    return successResponse(await this.userService.getPlaylists(userId));
  }

  @Get('playlists/:id')
  @Auth()
  @ApiOperation({ summary: 'جزئیات پلی‌لیست' })
  async playlist(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return successResponse(await this.userService.getPlaylist(userId, id));
  }

  @Post('playlists/:id/items')
  @Auth()
  @ApiOperation({ summary: 'افزودن به پلی‌لیست' })
  async addItem(
    @CurrentUser('id') userId: string,
    @Param('id') playlistId: string,
    @Body() dto: AddToPlaylistDto,
  ) {
    return successResponse(await this.userService.addToPlaylist(userId, playlistId, dto.episodeId));
  }
}
