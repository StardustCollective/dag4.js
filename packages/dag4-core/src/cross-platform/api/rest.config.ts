
import { crossPlatformDi } from '../cross-platform-di';
import {IHttpClient} from '../i-http-client';

export class RestConfig {

  private serviceBaseUrl;
  private serviceAuthToken;
  private serviceProtocolClient;
  private errorHookCallback: (error) => void;

  baseUrl (val?: string) {

    if (val === undefined) {
      if (this.serviceBaseUrl === '') return '';
      return this.serviceBaseUrl || crossPlatformDi.getHttpClientBaseUrl();
    }

    this.serviceBaseUrl = val;

    return this;
  }

  authToken (val?: string) {

    if (!val) {
      return this.serviceAuthToken;
    }

    this.serviceAuthToken = val;

    return this;
  }

  protocolClient (val?: IHttpClient) {

    if (!val) {
      return this.serviceProtocolClient || crossPlatformDi.getHttpClient();
    }

    this.serviceProtocolClient = val;

    return this;
  }

  errorHook (callback?: (error) => void): any {

    if (!callback) {
      return this.errorHookCallback;
    }

    this.errorHookCallback = callback;

    return this;
  }
}
