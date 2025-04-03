import { RestConfig } from './rest.config';
import { IHttpClient } from '../i-http-client';

/**
 * REST API client for making HTTP requests
 * Provides methods for making GET, POST, PUT, and DELETE requests
 */
export class RestApi {

  private config = new RestConfig();

  /**
   * Creates a new REST API client
   * @param {string} baseUrl - The base URL for all API requests
   */
  constructor (baseUrl: string) {
    this.config.baseUrl(baseUrl);
  }

  /**
   * Makes an HTTP request with the specified parameters
   * @param {string} url - The URL to request
   * @param {string} method - The HTTP method to use
   * @param {any} data - The data to send with the request
   * @param {RestApiOptions} options - Additional request options
   * @param {any} queryParams - Query parameters to append to the URL
   * @returns {Promise<any>} A promise that resolves with the response data
   * @private
   */
  private httpRequest (url: string, method: string, data: any, options: RestApiOptions, queryParams: any) {

    url = this.resolveUrl(url, options);

    if (!method || !url) {
      throw new Error('You must configure at least the http method and url');
    }

    const client: IHttpClient = this.config.protocolClient();

    return client.invoke({
      authToken: this.config.authToken(),
      url,
      body: data,
      method,
      queryParams,
      errorHook: this.config.errorHook(),
      ...options
    });
  }

  /**
   * Gets the configuration for this REST API client
   * @returns {RestConfig} The configuration object
   */
  configure (): RestConfig {
    return this.config;
  }

  /**
   * Resolves a URL by prepending the base URL if needed
   * @param {string} url - The URL to resolve
   * @param {RestApiOptions} [options] - Optional request options
   * @returns {string} The resolved URL
   */
  resolveUrl (url, options?) {

    if (options && options.baseUrl !== undefined) {
      url = options.baseUrl + url;
    }
    else {
      url = this.config.baseUrl() + url;
    }

    return url;
  }

  /**
   * Makes a POST request
   * @param {string} url - The URL to request
   * @param {any} [data] - The data to send with the request
   * @param {RestApiOptions} [options] - Additional request options
   * @param {object} [queryParams] - Query parameters to append to the URL
   * @returns {Promise<T>} A promise that resolves with the response data
   */
  $post<T> (url: string, data?: any, options?: RestApiOptions, queryParams?: object): Promise<T> {
    return this.httpRequest(url, 'POST', data, options, queryParams);
  }

  /**
   * Makes a GET request
   * @param {string} url - The URL to request
   * @param {object} [queryParams] - Query parameters to append to the URL
   * @param {RestApiOptions} [options] - Additional request options
   * @returns {Promise<T>} A promise that resolves with the response data
   */
  $get<T> (url: string, queryParams?: object, options?: RestApiOptions): Promise<T> {
    return this.httpRequest(url, 'GET', null, options, queryParams);
  }

  /**
   * Makes a PUT request
   * @param {string} url - The URL to request
   * @param {any} [data] - The data to send with the request
   * @param {RestApiOptions} [options] - Additional request options
   * @param {object} [queryParams] - Query parameters to append to the URL
   * @returns {Promise<T>} A promise that resolves with the response data
   */
  $put<T> (url: string, data?: any, options?: RestApiOptions, queryParams?: object): Promise<T> {
    return this.httpRequest(url, 'PUT', data, options, queryParams);
  }

  /**
   * Makes a DELETE request
   * @param {string} url - The URL to request
   * @param {any} [data] - The data to send with the request
   * @param {RestApiOptions} [options] - Additional request options
   * @param {object} [queryParams] - Query parameters to append to the URL
   * @returns {Promise<T>} A promise that resolves with the response data
   */
  $delete<T> (url: string, data?: any, options?: RestApiOptions, queryParams?: object): Promise<T> {
    return this.httpRequest(url, 'DELETE', data, options, queryParams);
  }
}

/**
 * Options for REST API requests
 */
export class RestApiOptions {
  /** Optional base URL for the request */
  baseUrl?: string;
  /** Optional headers to include in the request */
  headers?: any;
  /** Whether to skip adding the Authorization header */
  noAuthHeader?: boolean;
  /** Optional function to transform the response */
  transformResponse?: (rawResponse) => any;
  /** Number of times to retry the request on failure */
  retry?: number;
}

/**
 * Extended options for REST API requests that include request-specific parameters
 */
export class RestApiOptionsRequest extends RestApiOptions {
  /** Optional function to handle errors */
  errorHook?: (error) => void;
  /** Query parameters to append to the URL */
  queryParams?: any;
  /** Authorization token to include in the request */
  authToken?: string;
  /** HTTP method to use for the request */
  method: string;
  /** Request body data */
  body: any;
  /** URL to request */
  url: string;
}



