export class ValidationError extends Error {
  constructor(message: string[] = []) {
    super(JSON.stringify(message)); // 'Error' breaks prototype chain here
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
