"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiChainWallet = void 0;
const rings_1 = require("../rings");
const kcs_1 = require("../kcs");
const bip39_helper_1 = require("../bip39-helper");
let SID = 0;
class MultiChainWallet {
    type = kcs_1.KeyringWalletType.MultiChainWallet;
    id = this.type + (++SID);
    supportedAssets = [kcs_1.KeyringAssetType.DAG, kcs_1.KeyringAssetType.ETH, kcs_1.KeyringAssetType.ERC20];
    label;
    keyrings = [];
    mnemonic;
    create(label, mnemonic) {
        mnemonic = mnemonic || bip39_helper_1.Bip39Helper.generateMnemonic();
        this.deserialize({ secret: mnemonic, type: this.type, label });
    }
    setLabel(val) {
        this.label = val;
    }
    getLabel() {
        return this.label;
    }
    getNetwork() {
        throw new Error('MultiChainWallet does not support this method');
        return '';
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
            secret: this.mnemonic,
            rings: this.keyrings.map(ring => ring.serialize())
        };
    }
    deserialize(data) {
        this.label = data.label;
        this.mnemonic = data.secret;
        this.keyrings = [
            rings_1.HdKeyring.create(this.mnemonic, rings_1.BIP_44_PATHS.CONSTELLATION_PATH, kcs_1.KeyringNetwork.Constellation, 1),
            rings_1.HdKeyring.create(this.mnemonic, rings_1.BIP_44_PATHS.ETH_WALLET_PATH, kcs_1.KeyringNetwork.Ethereum, 1)
        ];
        if (data.rings) {
            data.rings.forEach((r, i) => this.keyrings[i].deserialize(r));
        }
    }
    importAccount(hdPath, label) {
        throw new Error('MultiChainWallet does not support importAccount');
        return null;
    }
    // getAssets (): string[] {
    //   return this.keyrings.reduce<string[]>((res, w) => res.concat(w.getAssetList()), []);
    // }
    getAccounts() {
        return this.keyrings.reduce((res, w) => res.concat(w.getAccounts()), []);
    }
    getAccountByAddress(address) {
        let account;
        this.keyrings.some(w => account = w.getAccountByAddress(address));
        return account;
    }
    removeAccount(account) {
        throw new Error('MultiChainWallet does not allow removing accounts');
    }
    exportSecretKey() {
        return this.mnemonic;
    }
}
exports.MultiChainWallet = MultiChainWallet;
//# sourceMappingURL=multi-chain-wallet.js.map