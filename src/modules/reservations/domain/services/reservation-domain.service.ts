import {
  DomainException,
  DomainErrorCode,
} from '../../../../common/exceptions/domain.exception';
import type { IReservationRepository } from '../repositories/reservation.repository.interface';

export class ReservationDomainService {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async ensureUserHasNoActiveReservation(userId: string): Promise<void> {
    const active = await this.reservationRepository.findActiveByUserId(userId);
    if (active) {
      throw new DomainException(
        'User already has an active reservation',
        DomainErrorCode.CONFLICT,
      );
    }
  }

  async ensureVehicleIsAvailable(vehicleId: string): Promise<void> {
    const active =
      await this.reservationRepository.findActiveByVehicleId(vehicleId);
    if (active) {
      throw new DomainException(
        'Vehicle is already reserved',
        DomainErrorCode.CONFLICT,
      );
    }
  }
}
