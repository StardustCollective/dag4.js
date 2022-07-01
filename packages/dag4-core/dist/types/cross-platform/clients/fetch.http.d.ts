export declare class FetchRestService {
    private httpClient;
    constructor(httpClient?: any);
    invoke(options: RestApiOptionsRequest): Promise<any>;
    buildRequest(options: RestApiOptionsRequest): {
        url: string;
        body: any;
        headers: any;
        method: string;
        transformResponse: (rawResponse: any) => any;
    };
    makeServiceRequest(options: RestApiOptionsRequest): Promise<unknown>;
    serialize(obj: any): string;
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
export {};
