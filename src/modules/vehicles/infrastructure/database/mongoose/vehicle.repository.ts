import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IVehicleRepository } from '../../../domain/repositories/vehicle.repository.interface';
import { VehicleEntity } from '../../../domain/entities/vehicle.entity';
import { Vehicle, VehicleDocument } from '../../../schemas/vehicle.schema';

interface TimestampedDoc {
  createdAt?: Date;
  updatedAt?: Date;
}

function toEntity(doc: VehicleDocument): VehicleEntity {
  const ts = doc as unknown as TimestampedDoc;
  return new VehicleEntity(
    doc.brand,
    doc.model,
    doc.year,
    (doc._id as { toString(): string }).toString(),
    ts.createdAt,
    ts.updatedAt,
  );
}

@Injectable()
export class MongooseVehicleRepository implements IVehicleRepository {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
  ) {}

  async create(vehicle: VehicleEntity): Promise<VehicleEntity> {
    const created = await this.vehicleModel.create({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
    });
    return toEntity(created);
  }

  async findAll(): Promise<VehicleEntity[]> {
    const vehicles = await this.vehicleModel.find().exec();
    return vehicles.map(toEntity);
  }

  async findById(id: string): Promise<VehicleEntity | null> {
    const vehicle = await this.vehicleModel.findById(id).exec();
    if (!vehicle) return null;
    return toEntity(vehicle);
  }

  async update(
    id: string,
    data: Partial<VehicleEntity>,
  ): Promise<VehicleEntity | null> {
    const updated = await this.vehicleModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Vehicle not found');
    return toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.vehicleModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Vehicle not found');
  }
}
