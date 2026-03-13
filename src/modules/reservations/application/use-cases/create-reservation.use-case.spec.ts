import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateReservationUseCase } from './create-reservation.use-case';
import { IReservationRepository } from '../../domain/repositories/reservation.repository.interface';
import { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { IVehicleRepository } from '../../../vehicles/domain/repositories/vehicle.repository.interface';
import {
  ReservationEntity,
  ReservationStatus,
} from '../../domain/entities/reservation.entity';
import { User } from '../../../users/domain/entities/user.entity';
import { VehicleEntity } from '../../../vehicles/domain/entities/vehicle.entity';

describe('CreateReservationUseCase', () => {
  let useCase: CreateReservationUseCase;
  let mockReservationRepo: jest.Mocked<IReservationRepository>;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockVehicleRepo: jest.Mocked<IVehicleRepository>;

  const userId = new Types.ObjectId().toString();
  const vehicleId = new Types.ObjectId().toString();

  beforeEach(() => {
    mockReservationRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findActiveByUserId: jest.fn(),
      findActiveByVehicleId: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
    };
    mockUserRepo = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    mockVehicleRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateReservationUseCase(
      mockReservationRepo,
      mockUserRepo,
      mockVehicleRepo,
    );
  });

  it('should create a reservation successfully', async () => {
    mockUserRepo.findById.mockResolvedValue(
      new User('John', 'john@test.com', undefined, userId),
    );
    mockVehicleRepo.findById.mockResolvedValue(
      new VehicleEntity('Toyota', 'Corolla', 2024, vehicleId),
    );
    mockReservationRepo.findActiveByUserId.mockResolvedValue(null);
    mockReservationRepo.findActiveByVehicleId.mockResolvedValue(null);
    mockReservationRepo.create.mockImplementation((r) =>
      Promise.resolve(
        new ReservationEntity(r.userId, r.vehicleId, r.status, '1'),
      ),
    );

    const result = await useCase.execute(userId, vehicleId);

    expect(result.id).toBe('1');
    expect(result.userId).toBe(userId);
    expect(result.vehicleId).toBe(vehicleId);
    expect(result.status).toBe(ReservationStatus.ACTIVE);
  });

  it('should throw NotFoundException when user does not exist', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(userId, vehicleId)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockReservationRepo.create).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when vehicle does not exist', async () => {
    mockUserRepo.findById.mockResolvedValue(
      new User('John', 'john@test.com', undefined, userId),
    );
    mockVehicleRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(userId, vehicleId)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockReservationRepo.create).not.toHaveBeenCalled();
  });

  it('should throw when user already has an active reservation', async () => {
    mockUserRepo.findById.mockResolvedValue(
      new User('John', 'john@test.com', undefined, userId),
    );
    mockVehicleRepo.findById.mockResolvedValue(
      new VehicleEntity('Toyota', 'Corolla', 2024, vehicleId),
    );
    mockReservationRepo.findActiveByUserId.mockResolvedValue(
      new ReservationEntity(userId, vehicleId, ReservationStatus.ACTIVE, '1'),
    );

    await expect(useCase.execute(userId, vehicleId)).rejects.toThrow(
      'User already has an active reservation',
    );
    expect(mockReservationRepo.create).not.toHaveBeenCalled();
  });

  it('should throw when vehicle is already reserved', async () => {
    const otherUserId = new Types.ObjectId().toString();
    mockUserRepo.findById.mockResolvedValue(
      new User('John', 'john@test.com', undefined, userId),
    );
    mockVehicleRepo.findById.mockResolvedValue(
      new VehicleEntity('Toyota', 'Corolla', 2024, vehicleId),
    );
    mockReservationRepo.findActiveByUserId.mockResolvedValue(null);
    mockReservationRepo.findActiveByVehicleId.mockResolvedValue(
      new ReservationEntity(
        otherUserId,
        vehicleId,
        ReservationStatus.ACTIVE,
        '2',
      ),
    );

    await expect(useCase.execute(userId, vehicleId)).rejects.toThrow(
      'Vehicle is already reserved',
    );
    expect(mockReservationRepo.create).not.toHaveBeenCalled();
  });
});
