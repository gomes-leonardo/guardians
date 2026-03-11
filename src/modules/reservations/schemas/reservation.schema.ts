import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Vehicle } from '../../vehicles/schemas/vehicle.schema';

export type ReservationDocument = Reservation & Document;

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: Vehicle.name, required: true })
  vehicleId: Types.ObjectId | Vehicle;

  @Prop({
    type: String,
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
