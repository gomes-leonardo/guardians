import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsController } from './controllers/reservations.controller';
import { CreateReservationUseCase } from './application/use-cases/create-reservation.use-case';
import { ReleaseReservationUseCase } from './application/use-cases/release-reservation.use-case';
import { MongooseReservationRepository } from './infrastructure/database/mongoose/reservation.repository';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import { UsersModule } from '../users/users.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { MongooseUserRepository } from '../users/infrastructure/database/mongoose/user.repository';
import { MongooseVehicleRepository } from '../vehicles/infrastructure/database/mongoose/vehicle.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
    ]),
    UsersModule,
    VehiclesModule,
  ],
  controllers: [ReservationsController],
  providers: [
    MongooseReservationRepository,
    {
      provide: CreateReservationUseCase,
      useFactory: (
        reservationRepo: MongooseReservationRepository,
        userRepo: MongooseUserRepository,
        vehicleRepo: MongooseVehicleRepository,
      ) => new CreateReservationUseCase(reservationRepo, userRepo, vehicleRepo),
      inject: [
        MongooseReservationRepository,
        MongooseUserRepository,
        MongooseVehicleRepository,
      ],
    },
    {
      provide: ReleaseReservationUseCase,
      useFactory: (repo: MongooseReservationRepository) =>
        new ReleaseReservationUseCase(repo),
      inject: [MongooseReservationRepository],
    },
    {
      provide: 'FIND_BY_USER_ID',
      useExisting: MongooseReservationRepository,
    },
  ],
})
export class ReservationsModule {}
