import { NotFoundException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { IVehicleRepository } from '../domain/repositories/vehicle.repository.interface';
import { VehicleEntity } from '../domain/entities/vehicle.entity';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let mockRepo: jest.Mocked<IVehicleRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new VehiclesService(mockRepo);
  });

  describe('create', () => {
    it('should validate and create a vehicle', async () => {
      const dto = { brand: 'Toyota', model: 'Corolla', year: 2024 };
      mockRepo.create.mockImplementation((v) =>
        Promise.resolve(new VehicleEntity(v.brand, v.model, v.year, '1')),
      );

      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalled();
      expect(result.id).toBe('1');
      expect(result.brand).toBe('Toyota');
    });

    it('should fail-fast if year is invalid', async () => {
      const dto = { brand: 'Toyota', model: 'Corolla', year: 1800 };

      await expect(service.create(dto)).rejects.toThrow(
        'Vehicle year cannot be earlier than 1900',
      );
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all vehicles', async () => {
      const vehicles = [
        new VehicleEntity('Toyota', 'Corolla', 2024, '1'),
        new VehicleEntity('Honda', 'Civic', 2023, '2'),
      ];
      mockRepo.findAll.mockResolvedValue(vehicles);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return a vehicle by id', async () => {
      mockRepo.findById.mockResolvedValue(
        new VehicleEntity('Toyota', 'Corolla', 2024, '1'),
      );

      const result = await service.findById('1');

      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should validate and update a vehicle', async () => {
      mockRepo.findById.mockResolvedValue(
        new VehicleEntity('Toyota', 'Corolla', 2024, '1'),
      );
      mockRepo.update.mockResolvedValue(
        new VehicleEntity('Toyota', 'Corolla', 2025, '1'),
      );

      const result = await service.update('1', { year: 2025 });

      expect(result.year).toBe(2025);
    });

    it('should fail-fast if updated year is invalid', async () => {
      mockRepo.findById.mockResolvedValue(
        new VehicleEntity('Toyota', 'Corolla', 2024, '1'),
      );

      const futureYear = new Date().getFullYear() + 2;
      await expect(service.update('1', { year: futureYear })).rejects.toThrow(
        'Vehicle year cannot be later than',
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a vehicle', async () => {
      mockRepo.delete.mockResolvedValue();

      await expect(service.delete('1')).resolves.toBeUndefined();
      expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });
  });
});
