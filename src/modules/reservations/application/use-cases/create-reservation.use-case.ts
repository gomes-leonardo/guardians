import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { IReservationRepository } from '../../domain/repositories/reservation.repository.interface';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import type { IVehicleRepository } from '../../../vehicles/domain/repositories/vehicle.repository.interface';
import { ReservationEntity } from '../../domain/entities/reservation.entity';
import { ReservationDomainService } from '../../domain/services/reservation-domain.service';

export class CreateReservationUseCase {
  private readonly domainService: ReservationDomainService;

  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly userRepository: IUserRepository,
    private readonly vehicleRepository: IVehicleRepository,
  ) {
    this.domainService = new ReservationDomainService(reservationRepository);
  }

  async execute(userId: string, vehicleId: string): Promise<ReservationEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    await this.domainService.ensureUserHasNoActiveReservation(userId);
    await this.domainService.ensureVehicleIsAvailable(vehicleId);

    try {
      const reservation = new ReservationEntity(userId, vehicleId);
      return await this.reservationRepository.create(reservation);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
