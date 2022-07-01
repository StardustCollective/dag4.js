import { BIP_44_PATHS, HdKeyring } from '../rings';
import { KeyringAssetType, KeyringNetwork, KeyringWalletType } from '../kcs';
import { Bip39Helper } from '../bip39-helper';
let SID = 0;
export class MultiChainWallet {
    constructor() {
        this.type = KeyringWalletType.MultiChainWallet;
        this.id = this.type + (++SID);
        this.supportedAssets = [KeyringAssetType.DAG, KeyringAssetType.ETH, KeyringAssetType.ERC20];
        this.keyrings = [];
    }
    create(label, mnemonic) {
        mnemonic = mnemonic || Bip39Helper.generateMnemonic();
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
            HdKeyring.create(this.mnemonic, BIP_44_PATHS.CONSTELLATION_PATH, KeyringNetwork.Constellation, 1),
            HdKeyring.create(this.mnemonic, BIP_44_PATHS.ETH_WALLET_PATH, KeyringNetwork.Ethereum, 1)
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
//# sourceMappingURL=multi-chain-wallet.js.map