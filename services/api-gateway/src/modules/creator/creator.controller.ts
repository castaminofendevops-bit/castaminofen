import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
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

@ApiTags('Creators')
@Controller('creators')
export class CreatorController {
  constructor(private creatorService: CreatorService) {}

  @Post('request')
  @Auth()
  @UseInterceptors(FileInterceptor('idFile'))
  @ApiOperation({ summary: 'درخواست تبدیل به تولیدکننده (ارسال مدارک)' })
  async request(@CurrentUser('id') userId: string, @UploadedFile() file?: Express.Multer.File) {
    // Parse body from multipart form-data via request object is handled by Nest; here we access raw body via decorators isn't straightforward.
    // Simpler: access properties from (global) request — but for this stub, accept that client sends fields as text fields and Nest maps them to body.
    // To keep controller simple, read from (global) arguments via request? For now, rely on multer to provide file and expect fields in req.body.
    // Using any to avoid strict typing issues.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reqAny: any = (arguments as any)[0];
    const body: RequestCreatorDto = reqAny?.body ?? {};

    const result = await this.creatorService.requestCreator(userId, {
      fullName: body.fullName || '',
      bio: body.bio,
      sampleUrl: body.sampleUrl,
    }, file);

    return successResponse(result);
  }
}
