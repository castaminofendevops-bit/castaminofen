import { IsString, IsOptional, IsEnum, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @ApiProperty()
  @IsString()
  q!: string;

  @ApiPropertyOptional({ enum: ['PODCAST', 'AUDIOBOOK', 'VIDEO'] })
  @IsOptional()
  @IsEnum(['PODCAST', 'AUDIOBOOK', 'VIDEO'])
  type?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class ExploreQueryDto {
  @ApiPropertyOptional({ enum: ['PODCAST', 'AUDIOBOOK', 'VIDEO'] })
  @IsOptional()
  @IsEnum(['PODCAST', 'AUDIOBOOK', 'VIDEO'])
  type?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class CreateContentDto {
  @ApiProperty({ enum: ['PODCAST', 'AUDIOBOOK', 'VIDEO'] })
  @IsEnum(['PODCAST', 'AUDIOBOOK', 'VIDEO'])
  type!: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  price?: number;
}

export class CreateEpisodeDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  episodeNumber!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVideo?: boolean;
}

export class CreatorUploadUrlDto {
  @ApiProperty({ example: 'episode-01.mp3' })
  @IsString()
  fileName!: string;

  @ApiProperty({ example: 'audio/mpeg' })
  @IsString()
  contentType!: string;
}
