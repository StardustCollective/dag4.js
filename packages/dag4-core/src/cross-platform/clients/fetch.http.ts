declare let window;

/**
 * HTTP client implementation using the Fetch API
 * Provides a standard way to make HTTP requests in browser environments
 */
export class FetchRestService {

  private httpClient: any;

  /**
   * Creates a new Fetch-based HTTP client
   * @param {any} [httpClient] - Optional custom fetch implementation
   */
  constructor (httpClient: any) {
    const defaultFetch = (typeof window !== 'undefined' && window.hasOwnProperty('fetch')) ? window.fetch.bind(window) : undefined;
    this.httpClient = httpClient || defaultFetch;
  }

  /**
   * Invokes an HTTP request with the specified options
   * @param {RestApiOptionsRequest} options - The request options
   * @returns {Promise<any>} A promise that resolves with the response data
   */
  invoke(options: RestApiOptionsRequest): Promise<any> {
    return this.makeServiceRequest(this.buildRequest(options));
  }

  /**
   * Builds a request object from the provided options
   * @param {RestApiOptionsRequest} options - The request options
   * @returns {RestApiOptionsRequest} The built request object
   */
  buildRequest(options: RestApiOptionsRequest) {
    const paramStr = options.queryParams && this.serialize(options.queryParams);

    if (paramStr) {
      options.url = `${options.url}?${paramStr}`;
    }

    const httpHeaders: any = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (options.authToken && !options.noAuthHeader) {
      httpHeaders.Authorization = options.authToken;
    }

    if (options.headers) {
      Object.keys(options.headers).forEach((key) => {
        httpHeaders[key] = options.headers[key];
      });
    }

    if (options.body) {
      const contentType = httpHeaders['Content-Type'];
      if (contentType === 'application/x-www-form-urlencoded') {
        options.body = this.serialize(options.body);
      }
      else if (contentType === 'application/json') {
        options.body = JSON.stringify(options.body);
      }
    }

    return {
      url: options.url,
      body: options.body,
      headers: httpHeaders,
      method: options.method,
      transformResponse: options.transformResponse,
    };
  }

  /**
   * Makes an HTTP request using the fetch API
   * @param {RestApiOptionsRequest} options - The request options
   * @returns {Promise<any>} A promise that resolves with the response data
   */
  // eslint-disable-next-line class-methods-use-this
  makeServiceRequest(options: RestApiOptionsRequest) {
    return new Promise((resolve, reject) => {
      this.httpClient(options.url, options)
        .then( async (res) => {
          if (res.status !== 200) {
            const text = await res.text();

            // let error = new Error(text);
            //
            // error.status = res.status;
            // error.statusText = res.statusText;

            throw new Error(text);
          }
          return res.text();
        })
        .then(body => {
          try {
            body = JSON.parse(body);
          } catch {}
          if (options.transformResponse) {
            resolve(options.transformResponse(body));
          } else {
            resolve(body);
          }
        })
        .catch(err => {
          reject(err);
        }
      );
    });
  }

  /**
   * Serializes an object into a URL-encoded string
   * @param {any} obj - The object to serialize
   * @returns {string} The serialized string
   */
  // eslint-disable-next-line class-methods-use-this
  serialize(obj: any) {
    if (obj) {
      const keyMap = Object.keys(obj).map((key) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`;
      });

      return keyMap.join('&');
    }
    return '';
  }
}

/**
 * Options for REST API requests
 */
interface RestApiOptionsRequest {
  /** Optional base URL for the request */
  baseUrl?: string;
  /** Optional headers to include in the request */
  headers?: any;
  /** Whether to skip adding the Authorization header */
  noAuthHeader?: boolean;
  /** Optional function to transform the response */
  transformResponse?: (rawResponse: any) => any;
  /** Number of times to retry the request on failure */
  retry?: number;
  /** Optional function to handle errors */
  errorHook?: (error: any) => void;
  /** Query parameters to append to the URL */
  queryParams?: any;
  /** HTTP method to use for the request */
  method: string;
  /** Authorization token to include in the request */
  authToken?: string;
  /** Request body data */
  body: any;
  /** URL to request */
  url: string;
}
