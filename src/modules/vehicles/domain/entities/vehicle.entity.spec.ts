import { VehicleEntity } from './vehicle.entity';

describe('VehicleEntity', () => {
  const validProps = { brand: 'Toyota', model: 'Corolla', year: 2024 };

  it('should create a valid vehicle', () => {
    const vehicle = new VehicleEntity(
      validProps.brand,
      validProps.model,
      validProps.year,
    );
    expect(vehicle.brand).toBe('Toyota');
    expect(vehicle.model).toBe('Corolla');
    expect(vehicle.year).toBe(2024);
  });

  it('should accept year equal to current year + 1', () => {
    const nextYear = new Date().getFullYear() + 1;
    expect(
      () => new VehicleEntity('Toyota', 'Corolla', nextYear),
    ).not.toThrow();
  });

  it('should accept year equal to 1900', () => {
    expect(() => new VehicleEntity('Ford', 'Model T', 1900)).not.toThrow();
  });

  describe('required fields', () => {
    it('should throw if brand is empty', () => {
      expect(
        () => new VehicleEntity('', validProps.model, validProps.year),
      ).toThrow('Vehicle brand is required');
    });

    it('should throw if model is empty', () => {
      expect(
        () => new VehicleEntity(validProps.brand, '', validProps.year),
      ).toThrow('Vehicle model is required');
    });
  });

  describe('year validation', () => {
    it('should throw if year is earlier than 1900', () => {
      expect(() => new VehicleEntity('Ford', 'Model T', 1899)).toThrow(
        'Vehicle year cannot be earlier than 1900',
      );
    });

    it('should throw if year is later than current year + 1', () => {
      const tooFar = new Date().getFullYear() + 2;
      expect(() => new VehicleEntity('Toyota', 'Corolla', tooFar)).toThrow(
        'Vehicle year cannot be later than',
      );
    });
  });
});
