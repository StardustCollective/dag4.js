"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleAccountWallet = void 0;
const rings_1 = require("../rings");
const kcs_1 = require("../kcs");
const ethereumjs_wallet_1 = __importDefault(require("ethereumjs-wallet"));
let SID = 0;
//SingleKeyWallet
class SingleAccountWallet {
    type = kcs_1.KeyringWalletType.SingleAccountWallet;
    id = this.type + (++SID);
    supportedAssets = [];
    keyring;
    network;
    label;
    create(network, privateKey, label) {
        if (!privateKey) {
            privateKey = ethereumjs_wallet_1.default.generate().getPrivateKey().toString('hex');
        }
        this.deserialize({ type: this.type, label, network, secret: privateKey });
    }
    setLabel(val) {
        this.label = val;
    }
    getLabel() {
        return this.label;
    }
    getNetwork() {
        return this.network;
    }
    getState() {
        return {
            id: this.id,
            type: this.type,
            label: this.label,
            supportedAssets: this.supportedAssets,
            accounts: this.getAccounts().map(a => {
                return {
                    address: a.getAddress(),
                    network: a.getNetwork(),
                    tokens: a.getTokens()
                };
            })
        };
    }
    serialize() {
        return {
            type: this.type,
            label: this.label,
            network: this.network,
            secret: this.exportSecretKey()
        };
    }
    deserialize(data) {
        this.label = data.label;
        this.network = data.network || kcs_1.KeyringNetwork.Ethereum;
        this.keyring = new rings_1.SimpleKeyring();
        this.keyring.deserialize({ network: this.network, accounts: [{ privateKey: data.secret }] });
        if (this.network === kcs_1.KeyringNetwork.Ethereum) {
            this.supportedAssets.push(kcs_1.KeyringAssetType.ETH);
            this.supportedAssets.push(kcs_1.KeyringAssetType.ERC20);
        }
        else if (this.network === kcs_1.KeyringNetwork.Constellation) {
            this.supportedAssets.push(kcs_1.KeyringAssetType.DAG);
        }
    }
    importAccount(hdPath, label) {
        throw new Error('SimpleChainWallet does not support importAccount');
        return null;
    }
    getAccounts() {
        return this.keyring.getAccounts();
    }
    getAccountByAddress(address) {
        return this.keyring.getAccountByAddress(address);
    }
    removeAccount(account) {
        //Does not support removing account
    }
    exportSecretKey() {
        return this.keyring.getAccounts()[0].getPrivateKey();
    }
}
exports.SingleAccountWallet = SingleAccountWallet;
//# sourceMappingURL=single-account-wallet.js.map