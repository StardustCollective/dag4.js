import Wallet from 'ethereumjs-wallet';
import { Buffer } from 'buffer';
import * as ethUtil from 'ethereumjs-util';
export class EcdsaAccount {
    getDecimals() {
        return this.decimals;
    }
    getLabel() {
        return this.label;
    }
    create(privateKey) {
        this.wallet = privateKey ? Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex')) : Wallet.generate();
        return this;
    }
    saveTokenInfo(address) {
    }
    getWeb3Provider() {
        return this.provider;
    }
    setWeb3Provider(provider) {
        this.provider = provider;
    }
    getTokens() {
        return this.tokens && this.tokens.concat();
    }
    setTokens(tokens) {
        if (tokens) {
            this.tokens = tokens.concat();
        }
    }
    getBip44Index() {
        return this.bip44Index;
    }
    getState() {
        const result = {
            address: this.getAddress(),
            supportedAssets: this.supportedAssets
        };
        if (this.label) {
            result.label = this.label;
        }
        if (this.tokens) {
            result.tokens = this.tokens;
        }
        return result;
    }
    getNetwork() {
        return this.network;
    }
    serialize(includePrivateKey = true) {
        const result = {};
        if (includePrivateKey)
            result.privateKey = this.getPrivateKey();
        if (this.label)
            result.label = this.label;
        if (this.tokens)
            result.tokens = this.tokens.concat();
        if (this.bip44Index >= 0)
            result.bip44Index = this.bip44Index;
        return result;
    }
    deserialize({ privateKey, publicKey, tokens, bip44Index, label }) {
        if (privateKey) {
            this.wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
        }
        else {
            this.wallet = Wallet.fromPublicKey(Buffer.from(publicKey, 'hex'));
        }
        this.label = label;
        this.bip44Index = bip44Index;
        this.tokens = tokens || this.tokens;
        return this;
    }
    signMessage(msg) {
        const privateKey = this.getPrivateKeyBuffer();
        const msgHash = ethUtil.hashPersonalMessage(Buffer.from(msg));
        const { v, r, s } = ethUtil.ecsign(msgHash, privateKey);
        if (!ethUtil.isValidSignature(v, r, s)) {
            throw new Error('Sign-Verify failed');
        }
        return ethUtil.stripHexPrefix(ethUtil.toRpcSig(v, r, s));
    }
    recoverSignedMsgPublicKey(msg, signature) {
        const msgHash = ethUtil.hashPersonalMessage(Buffer.from(msg));
        const signatureParams = ethUtil.fromRpcSig('0x' + signature);
        const publicKeyBuffer = ethUtil.ecrecover(msgHash, signatureParams.v, signatureParams.r, signatureParams.s);
        return publicKeyBuffer.toString('hex');
    }
    getAddress() {
        return this.wallet.getChecksumAddressString();
    }
    getPublicKey() {
        return this.wallet.getPublicKey().toString('hex');
    }
    getPrivateKey() {
        return this.wallet.getPrivateKey().toString('hex');
    }
    getPrivateKeyBuffer() {
        return this.wallet.getPrivateKey();
    }
}
//# sourceMappingURL=ecdsa-account.js.map