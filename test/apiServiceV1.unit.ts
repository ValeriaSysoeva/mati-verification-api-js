import callHttp from '../src/lib/callHttp';
import apiService from '../src/apiServiceV1';
import AuthResponse from '../src/models/v1/AuthResponse';

jest.mock('../src/lib/callHttp');

const callHttpMock = callHttp as jest.Mock;

const clientId = 'clientId';
const clientSecret = 'clientSecret';

function mockCallHttp<T>(value: T) {
  callHttpMock.mockImplementation((): Promise<T> => Promise.resolve(value));
}

describe('apiServiceV1', () => {
  describe('#init', () => {
    it('should not throw', () => {
      expect(() => apiService.init({
        clientId,
        clientSecret,
      })).not.toThrow();
    });
  });

  describe('#auth', () => {
    describe('valid creds', () => {
      const authResponse: AuthResponse = { access_token: 'access_token', expires_in: 12, token_type: 'Bearer' };
      let result: AuthResponse;
      beforeAll(() => apiService.init({
        clientId,
        clientSecret,
      }));
      beforeAll(() => {
        mockCallHttp(authResponse);
      });
      beforeAll(async () => {
        result = await apiService.auth();
      });
      it('should resolve with authResponse',
        () => expect(result).toBe(authResponse));
      it('should call callHttp', () => {
        expect(callHttpMock.mock.calls[0]).toMatchSnapshot();
      });
    });
  });
});
