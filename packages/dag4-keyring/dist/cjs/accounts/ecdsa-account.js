"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcdsaAccount = void 0;
const ethereumjs_wallet_1 = __importDefault(require("ethereumjs-wallet"));
const buffer_1 = require("buffer");
const ethUtil = __importStar(require("ethereumjs-util"));
class EcdsaAccount {
    tokens;
    wallet; // = Wallet.generate();
    assets;
    bip44Index;
    provider;
    label;
    getDecimals() {
        return this.decimals;
    }
    getLabel() {
        return this.label;
    }
    create(privateKey) {
        this.wallet = privateKey ? ethereumjs_wallet_1.default.fromPrivateKey(buffer_1.Buffer.from(privateKey, 'hex')) : ethereumjs_wallet_1.default.generate();
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
            this.wallet = ethereumjs_wallet_1.default.fromPrivateKey(buffer_1.Buffer.from(privateKey, 'hex'));
        }
        else {
            this.wallet = ethereumjs_wallet_1.default.fromPublicKey(buffer_1.Buffer.from(publicKey, 'hex'));
        }
        this.label = label;
        this.bip44Index = bip44Index;
        this.tokens = tokens || this.tokens;
        return this;
    }
    signMessage(msg) {
        const privateKey = this.getPrivateKeyBuffer();
        const msgHash = ethUtil.hashPersonalMessage(buffer_1.Buffer.from(msg));
        const { v, r, s } = ethUtil.ecsign(msgHash, privateKey);
        if (!ethUtil.isValidSignature(v, r, s)) {
            throw new Error('Sign-Verify failed');
        }
        return ethUtil.stripHexPrefix(ethUtil.toRpcSig(v, r, s));
    }
    recoverSignedMsgPublicKey(msg, signature) {
        const msgHash = ethUtil.hashPersonalMessage(buffer_1.Buffer.from(msg));
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
exports.EcdsaAccount = EcdsaAccount;
//# sourceMappingURL=ecdsa-account.js.map