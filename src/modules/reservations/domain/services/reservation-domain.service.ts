import { ConflictException } from '@nestjs/common';
import type { IReservationRepository } from '../repositories/reservation.repository.interface';

export class ReservationDomainService {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async ensureUserHasNoActiveReservation(userId: string): Promise<void> {
    const active = await this.reservationRepository.findActiveByUserId(userId);
    if (active) {
      throw new ConflictException('User already has an active reservation');
    }
  }

  async ensureVehicleIsAvailable(vehicleId: string): Promise<void> {
    const active =
      await this.reservationRepository.findActiveByVehicleId(vehicleId);
    if (active) {
      throw new ConflictException('Vehicle is already reserved');
    }
  }
}
