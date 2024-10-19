import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'The page number',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'The number of items per page',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(1000000)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'search',
    example: 'search',
  })
  @IsOptional()
  @IsString()
  search: string = ''
}

export class PaginationResultDto {
  @ApiPropertyOptional({
    description: 'The page number',
    example: 1,
  })
  currentPage: number;

  @ApiPropertyOptional({
    description: 'The number of items per page',
    example: 10,
  })
  data: any;

  @ApiPropertyOptional({
    description: 'The total number of items',
    example: 100,
  })
  count: number;

  @ApiPropertyOptional({
    description: 'The total number of pages',
    example: 10,
  })
  totalPages: number;
}
