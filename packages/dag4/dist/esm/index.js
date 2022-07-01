import fetch from 'cross-fetch';
import { arrayUtils, dagDi } from '@stardust-collective/dag4-core';
import { globalDagNetwork } from '@stardust-collective/dag4-network';
import { keyStore } from '@stardust-collective/dag4-keystore';
import { DagAccount, DagMonitor } from '@stardust-collective/dag4-wallet';
class Dag4Packages {
    createAccount(privateKey) {
        const account = new DagAccount();
        if (privateKey) {
            account.loginPrivateKey(privateKey);
        }
        return account;
    }
    createOrGetGlobalAccount() {
        if (!this.account) {
            this.account = new DagAccount();
        }
        return this.account;
    }
    createOrGetGlobalMonitor() {
        if (!this.monitor) {
            this.monitor = new DagMonitor(this.createOrGetGlobalAccount());
        }
        return this.monitor;
    }
}
const dag4Packages = new Dag4Packages();
export const dag4 = {
    keyStore,
    di: dagDi,
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
        dagDi.getStateStorageDb().setPrefix(config.appId);
        globalDagNetwork.config(config.network);
    },
    network: globalDagNetwork,
    arrayUtils
};
// default config
console.log('setting default fetch');
dag4.di.useFetchHttpClient(fetch);
//# sourceMappingURL=index.js.map