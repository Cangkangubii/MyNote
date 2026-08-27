import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title;

  @IsString()
  @IsOptional()
  content;

  @IsArray()
  @IsOptional()
  tags;
}
