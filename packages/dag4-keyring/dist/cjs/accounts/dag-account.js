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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DagAccount = void 0;
const buffer_1 = require("buffer");
const bs58 = __importStar(require("bs58"));
const jsSha256 = __importStar(require("js-sha256"));
const kcs_1 = require("../kcs");
const ecdsa_account_1 = require("./ecdsa-account");
const BASE58_ALPHABET = /['123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/;
const PKCS_PREFIX = '3056301006072a8648ce3d020106052b8104000a034200';
class DagAccount extends ecdsa_account_1.EcdsaAccount {
    decimals = 8;
    network = kcs_1.KeyringNetwork.Constellation;
    hasTokenSupport = false;
    supportedAssets = [kcs_1.KeyringAssetType.DAG];
    tokens = null; //dagAssetLibrary.getDefaultAssets();
    signTransaction(tx) {
    }
    validateAddress(address) {
        if (!address)
            return false;
        const validLen = address.length === 40;
        const validPrefix = address.substr(0, 3) === 'DAG';
        const par = Number(address.charAt(3));
        const validParity = par >= 0 && par < 10;
        const match = BASE58_ALPHABET.exec(address.substring(4));
        const validBase58 = match && match.length > 0 && match[0].length === 36;
        return validLen && validPrefix && validParity && validBase58;
    }
    getAddress() {
        return this.getAddressFromPublicKey(this.getPublicKey());
    }
    verifyMessage(msg, signature, saysAddress) {
        const publicKey = this.recoverSignedMsgPublicKey(msg, signature);
        const actualAddress = this.getAddressFromPublicKey(publicKey);
        return saysAddress === actualAddress;
    }
    sha256(hash) {
        return jsSha256.sha256(hash);
    }
    getAddressFromPublicKey(publicKeyHex) {
        //PKCS standard requires a prefix '04' for an uncompressed Public Key
        // An uncompressed public key is a 64-byte number; in hex this gives a string length of 128
        // Check to see if prefix is missing
        if (publicKeyHex.length === 128) {
            publicKeyHex = '04' + publicKeyHex;
        }
        publicKeyHex = PKCS_PREFIX + publicKeyHex;
        const sha256Str = this.sha256(buffer_1.Buffer.from(publicKeyHex, 'hex'));
        const bytes = buffer_1.Buffer.from(sha256Str, 'hex');
        const hash = bs58.encode(bytes);
        let end = hash.slice(hash.length - 36, hash.length);
        let sum = end.split('').reduce((val, char) => (isNaN(char) ? val : val + (+char)), 0);
        let par = sum % 9;
        return ('DAG' + par + end);
    }
}
exports.DagAccount = DagAccount;
//# sourceMappingURL=dag-account.js.map