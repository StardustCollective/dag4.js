import { crossPlatformDi } from '../cross-platform-di';
export class RestConfig {
    baseUrl(val) {
        if (val === undefined) {
            if (this.serviceBaseUrl === '')
                return '';
            return this.serviceBaseUrl || crossPlatformDi.getHttpClientBaseUrl();
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
            return this.serviceProtocolClient || crossPlatformDi.getHttpClient();
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
//# sourceMappingURL=rest.config.js.map