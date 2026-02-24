export class AppError extends Error {
  statusCode: number;
  errors: string[] | null;

  constructor(message: string, statusCode = 400, errors: string[] | null = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
