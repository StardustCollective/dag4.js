"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestApiOptionsRequest = exports.RestApiOptions = exports.RestApi = void 0;
const rest_config_1 = require("./rest.config");
class RestApi {
    config = new rest_config_1.RestConfig();
    constructor(baseUrl) {
        this.config.baseUrl(baseUrl);
    }
    httpRequest(url, method, data, options, queryParams) {
        url = this.resolveUrl(url, options);
        if (!method || !url) {
            throw new Error('You must configure at least the http method and url');
        }
        const client = this.config.protocolClient();
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
    configure() {
        return this.config;
    }
    resolveUrl(url, options) {
        if (options && options.baseUrl !== undefined) {
            url = options.baseUrl + url;
        }
        else {
            url = this.config.baseUrl() + url;
        }
        return url;
    }
    $post(url, data, options, queryParams) {
        return this.httpRequest(url, 'POST', data, options, queryParams);
    }
    $get(url, queryParams, options) {
        return this.httpRequest(url, 'GET', null, options, queryParams);
    }
    $put(url, data, options, queryParams) {
        return this.httpRequest(url, 'PUT', data, options, queryParams);
    }
    $delete(url, data, options, queryParams) {
        return this.httpRequest(url, 'DELETE', data, options, queryParams);
    }
}
exports.RestApi = RestApi;
class RestApiOptions {
    baseUrl;
    headers;
    noAuthHeader;
    transformResponse;
    retry;
}
exports.RestApiOptions = RestApiOptions;
class RestApiOptionsRequest extends RestApiOptions {
    errorHook;
    queryParams;
    authToken;
    method;
    body;
    url;
}
exports.RestApiOptionsRequest = RestApiOptionsRequest;
//# sourceMappingURL=rest.api.js.map