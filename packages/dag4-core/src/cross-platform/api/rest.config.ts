import { crossPlatformDi } from '../cross-platform-di';
import {IHttpClient} from '../i-http-client';

/**
 * Configuration for REST API clients
 * Provides methods to configure base URL, authentication, and error handling
 */
export class RestConfig {

  private serviceBaseUrl;
  private serviceAuthToken;
  private serviceProtocolClient;
  private errorHookCallback: (error) => void;

  /**
   * Gets or sets the base URL for API requests
   * @param {string} [val] - The base URL to set
   * @returns {string|RestConfig} The current base URL if no value is provided, or this instance for chaining
   */
  baseUrl (val?: string) {

    if (val === undefined) {
      if (this.serviceBaseUrl === '') return '';
      return this.serviceBaseUrl || crossPlatformDi.getHttpClientBaseUrl();
    }

    this.serviceBaseUrl = val;

    return this;
  }

  /**
   * Gets or sets the authentication token for API requests
   * @param {string} [val] - The authentication token to set
   * @returns {string|RestConfig} The current authentication token if no value is provided, or this instance for chaining
   */
  authToken (val?: string) {

    if (!val) {
      return this.serviceAuthToken;
    }

    this.serviceAuthToken = val;

    return this;
  }

  /**
   * Gets or sets the HTTP client for API requests
   * @param {IHttpClient} [val] - The HTTP client to set
   * @returns {IHttpClient|RestConfig} The current HTTP client if no value is provided, or this instance for chaining
   */
  protocolClient (val?: IHttpClient) {

    if (!val) {
      return this.serviceProtocolClient || crossPlatformDi.getHttpClient();
    }

    this.serviceProtocolClient = val;

    return this;
  }

  /**
   * Gets or sets the error hook callback for API requests
   * @param {(error) => void} [callback] - The error hook callback to set
   * @returns {any|RestConfig} The current error hook callback if no value is provided, or this instance for chaining
   */
  errorHook (callback?: (error) => void): any {

    if (!callback) {
      return this.errorHookCallback;
    }

    this.errorHookCallback = callback;

    return this;
  }
}
