import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: 2024 })
  @IsNumber()
  year: number;
}
