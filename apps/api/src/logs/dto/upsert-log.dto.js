import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertDailyLogDto {
  @IsString()
  @IsNotEmpty()
  did;

  @IsString()
  @IsOptional()
  blockers;

  @IsString()
  @IsOptional()
  next;
}
