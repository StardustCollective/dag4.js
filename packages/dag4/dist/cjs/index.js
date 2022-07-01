"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dag4 = void 0;
const cross_fetch_1 = require("cross-fetch");
const dag4_core_1 = require("@stardust-collective/dag4-core");
const dag4_network_1 = require("@stardust-collective/dag4-network");
const dag4_keystore_1 = require("@stardust-collective/dag4-keystore");
const dag4_wallet_1 = require("@stardust-collective/dag4-wallet");
class Dag4Packages {
    account;
    monitor;
    createAccount(privateKey) {
        const account = new dag4_wallet_1.DagAccount();
        if (privateKey) {
            account.loginPrivateKey(privateKey);
        }
        return account;
    }
    createOrGetGlobalAccount() {
        if (!this.account) {
            this.account = new dag4_wallet_1.DagAccount();
        }
        return this.account;
    }
    createOrGetGlobalMonitor() {
        if (!this.monitor) {
            this.monitor = new dag4_wallet_1.DagMonitor(this.createOrGetGlobalAccount());
        }
        return this.monitor;
    }
}
const dag4Packages = new Dag4Packages();
exports.dag4 = {
    keyStore: dag4_keystore_1.keyStore,
    di: dag4_core_1.dagDi,
    createAccount(privateKey) {
        return dag4Packages.createAccount(privateKey);
    },
    get account() {
        return dag4Packages.createOrGetGlobalAccount();
    },
    get monitor() {
        return dag4Packages.createOrGetGlobalMonitor();
    },
    config: (config) => {
        dag4_core_1.dagDi.getStateStorageDb().setPrefix(config.appId);
        dag4_network_1.globalDagNetwork.config(config.network);
    },
    network: dag4_network_1.globalDagNetwork,
    arrayUtils: dag4_core_1.arrayUtils
};
// default config
console.log('setting default fetch');
exports.dag4.di.useFetchHttpClient(cross_fetch_1.default);
//# sourceMappingURL=index.js.map