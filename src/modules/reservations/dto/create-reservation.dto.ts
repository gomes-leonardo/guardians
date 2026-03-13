import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({
    example: '60d5ecb8b392d7001f11b99a',
    description: 'ID of the vehicle to reserve',
  })
  @IsMongoId()
  @IsNotEmpty()
  vehicleId: string;
}
