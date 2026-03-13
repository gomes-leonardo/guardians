import { Types } from 'mongoose';
import { ReservationsController } from './reservations.controller';
import { CreateReservationUseCase } from '../application/use-cases/create-reservation.use-case';
import { ReleaseReservationUseCase } from '../application/use-cases/release-reservation.use-case';
import {
  ReservationEntity,
  ReservationStatus,
} from '../domain/entities/reservation.entity';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let mockCreateUseCase: jest.Mocked<Pick<CreateReservationUseCase, 'execute'>>;
  let mockReleaseUseCase: jest.Mocked<
    Pick<ReleaseReservationUseCase, 'execute'>
  >;
  let mockFindByUserId: jest.Mock;

  const userId = new Types.ObjectId().toString();
  const vehicleId = new Types.ObjectId().toString();
  const mockReq = { user: { id: userId, email: 'john@test.com' } };

  beforeEach(() => {
    mockCreateUseCase = { execute: jest.fn() };
    mockReleaseUseCase = { execute: jest.fn() };
    mockFindByUserId = jest.fn();

    controller = new ReservationsController(
      mockCreateUseCase as unknown as CreateReservationUseCase,
      mockReleaseUseCase as unknown as ReleaseReservationUseCase,
      { findByUserId: mockFindByUserId },
    );
  });

  describe('POST /reservations', () => {
    it('should create a reservation using userId from JWT', async () => {
      const reservation = new ReservationEntity(
        userId,
        vehicleId,
        ReservationStatus.ACTIVE,
        '1',
      );
      mockCreateUseCase.execute.mockResolvedValue(reservation);

      const result = await controller.create({ vehicleId }, mockReq);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(userId, vehicleId);
      expect(result.userId).toBe(userId);
      expect(result.status).toBe(ReservationStatus.ACTIVE);
    });
  });

  describe('PATCH /reservations/:id/release', () => {
    it('should release a reservation', async () => {
      const reservation = new ReservationEntity(
        userId,
        vehicleId,
        ReservationStatus.FINISHED,
        '1',
      );
      mockReleaseUseCase.execute.mockResolvedValue(reservation);

      const result = await controller.release('1', mockReq);

      expect(mockReleaseUseCase.execute).toHaveBeenCalledWith('1', userId);
      expect(result.status).toBe(ReservationStatus.FINISHED);
    });
  });

  describe('GET /reservations/my', () => {
    it('should return reservations for the authenticated user', async () => {
      const reservations = [
        new ReservationEntity(userId, vehicleId, ReservationStatus.ACTIVE, '1'),
      ];
      mockFindByUserId.mockResolvedValue(reservations);

      const result = await controller.findMy(mockReq);

      expect(mockFindByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
    });
  });
});
