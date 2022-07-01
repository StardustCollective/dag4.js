"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DagAccount = void 0;
const dag4_keystore_1 = require("@stardust-collective/dag4-keystore");
const dag4_core_1 = require("@stardust-collective/dag4-core");
const dag4_network_1 = require("@stardust-collective/dag4-network");
const bignumber_js_1 = require("bignumber.js");
const rxjs_1 = require("rxjs");
class DagAccount {
    m_keyTrio;
    sessionChange$ = new rxjs_1.Subject();
    network = dag4_network_1.globalDagNetwork;
    connect(networkInfo) {
        this.network = new dag4_network_1.DagNetwork(networkInfo);
        return this;
    }
    get address() {
        const address = this.m_keyTrio && this.m_keyTrio.address;
        if (!address) {
            throw new Error('Need to login before calling methods on dag4.account');
        }
        return address;
    }
    get keyTrio() {
        return this.m_keyTrio;
    }
    loginSeedPhrase(words) {
        const privateKey = dag4_keystore_1.keyStore.getPrivateKeyFromMnemonic(words);
        this.loginPrivateKey(privateKey);
    }
    loginPrivateKey(privateKey) {
        const publicKey = dag4_keystore_1.keyStore.getPublicKeyFromPrivate(privateKey);
        const address = dag4_keystore_1.keyStore.getDagAddressFromPublicKey(publicKey);
        this.setKeysAndAddress(privateKey, publicKey, address);
    }
    loginPublicKey(publicKey) {
        const address = dag4_keystore_1.keyStore.getDagAddressFromPublicKey(publicKey);
        this.setKeysAndAddress('', publicKey, address);
    }
    isActive() {
        return !!this.m_keyTrio;
    }
    logout() {
        this.m_keyTrio = null;
        this.sessionChange$.next(true);
    }
    observeSessionChange() {
        return this.sessionChange$;
    }
    setKeysAndAddress(privateKey, publicKey, address) {
        this.m_keyTrio = new dag4_keystore_1.KeyTrio(privateKey, publicKey, address);
        this.sessionChange$.next(true);
    }
    getTransactions(limit, searchAfter) {
        return this.network.blockExplorerApi.getTransactionsByAddress(this.address, limit, searchAfter);
    }
    validateDagAddress(address) {
        return dag4_keystore_1.keyStore.validateDagAddress(address);
    }
    async getBalance() {
        return this.getBalanceFor(this.address);
    }
    async getBalanceFor(address) {
        const addressObj = await this.network.getAddressBalance(address);
        if (addressObj && !isNaN(addressObj.balance)) {
            return new bignumber_js_1.BigNumber(addressObj.balance).dividedBy(dag4_core_1.DAG_DECIMALS).toNumber();
        }
        return undefined;
    }
    async getFeeRecommendation() {
        //Get last tx ref
        const lastRef = (await this.network.getAddressLastAcceptedTransactionRef(this.address));
        const hash = lastRef.prevHash || lastRef.hash; // v1 vs v2 format
        if (!hash) {
            return 0;
        }
        //Check for pending TX
        const lastTx = await this.network.getPendingTransaction(hash);
        if (!lastTx) {
            return 0;
        }
        return 1 / dag4_core_1.DAG_DECIMALS;
    }
    async generateSignedTransaction(toAddress, amount, fee = 0, lastRef) {
        lastRef = lastRef ? lastRef : await this.network.getAddressLastAcceptedTransactionRef(this.address);
        if (this.network.getNetworkVersion() === '2.0') {
            return dag4_keystore_1.keyStore.generateTransactionV2(amount, toAddress, this.keyTrio, lastRef, fee);
        }
        return dag4_keystore_1.keyStore.generateTransaction(amount, toAddress, this.keyTrio, lastRef, fee);
    }
    async transferDag(toAddress, amount, fee = 0, autoEstimateFee = false) {
        let normalizedAmount = Math.floor(new bignumber_js_1.BigNumber(amount).multipliedBy(dag4_core_1.DAG_DECIMALS).toNumber());
        const lastRef = await this.network.getAddressLastAcceptedTransactionRef(this.address);
        if (fee === 0 && autoEstimateFee) {
            const tx = await this.network.getPendingTransaction(lastRef.prevHash || lastRef.hash);
            if (tx) {
                const addressObj = await this.network.getAddressBalance(this.address);
                //Check to see if sending max amount
                if (addressObj.balance === normalizedAmount) {
                    amount -= dag4_core_1.DAG_DECIMALS;
                    normalizedAmount--;
                }
                fee = dag4_core_1.DAG_DECIMALS;
            }
        }
        const tx = await this.generateSignedTransaction(toAddress, amount, fee);
        const txHash = await this.network.postTransaction(tx);
        if (txHash) {
            return { timestamp: Date.now(), hash: txHash, amount: normalizedAmount, receiver: toAddress, fee, sender: this.address, ordinal: lastRef.ordinal, pending: true, status: 'POSTED' };
        }
    }
    async waitForCheckPointAccepted(hash) {
        let attempts = 0;
        for (let i = 1;; i++) {
            const result = await this.network.loadBalancerApi.checkTransactionStatus(hash);
            if (result) {
                if (result.accepted) {
                    break;
                }
            }
            else {
                attempts++;
                if (attempts > 20) {
                    throw new Error('Unable to find transaction');
                }
            }
            await this.wait(2.5);
        }
        return true;
    }
    async waitForBalanceChange(initialValue) {
        if (initialValue === undefined) {
            initialValue = await this.getBalance();
            await this.wait(5);
        }
        let changed = false;
        //Run for a max of 2 minutes (5 * 24 times)
        for (let i = 1; i < 24; i++) {
            const result = await this.getBalance();
            if (result !== undefined) {
                if (result !== initialValue) {
                    changed = true;
                    break;
                }
            }
            await this.wait(5);
        }
        return changed;
    }
    wait(time = 5) {
        return new Promise(resolve => setTimeout(resolve, time * 1000));
    }
    transferDagBatch(transfers) {
    }
}
exports.DagAccount = DagAccount;
//# sourceMappingURL=dag-account.js.map