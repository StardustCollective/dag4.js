"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchRestService = void 0;
const defaultFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : undefined;
class FetchRestService {
    httpClient;
    constructor(httpClient = defaultFetch) {
        this.httpClient = httpClient;
    }
    invoke(options) {
        return this.makeServiceRequest(this.buildRequest(options));
    }
    buildRequest(options) {
        const paramStr = options.queryParams && this.serialize(options.queryParams);
        if (paramStr) {
            options.url = `${options.url}?${paramStr}`;
        }
        const httpHeaders = {
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
    makeServiceRequest(options) {
        return new Promise((resolve, reject) => {
            this.httpClient(options.url, options)
                .then(async (res) => {
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
                }
                catch { }
                if (options.transformResponse) {
                    resolve(options.transformResponse(body));
                }
                else {
                    resolve(body);
                }
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    // eslint-disable-next-line class-methods-use-this
    serialize(obj) {
        if (obj) {
            const keyMap = Object.keys(obj).map((key) => {
                return `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`;
            });
            return keyMap.join('&');
        }
        return '';
    }
}
exports.FetchRestService = FetchRestService;
//# sourceMappingURL=fetch.http.js.map