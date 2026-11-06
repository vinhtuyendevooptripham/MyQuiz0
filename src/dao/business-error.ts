/** Business rule violation. Controllers turn `status` into the HTTP status code. */
export class BusinessError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}
