import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true })
export class Vehicle {
  @ApiProperty({ example: 'Toyota' })
  @Prop({ required: true })
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @Prop({ required: true })
  model: string;

  @ApiProperty({ example: 2024 })
  @Prop({ required: true })
  year: number;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
