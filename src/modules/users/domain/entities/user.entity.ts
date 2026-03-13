import { DomainException } from '../../../../common/exceptions/domain.exception';

export class User {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password?: string,
    public readonly id?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly isActive: boolean = true,
  ) {
    this.validate();
  }

  private validate() {
    if (!this.name) throw new DomainException('User name is required');
    if (!this.email) throw new DomainException('User email is required');
    if (!User.isValidEmail(this.email)) {
      throw new DomainException('Invalid email format');
    }
    if (this.password !== undefined && !User.isStrongPassword(this.password)) {
      throw new DomainException(
        'Password must be at least 8 characters with at least 1 letter and 1 number',
      );
    }
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isStrongPassword(password: string): boolean {
    return (
      password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
    );
  }
}
