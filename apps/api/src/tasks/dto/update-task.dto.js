import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
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
