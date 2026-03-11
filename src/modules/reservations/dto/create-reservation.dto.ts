import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../schemas/reservation.schema';

export class CreateReservationDto {
  @ApiProperty({ example: '60d5ecb8b392d7001f11b999' })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '60d5ecb8b392d7001f11b99a' })
  @IsMongoId()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty({ enum: ReservationStatus, default: ReservationStatus.ACTIVE })
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
