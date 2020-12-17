import { RestConfig } from './rest.config';
import { IHttpClient } from '../i-http-client';

export class RestApi {

  private config = new RestConfig();

  constructor (baseUrl: string) {
    this.config.baseUrl(baseUrl);
  }

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

  configure (): RestConfig {
    return this.config;
  }

  resolveUrl (url, options?) {

    if (options && options.baseUrl !== undefined) {
      url = options.baseUrl + url;
    }
    else {
      url = this.config.baseUrl() + url;
    }

    return url;
  }

  $post<T> (url: string, data?: any, options?: RestApiOptions, queryParams?: object): Promise<T> {
    return this.httpRequest(url, 'POST', data, options, queryParams);
  }

  $get<T> (url: string, queryParams?: object, options?: RestApiOptions): Promise<T> {
    return this.httpRequest(url, 'GET', null, options, queryParams);
  }

  $put<T> (url: string, data?: any, options?: RestApiOptions, queryParams?: object): Promise<T> {
    return this.httpRequest(url, 'PUT', data, options, queryParams);
  }

  $delete<T> (url: string, data?: any, options?: RestApiOptions, queryParams?: object): Promise<T> {
    return this.httpRequest(url, 'DELETE', data, options, queryParams);
  }
}

export class RestApiOptions {
  baseUrl?: string;
  headers?: any;
  noAuthHeader?: boolean;
  transformResponse?: (rawResponse) => any;
  retry?: number;
}

export class RestApiOptionsRequest extends RestApiOptions {
  errorHook?: (error) => void;
  queryParams?: any;
  authToken?: string;
  method: string;
  body: any;
  url: string;
}



