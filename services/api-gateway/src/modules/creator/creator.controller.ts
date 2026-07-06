import { Controller, Post, UploadedFile, UseInterceptors, Req, Get, Patch, Param, Body } from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreatorService } from './creator.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/utils/response.util';

class RequestCreatorDto {
  fullName!: string;
  bio?: string;
  sampleUrl?: string;
}

class ReviewRequestDto {
  action!: 'APPROVE' | 'REJECT';
  reviewComment?: string;
}

@ApiTags('Creators')
@Controller('creators')
export class CreatorController {
  constructor(private creatorService: CreatorService) {}

  @Post('request')
  @Auth()
  @UseInterceptors(FileInterceptor('idFile'))
  @ApiOperation({ summary: 'درخواست تبدیل به تولیدکننده (ارسال مدارک)' })
  async request(
    @CurrentUser('id') userId: string,
    @UploadedFile() file?: Express.Multer.File,
    @Req() req?: Request,
  ) {
    const body = (req?.body ?? {}) as RequestCreatorDto;

    const result = await this.creatorService.requestCreator(userId, {
      fullName: body.fullName || '',
      bio: body.bio,
      sampleUrl: body.sampleUrl,
    }, file);

    return successResponse(result);
  }

  @Get('request')
  @Auth()
  @ApiOperation({ summary: 'وضعیت درخواست تبدیل به سازنده خود' })
  async getMyRequest(@CurrentUser('id') userId: string) {
    return successResponse(await this.creatorService.getMyRequest(userId));
  }

  @Get('requests')
  @Auth('ADMIN')
  @ApiOperation({ summary: 'لیست درخواست‌های تبدیل به سازنده' })
  async getRequests() {
    return successResponse(await this.creatorService.getRequests());
  }

  @Patch('requests/:id/review')
  @Auth('ADMIN')
  @ApiOperation({ summary: 'بررسی و تایید یا رد درخواست تبدیل به سازنده' })
  async reviewRequest(@Param('id') id: string, @Body() dto: ReviewRequestDto) {
    return successResponse(await this.creatorService.reviewRequest(id, dto.action, dto.reviewComment));
  }
}
