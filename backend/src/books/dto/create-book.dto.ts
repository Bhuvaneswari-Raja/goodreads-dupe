import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  pages?: number;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  cover?: string;
}

export class UpdateProgressDto {
  @IsInt()
  @Min(0)
  page: number;

  @IsString()
  date: string;
}
