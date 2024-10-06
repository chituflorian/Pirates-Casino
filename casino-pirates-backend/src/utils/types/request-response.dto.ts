export class RequestResponse<T> {
  message: string;
  data: T | null;
  status: boolean;

  constructor() {}
}
