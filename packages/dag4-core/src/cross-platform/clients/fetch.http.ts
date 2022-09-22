declare let window;

export class FetchRestService {

  private httpClient: any;

  constructor (httpClient: any) {
    const defaultFetch = (typeof window !== 'undefined' && window.hasOwnProperty('fetch')) ? window.fetch.bind(window) : undefined;
    this.httpClient = httpClient || defaultFetch;
  }

  invoke(options: RestApiOptionsRequest): Promise<any> {
    return this.makeServiceRequest(this.buildRequest(options));
  }

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

interface RestApiOptionsRequest {
  baseUrl?: string;
  headers?: any;
  noAuthHeader?: boolean;
  transformResponse?: (rawResponse: any) => any;
  retry?: number;
  errorHook?: (error: any) => void;
  queryParams?: any;
  method: string;
  authToken?: string;
  body: any;
  url: string;
}
