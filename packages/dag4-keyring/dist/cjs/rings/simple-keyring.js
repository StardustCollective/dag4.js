"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleKeyring = void 0;
const keyring_registry_1 = require("../keyring-registry");
// export type SimpleKeyringState = {
//   accountType: KeyringNetwork, account?: KeyringAccountSerialized
// }
//extends EventEmitter
class SimpleKeyring {
    account;
    network;
    constructor() {
        // super()
    }
    static createForNetwork(network, privateKey) {
        const inst = new SimpleKeyring();
        inst.network = network;
        inst.account = keyring_registry_1.keyringRegistry.createAccount(network).create(privateKey);
        return inst;
    }
    getState() {
        return {
            network: this.network,
            account: this.account.serialize(false)
        };
    }
    serialize() {
        return {
            network: this.network,
            accounts: [this.account.serialize(true)]
        };
    }
    deserialize({ network, accounts }) {
        this.network = network;
        this.account = keyring_registry_1.keyringRegistry.createAccount(network).deserialize(accounts[0]);
    }
    addAccountAt(index) {
        //throw error
    }
    getAccounts() {
        return [this.account];
    }
    getAccountByAddress(address) {
        return address === this.account.getAddress() ? this.account : null;
    }
    removeAccount(account) {
        //throw error
    }
}
exports.SimpleKeyring = SimpleKeyring;
//# sourceMappingURL=simple-keyring.js.map