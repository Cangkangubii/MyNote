import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResolveCaptureDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['task', 'note', 'log', 'discarded'])
  resolution;

  @IsOptional()
  data;
}
