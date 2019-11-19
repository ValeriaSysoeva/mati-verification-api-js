export interface UserPayload {
  _id: string;
}

export interface AuthPayload {
  user: UserPayload;
}

export default interface AuthResponse {
  access_token: string;
  expiresIn: number;
  payload: AuthPayload;
}
