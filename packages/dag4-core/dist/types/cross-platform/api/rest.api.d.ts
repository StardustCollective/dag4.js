import { RestConfig } from './rest.config';
export declare class RestApi {
    private config;
    constructor(baseUrl: string);
    private httpRequest;
    configure(): RestConfig;
    resolveUrl(url: any, options?: any): any;
    $post<T>(url: string, data?: any, options?: RestApiOptions, queryParams?: object): Promise<T>;
    $get<T>(url: string, queryParams?: object, options?: RestApiOptions): Promise<T>;
    $put<T>(url: string, data?: any, options?: RestApiOptions, queryParams?: object): Promise<T>;
    $delete<T>(url: string, data?: any, options?: RestApiOptions, queryParams?: object): Promise<T>;
}
export declare class RestApiOptions {
    baseUrl?: string;
    headers?: any;
    noAuthHeader?: boolean;
    transformResponse?: (rawResponse: any) => any;
    retry?: number;
}
export declare class RestApiOptionsRequest extends RestApiOptions {
    errorHook?: (error: any) => void;
    queryParams?: any;
    authToken?: string;
    method: string;
    body: any;
    url: string;
}
