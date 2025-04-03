import { RestApiOptionsRequest } from './api/rest.api';

/**
 * Interface for HTTP client implementations
 * Provides a standard way to make HTTP requests across different platforms
 */
export interface IHttpClient {

  /**
   * Invokes an HTTP request with the specified options
   * @param {RestApiOptionsRequest} options - The request options
   * @returns {Promise<any>} A promise that resolves with the response data
   */
  invoke (options: RestApiOptionsRequest): Promise<any>;
}
