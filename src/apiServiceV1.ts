import qs from 'qs';
import crypto from 'crypto';

import callHttp, { formContentType, RequestOptions } from './lib/callHttp';
import isomorph from './lib/isomorph';
import AuthResponse from './models/v1/AuthResponse';
import VerificationResource from './models/VerificationResource';
import ErrorResponse from './lib/ErrorResponse';

export const API_HOST = 'https://api.getmati.com';

export type Options = {
  clientId: string;
  clientSecret: string;
  host?: string;
  webhookSecret?: string;
};

type CallHttpParamsType = {
  url?: string,
  path?: string,
  requestOptions?: RequestOptions,
  authType?: 'bearer' | 'basic' | 'none',
};

class ApiServiceV1 {
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
      path: 'oauth/token',
      authType: 'basic',
      requestOptions: {
        method: 'POST',
        body: qs.stringify({
          grant_type: 'client_credentials',
          scope: 'identity',
        }),
        headers: {
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
    return this.callHttp({ url }) as Promise<VerificationResource>;
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
    requestOptions = {},
    authType = 'bearer',
  }: CallHttpParamsType) {
    let triedAuth = false;
    if (authType === 'bearer' && !this.bearerAuthHeader) {
      await this.auth();
      triedAuth = true;
    }
    if (authType !== 'none') {
      let authorization = null;
      if (authType === 'bearer') {
        authorization = this.bearerAuthHeader;
      } else if (authType === 'basic') {
        authorization = this.clientAuthHeader;
      }
      if (authorization) {
        const { headers = {} } = requestOptions;
        // @ts-ignore
        headers.authorization = authorization;
        requestOptions.headers = headers;
      }
    }

    const requestURL = url || `${this.host}/${path}`;
    try {
      return await callHttp(requestURL, requestOptions);
    } catch (err) {
      if (!triedAuth
        && authType === 'bearer'
        && err instanceof ErrorResponse
        && (err as ErrorResponse).response.status === 401
      ) {
        // re-auth
        await this.auth();
        // @ts-ignore
        requestOptions.headers.authorization = this.bearerAuthHeader;
        return callHttp(requestURL, requestOptions);
      }
      throw err;
    }
  }
}

export default new ApiServiceV1();
