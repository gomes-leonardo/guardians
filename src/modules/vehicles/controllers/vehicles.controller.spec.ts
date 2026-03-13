import { NotFoundException } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from '../services/vehicles.service';
import { VehicleEntity } from '../domain/entities/vehicle.entity';

describe('VehiclesController', () => {
  let controller: VehiclesController;
  let mockService: jest.Mocked<
    Pick<
      VehiclesService,
      'create' | 'findAll' | 'findById' | 'update' | 'delete'
    >
  >;

  beforeEach(() => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    controller = new VehiclesController(
      mockService as unknown as VehiclesService,
    );
  });

  describe('GET /vehicles', () => {
    it('should return all vehicles', async () => {
      const vehicles = [new VehicleEntity('Toyota', 'Corolla', 2024, '1')];
      mockService.findAll.mockResolvedValue(vehicles);

      const result = await controller.findAll();

      expect(result).toEqual(vehicles);
    });
  });

  describe('GET /vehicles/:id', () => {
    it('should return a vehicle by id', async () => {
      const vehicle = new VehicleEntity('Toyota', 'Corolla', 2024, '1');
      mockService.findById.mockResolvedValue(vehicle);

      const result = await controller.findById('1');

      expect(result.id).toBe('1');
    });

    it('should propagate NotFoundException', async () => {
      mockService.findById.mockRejectedValue(
        new NotFoundException('Vehicle not found'),
      );

      await expect(controller.findById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('POST /vehicles', () => {
    it('should create and return a vehicle', async () => {
      const dto = { brand: 'Toyota', model: 'Corolla', year: 2024 };
      mockService.create.mockResolvedValue(
        new VehicleEntity('Toyota', 'Corolla', 2024, '1'),
      );

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe('1');
    });
  });

  describe('PUT /vehicles/:id', () => {
    it('should update and return a vehicle', async () => {
      mockService.update.mockResolvedValue(
        new VehicleEntity('Toyota', 'Corolla', 2025, '1'),
      );

      const result = await controller.update('1', { year: 2025 });

      expect(mockService.update).toHaveBeenCalledWith('1', { year: 2025 });
      expect(result.year).toBe(2025);
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('should delete a vehicle', async () => {
      mockService.delete.mockResolvedValue();

      await expect(controller.delete('1')).resolves.toBeUndefined();
      expect(mockService.delete).toHaveBeenCalledWith('1');
    });
  });
});
