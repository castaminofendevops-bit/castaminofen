import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class ImportRssDto {
  @ApiProperty({ description: 'فایل feeds.txt یا لیست URLها به صورت JSON array', example: ['https://feed.podbean.com/RadioRaah/feed.xml'] })
  @IsOptional()
  @IsString({ each: true })
  feeds?: string[];

  @ApiPropertyOptional({ description: 'در صورت نیاز، نگاشت feed_url به ایمیل مالک', example: { 'https://feed.podbean.com/RadioRaah/feed.xml': 'podcaster@example.com' } })
  @IsOptional()
  @IsObject()
  emailMap?: Record<string, string>;

  @ApiPropertyOptional({ description: 'دامنه برای ایمیل ساختگی', example: 'castaminofen.ir' })
  @IsOptional()
  @IsString()
  emailDomain?: string;

  @ApiPropertyOptional({ description: 'فقط پیش‌نمایش، بدون ذخیره در پایگاه داده', example: true })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;

  @ApiPropertyOptional({ description: 'اگر آیتم موجود باشد، آن را skip کن', example: true })
  @IsOptional()
  @IsBoolean()
  skipExisting?: boolean;

  @ApiPropertyOptional({ description: 'حداکثر اپیزود برای هر فید (0 = همه)', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  limitEpisodes?: number;
}

export class ImportRssResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: Object })
  data: unknown;
}

export class FeedQueryDto {
  @ApiPropertyOptional({ description: 'کش TTL بر حسب ثانیه', example: 3600 })
  @IsOptional()
  @IsInt()
  @Min(0)
  ttl?: number;
}
