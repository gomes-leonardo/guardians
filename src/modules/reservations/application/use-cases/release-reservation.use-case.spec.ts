import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ReleaseReservationUseCase } from './release-reservation.use-case';
import { IReservationRepository } from '../../domain/repositories/reservation.repository.interface';
import {
  ReservationEntity,
  ReservationStatus,
} from '../../domain/entities/reservation.entity';

describe('ReleaseReservationUseCase', () => {
  let useCase: ReleaseReservationUseCase;
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
    useCase = new ReleaseReservationUseCase(mockRepo);
  });

  it('should release an active reservation', async () => {
    const reservation = new ReservationEntity(
      userId,
      vehicleId,
      ReservationStatus.ACTIVE,
      '1',
    );
    mockRepo.findById.mockResolvedValue(reservation);
    mockRepo.update.mockImplementation((r) => Promise.resolve(r));

    const result = await useCase.execute('1', userId);

    expect(result.status).toBe(ReservationStatus.FINISHED);
    expect(mockRepo.update).toHaveBeenCalled();
  });

  it('should throw NotFoundException when reservation does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('999', userId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException when user does not own the reservation', async () => {
    const otherUserId = new Types.ObjectId().toString();
    const reservation = new ReservationEntity(
      otherUserId,
      vehicleId,
      ReservationStatus.ACTIVE,
      '1',
    );
    mockRepo.findById.mockResolvedValue(reservation);

    await expect(useCase.execute('1', userId)).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('should throw when reservation is already finished', async () => {
    const reservation = new ReservationEntity(
      userId,
      vehicleId,
      ReservationStatus.FINISHED,
      '1',
    );
    mockRepo.findById.mockResolvedValue(reservation);

    await expect(useCase.execute('1', userId)).rejects.toThrow(
      'Reservation is already finished',
    );
  });
});
