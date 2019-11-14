export default interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: 'Bearer';
}
