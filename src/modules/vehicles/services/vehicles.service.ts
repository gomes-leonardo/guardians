import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from '../schemas/vehicle.schema';

@Injectable()
export class VehiclesService {
  constructor(@InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>) {}
}
