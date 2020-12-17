import { RestApiOptionsRequest } from './api/rest.api';

export interface IHttpClient {

  invoke (options: RestApiOptionsRequest): Promise<any>;
}
