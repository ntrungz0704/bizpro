import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: true, description: 'Indicates operation success' })
  success!: boolean;

  @ApiProperty({ example: 200, description: 'HTTP Status Code' })
  statusCode!: number;

  data!: T;

  @ApiProperty({
    example: '2026-11-04T15:00:00.000Z',
    description: 'ISO-8601 Timestamp of response',
  })
  timestamp!: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false, description: 'Indicates failure' })
  success!: boolean;

  @ApiProperty({ example: 400, description: 'HTTP Status Code' })
  statusCode!: number;

  @ApiProperty({ example: 'Bad Request', description: 'Error Type or Name' })
  error!: string;

  @ApiProperty({
    example: 'Validation failed or resource not found',
    description: 'Error explanation or array of validation issues',
  })
  message!: string | string[];

  @ApiProperty({
    example: '2026-11-04T15:00:00.000Z',
    description: 'ISO-8601 Timestamp of error',
  })
  timestamp!: string;

  @ApiProperty({ example: '/api/v1/resource', description: 'Request path' })
  path!: string;
}
