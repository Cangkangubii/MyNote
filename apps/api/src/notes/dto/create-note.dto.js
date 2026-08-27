import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title;

  @IsString()
  @IsNotEmpty()
  content;

  @IsArray()
  @IsOptional()
  tags;
}
