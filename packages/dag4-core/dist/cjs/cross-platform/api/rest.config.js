"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestConfig = void 0;
const cross_platform_di_1 = require("../cross-platform-di");
class RestConfig {
    serviceBaseUrl;
    serviceAuthToken;
    serviceProtocolClient;
    errorHookCallback;
    baseUrl(val) {
        if (val === undefined) {
            if (this.serviceBaseUrl === '')
                return '';
            return this.serviceBaseUrl || cross_platform_di_1.crossPlatformDi.getHttpClientBaseUrl();
        }
        this.serviceBaseUrl = val;
        return this;
    }
    authToken(val) {
        if (!val) {
            return this.serviceAuthToken;
        }
        this.serviceAuthToken = val;
        return this;
    }
    protocolClient(val) {
        if (!val) {
            return this.serviceProtocolClient || cross_platform_di_1.crossPlatformDi.getHttpClient();
        }
        this.serviceProtocolClient = val;
        return this;
    }
    errorHook(callback) {
        if (!callback) {
            return this.errorHookCallback;
        }
        this.errorHookCallback = callback;
        return this;
    }
}
exports.RestConfig = RestConfig;
//# sourceMappingURL=rest.config.js.map