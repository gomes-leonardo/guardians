import { ReservationEntity } from '../entities/reservation.entity';

export interface IReservationRepository {
  create(reservation: ReservationEntity): Promise<ReservationEntity>;
  findById(id: string): Promise<ReservationEntity | null>;
  findActiveByUserId(userId: string): Promise<ReservationEntity | null>;
  findActiveByVehicleId(vehicleId: string): Promise<ReservationEntity | null>;
  findByUserId(userId: string): Promise<ReservationEntity[]>;
  update(reservation: ReservationEntity): Promise<ReservationEntity>;
}
