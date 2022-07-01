import { IHttpClient } from '../i-http-client';
export declare class RestConfig {
    private serviceBaseUrl;
    private serviceAuthToken;
    private serviceProtocolClient;
    private errorHookCallback;
    baseUrl(val?: string): any;
    authToken(val?: string): any;
    protocolClient(val?: IHttpClient): any;
    errorHook(callback?: (error: any) => void): any;
}
