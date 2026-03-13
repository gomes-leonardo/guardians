import { NotFoundException } from '@nestjs/common';
import type { IVehicleRepository } from '../domain/repositories/vehicle.repository.interface';
import { VehicleEntity } from '../domain/entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

export class VehiclesService {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async create(dto: CreateVehicleDto): Promise<VehicleEntity> {
    const vehicle = new VehicleEntity(dto.brand, dto.model, dto.year);
    return this.vehicleRepository.create(vehicle);
  }

  async findAll(): Promise<VehicleEntity[]> {
    return this.vehicleRepository.findAll();
  }

  async findById(id: string): Promise<VehicleEntity> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<VehicleEntity> {
    if (
      dto.year !== undefined ||
      dto.brand !== undefined ||
      dto.model !== undefined
    ) {
      const existing = await this.findById(id);
      new VehicleEntity(
        dto.brand ?? existing.brand,
        dto.model ?? existing.model,
        dto.year ?? existing.year,
      );
    }

    const updated = await this.vehicleRepository.update(id, dto);
    if (!updated) throw new NotFoundException('Vehicle not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    return this.vehicleRepository.delete(id);
  }
}
