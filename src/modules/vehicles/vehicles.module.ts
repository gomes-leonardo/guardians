import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehiclesController } from './controllers/vehicles.controller';
import { VehiclesService } from './services/vehicles.service';
import { MongooseVehicleRepository } from './infrastructure/database/mongoose/vehicle.repository';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }]),
  ],
  controllers: [VehiclesController],
  providers: [
    MongooseVehicleRepository,
    {
      provide: VehiclesService,
      useFactory: (repo: MongooseVehicleRepository) =>
        new VehiclesService(repo),
      inject: [MongooseVehicleRepository],
    },
  ],
  exports: [VehiclesService],
})
export class VehiclesModule {}
