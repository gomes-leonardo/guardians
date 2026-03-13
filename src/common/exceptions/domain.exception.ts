export enum DomainErrorCode {
  VALIDATION = 'VALIDATION',
  CONFLICT = 'CONFLICT',
  NOT_FOUND = 'NOT_FOUND',
}

export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: DomainErrorCode = DomainErrorCode.VALIDATION,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}
