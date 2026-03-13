import { Types } from 'mongoose';
import { ReservationDomainService } from './reservation-domain.service';
import { IReservationRepository } from '../repositories/reservation.repository.interface';
import {
  ReservationEntity,
  ReservationStatus,
} from '../entities/reservation.entity';

describe('ReservationDomainService', () => {
  let service: ReservationDomainService;
  let mockRepo: jest.Mocked<IReservationRepository>;

  const userId = new Types.ObjectId().toString();
  const vehicleId = new Types.ObjectId().toString();

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findActiveByUserId: jest.fn(),
      findActiveByVehicleId: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
    };
    service = new ReservationDomainService(mockRepo);
  });

  describe('ensureUserHasNoActiveReservation', () => {
    it('should pass when user has no active reservation', async () => {
      mockRepo.findActiveByUserId.mockResolvedValue(null);

      await expect(
        service.ensureUserHasNoActiveReservation(userId),
      ).resolves.toBeUndefined();
    });

    it('should throw when user already has an active reservation', async () => {
      mockRepo.findActiveByUserId.mockResolvedValue(
        new ReservationEntity(userId, vehicleId, ReservationStatus.ACTIVE, '1'),
      );

      await expect(
        service.ensureUserHasNoActiveReservation(userId),
      ).rejects.toThrow('User already has an active reservation');
    });
  });

  describe('ensureVehicleIsAvailable', () => {
    it('should pass when vehicle is not reserved', async () => {
      mockRepo.findActiveByVehicleId.mockResolvedValue(null);

      await expect(
        service.ensureVehicleIsAvailable(vehicleId),
      ).resolves.toBeUndefined();
    });

    it('should throw when vehicle is already reserved', async () => {
      mockRepo.findActiveByVehicleId.mockResolvedValue(
        new ReservationEntity(userId, vehicleId, ReservationStatus.ACTIVE, '1'),
      );

      await expect(service.ensureVehicleIsAvailable(vehicleId)).rejects.toThrow(
        'Vehicle is already reserved',
      );
    });
  });
});
