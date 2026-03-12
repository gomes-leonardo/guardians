import { VehicleEntity } from '../entities/vehicle.entity';

export interface IVehicleRepository {
  create(vehicle: VehicleEntity): Promise<VehicleEntity>;
  findAll(): Promise<VehicleEntity[]>;
  findById(id: string): Promise<VehicleEntity | null>;
  update(
    id: string,
    vehicle: Partial<VehicleEntity>,
  ): Promise<VehicleEntity | null>;
  delete(id: string): Promise<void>;
}
