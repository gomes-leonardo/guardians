import { Types } from 'mongoose';

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export class ReservationEntity {
  constructor(
    public readonly userId: string,
    public readonly vehicleId: string,
    public status: ReservationStatus = ReservationStatus.ACTIVE,
    public readonly id?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    this.validate();
  }

  private validate() {
    if (!this.userId) throw new Error('User ID is required');
    if (!this.vehicleId) throw new Error('Vehicle ID is required');

    if (!Types.ObjectId.isValid(this.userId)) {
      throw new Error('User ID must be a valid ObjectId');
    }
    if (!Types.ObjectId.isValid(this.vehicleId)) {
      throw new Error('Vehicle ID must be a valid ObjectId');
    }
  }

  release(): void {
    if (this.status === ReservationStatus.FINISHED) {
      throw new Error('Reservation is already finished');
    }
    this.status = ReservationStatus.FINISHED;
  }

  get isActive(): boolean {
    return this.status === ReservationStatus.ACTIVE;
  }
}
