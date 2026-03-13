import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { IReservationRepository } from '../../domain/repositories/reservation.repository.interface';
import { ReservationEntity } from '../../domain/entities/reservation.entity';

export class ReleaseReservationUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(
    reservationId: string,
    userId: string,
  ): Promise<ReservationEntity> {
    const reservation =
      await this.reservationRepository.findById(reservationId);
    if (!reservation) throw new NotFoundException('Reservation not found');

    if (reservation.userId !== userId) {
      throw new ForbiddenException(
        'You can only release your own reservations',
      );
    }

    reservation.release();

    return this.reservationRepository.update(reservation);
  }
}
