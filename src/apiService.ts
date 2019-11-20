import qs from 'qs';
import crypto from 'crypto';

import callHttp, { formContentType, RequestOptions } from './lib/callHttp';
import isomorph from './lib/isomorph';
import AuthResponse from './models/v2/AuthResponse';
import VerificationResource from './models/VerificationResource';
import IdentityResource from './models/v2/IdentityResource';
import SendInputRequest from './models/v2/SendInputRequest';
import SendInputResponse from './models/v2/SendInputResponse';

export const API_HOST = 'https://api.getmati.com/v2';

export type Options = {
  clientId: string;
  clientSecret: string;
  host?: string;
  webhookSecret?: string;
};

type CallHttpParamsType = {
  url?: string,
  path?: string,
  requestOptions: RequestOptions,
};

class ApiService {
  private bearerAuthHeader: string;

  private clientAuthHeader: string;

  private host: string;

  private webhookSecret: string | false = false;

  /**
   * Initializes the service.
   * @param options
   */
  init(options: Options) {
    const {
      host,
      clientId,
      clientSecret,
      webhookSecret,
    } = options;
    this.host = host || API_HOST;
    this.webhookSecret = webhookSecret || false;
    this.setClientAuth(clientId, clientSecret);
  }

  /**
   * Authenticates client.
   */
  async auth() {
    const authResponse = await this.callHttp({
      path: 'oauth',
      requestOptions: {
        method: 'POST',
        body: qs.stringify({
          grant_type: 'client_credentials',
        }),
        headers: {
          authorization: this.clientAuthHeader,
          'content-type': formContentType,
        },
      },
    }) as AuthResponse;
    this.setBearerAuth(authResponse.access_token);
    return authResponse;
  }

  validateSignature(signature: string, body: any): boolean {
    if (!this.webhookSecret) {
      return true;
    }
    const bodyStr = JSON.stringify(body);
    const computedSignature = crypto
      .createHmac('sha256', this.webhookSecret as string)
      .update(bodyStr)
      .digest('hex');
    return signature === computedSignature;
  }

  async fetchVerification(url: string): Promise<VerificationResource> {
    return this.callHttp({
      url,
      requestOptions: {
        headers: {
          authorization: this.bearerAuthHeader,
        },
      },
    }) as Promise<VerificationResource>;
  }

  async createIdentity(): Promise<IdentityResource> {
    return this.callHttp({
      path: 'v2/identities',
      requestOptions: {
        method: 'POST',
        headers: {
          authorization: this.bearerAuthHeader,
          'content-type': formContentType,
        },
      },
    }) as Promise<IdentityResource>;
  }

  private setClientAuth(clientId: string, clientSecret: string) {
    this.clientAuthHeader = `Basic ${isomorph.btoa(`${clientId}:${clientSecret}`)}`;
  }

  private setBearerAuth(accessToken: string) {
    this.bearerAuthHeader = `Bearer ${accessToken}`;
  }

  private async callHttp({
    path,
    url,
    requestOptions,
  }: CallHttpParamsType) {
    const requestURL = url || `${this.host}/${path}`;
    return callHttp(requestURL, requestOptions);
  }

  async sendInput(
    identityId: string,
    sendInputRequest: SendInputRequest,
  ): Promise<SendInputResponse> {
    // @ts-ignore
    const formData = new isomorph.FormData();
    formData.append('inputs', JSON.stringify(sendInputRequest.inputs));
    sendInputRequest.files.forEach((fileRecord) => {
      formData.append(fileRecord.mediaType, fileRecord.stream, fileRecord.fileName);
    });
    return this.callHttp({
      path: `v2/identities/${identityId}/send-input`,
      requestOptions: {
        method: 'POST',
        body: formData,
        headers: {
          authorization: this.bearerAuthHeader,
        },
      },
    }) as Promise<SendInputResponse>;
  }
}

export default new ApiService();
