import { Types } from 'mongoose';
import { ReservationEntity, ReservationStatus } from './reservation.entity';

describe('ReservationEntity', () => {
  const validUserId = new Types.ObjectId().toString();
  const validVehicleId = new Types.ObjectId().toString();

  it('should create a valid reservation with ACTIVE status by default', () => {
    const reservation = new ReservationEntity(validUserId, validVehicleId);

    expect(reservation.userId).toBe(validUserId);
    expect(reservation.vehicleId).toBe(validVehicleId);
    expect(reservation.status).toBe(ReservationStatus.ACTIVE);
    expect(reservation.isActive).toBe(true);
  });

  describe('validation', () => {
    it('should throw if userId is empty', () => {
      expect(() => new ReservationEntity('', validVehicleId)).toThrow(
        'User ID is required',
      );
    });

    it('should throw if vehicleId is empty', () => {
      expect(() => new ReservationEntity(validUserId, '')).toThrow(
        'Vehicle ID is required',
      );
    });

    it('should throw if userId is not a valid ObjectId', () => {
      expect(() => new ReservationEntity('invalid-id', validVehicleId)).toThrow(
        'User ID must be a valid ObjectId',
      );
    });

    it('should throw if vehicleId is not a valid ObjectId', () => {
      expect(() => new ReservationEntity(validUserId, 'invalid-id')).toThrow(
        'Vehicle ID must be a valid ObjectId',
      );
    });
  });

  describe('release', () => {
    it('should change status to FINISHED', () => {
      const reservation = new ReservationEntity(validUserId, validVehicleId);

      reservation.release();

      expect(reservation.status).toBe(ReservationStatus.FINISHED);
      expect(reservation.isActive).toBe(false);
    });

    it('should throw if reservation is already finished', () => {
      const reservation = new ReservationEntity(
        validUserId,
        validVehicleId,
        ReservationStatus.FINISHED,
      );

      expect(() => reservation.release()).toThrow(
        'Reservation is already finished',
      );
    });
  });
});
