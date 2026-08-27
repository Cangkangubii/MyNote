import {
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title;

  @IsString()
  @IsOptional()
  description;

  @IsIn(['todo', 'in_progress', 'blocked', 'done'])
  @IsOptional()
  status;

  @IsDateString()
  @IsOptional()
  dueDate;

  @IsArray()
  @IsOptional()
  tags;
}
