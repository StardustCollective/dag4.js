"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiAccountWallet = void 0;
const rings_1 = require("../rings");
const kcs_1 = require("../kcs");
const bip39_helper_1 = require("../bip39-helper");
let SID = 0;
class MultiAccountWallet {
    type = kcs_1.KeyringWalletType.MultiAccountWallet;
    id = this.type + (++SID);
    supportedAssets = [];
    label;
    keyring;
    mnemonic;
    network;
    create(network, mnemonic, label, numOfAccounts = 1) {
        if (mnemonic) {
            if (typeof (mnemonic) === 'number') {
                mnemonic = bip39_helper_1.Bip39Helper.generateMnemonic(mnemonic);
            }
        }
        else {
            mnemonic = bip39_helper_1.Bip39Helper.generateMnemonic();
        }
        this.deserialize({ secret: mnemonic, type: this.type, label, network, numOfAccounts });
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
            accounts: this.getAccounts().map(a => a.getState())
        };
    }
    serialize() {
        return {
            type: this.type,
            label: this.label,
            network: this.network,
            secret: this.exportSecretKey(),
            rings: [this.keyring.serialize()]
        };
    }
    deserialize(data) {
        this.label = data.label;
        this.network = data.network || kcs_1.KeyringNetwork.Ethereum;
        this.mnemonic = data.secret;
        let bip44Path;
        if (this.network === kcs_1.KeyringNetwork.Constellation) {
            this.supportedAssets.push(kcs_1.KeyringAssetType.DAG);
            bip44Path = rings_1.BIP_44_PATHS.CONSTELLATION_PATH;
        }
        else {
            this.supportedAssets.push(kcs_1.KeyringAssetType.ETH);
            this.supportedAssets.push(kcs_1.KeyringAssetType.ERC20);
            bip44Path = rings_1.BIP_44_PATHS.ETH_WALLET_PATH;
        }
        this.keyring = rings_1.HdKeyring.create(this.mnemonic, bip44Path, this.network, data.numOfAccounts);
        if (data.rings) {
            this.keyring.deserialize(data.rings[0]);
        }
    }
    importAccount(hdPath, label) {
        throw new Error('MultiAccountWallet does not support importAccount');
        return null;
    }
    // getAssets (): string[] {
    //   return this.keyrings.reduce<string[]>((res, w) => res.concat(w.getAssetList()), []);
    // }
    getAccounts() {
        return this.keyring.getAccounts();
    }
    getAccountByAddress(address) {
        return this.keyring.getAccountByAddress(address);
    }
    addAccount() {
        this.keyring.addAccountAt();
    }
    // addAccount () {
    //   let index = 0;
    //   this.getAccounts().every(a => {
    //     if (a.getBip44Index() === index) {
    //       index++;
    //       return true;
    //     }
    //   })
    //   this.keyring.addAccountAt(index);
    // }
    setNumOfAccounts(num) {
        this.keyring = rings_1.HdKeyring.create(this.mnemonic, this.keyring.getHdPath(), this.network, num);
    }
    removeAccount(account) {
        this.keyring.removeAccount(account);
    }
    exportSecretKey() {
        return this.mnemonic;
    }
}
exports.MultiAccountWallet = MultiAccountWallet;
//# sourceMappingURL=multi-account-wallet.js.map