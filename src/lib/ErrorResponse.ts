export default class ErrorResponse extends Error {
  constructor(message: string, public response: Response) {
    super(message);
  }
}
