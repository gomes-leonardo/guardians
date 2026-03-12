import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { User } from '../../users/infrastructure/database/mongoose/user.schema';
import { Vehicle } from '../../vehicles/schemas/vehicle.schema';

export type ReservationDocument = Reservation & Document;

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

@Schema({ timestamps: true })
export class Reservation {
  @ApiProperty({ example: '60d5ecb8b392d7001f11b999' })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId | User;

  @ApiProperty({ example: '60d5ecb8b392d7001f11b99a' })
  @Prop({ type: Types.ObjectId, ref: Vehicle.name, required: true })
  vehicleId: Types.ObjectId | Vehicle;

  @ApiProperty({ enum: ReservationStatus, example: ReservationStatus.ACTIVE })
  @Prop({
    type: String,
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
