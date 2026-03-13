import { DomainException } from '../../../../common/exceptions/domain.exception';

export class VehicleEntity {
  constructor(
    public readonly brand: string,
    public readonly model: string,
    public readonly year: number,
    public readonly id?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    this.validate();
  }

  private validate() {
    if (!this.brand) throw new DomainException('Vehicle brand is required');
    if (!this.model) throw new DomainException('Vehicle model is required');
    if (!this.year) throw new DomainException('Vehicle year is required');

    const maxYear = new Date().getFullYear() + 1;
    if (this.year < 1900) {
      throw new DomainException('Vehicle year cannot be earlier than 1900');
    }
    if (this.year > maxYear) {
      throw new DomainException(
        `Vehicle year cannot be later than ${String(maxYear)}`,
      );
    }
  }
}
