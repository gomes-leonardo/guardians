export class User {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password?: string,
    public readonly id?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    this.validate();
  }

  private validate() {
    if (!this.name) throw new Error('User name is required');
    if (!this.email) throw new Error('User email is required');
  }
}
