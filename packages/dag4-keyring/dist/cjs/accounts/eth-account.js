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
exports.EthAccount = void 0;
const account_1 = require("ethereumjs-util/dist/account");
const kcs_1 = require("../kcs");
const ecdsa_account_1 = require("./ecdsa-account");
const sigUtil = __importStar(require("eth-sig-util"));
const ethUtil = __importStar(require("ethereumjs-util"));
class EthAccount extends ecdsa_account_1.EcdsaAccount {
    decimals = 18;
    network = kcs_1.KeyringNetwork.Ethereum;
    hasTokenSupport = true;
    supportedAssets = [kcs_1.KeyringAssetType.ETH, kcs_1.KeyringAssetType.ERC20];
    tokens = ['0xa393473d64d2F9F026B60b6Df7859A689715d092']; //LTX
    saveTokenInfo(address) {
        if (this.tokens.indexOf(address) < 0) {
            this.tokens.push(address);
        }
    }
    validateAddress(address) {
        return (0, account_1.isValidAddress)(address);
    }
    /**
     * Adds a healthy buffer of gas to an initial gas estimate.
     */
    // addGasBuffer (gas: string) {
    //   const gasBuffer = new BN('100000', 10)
    //   const bnGas = new BN(ethUtil.stripHexPrefix(gas), 16)
    //   const correct = bnGas.add(gasBuffer)
    //   return ethUtil.addHexPrefix(correct.toString(16))
    // }
    // tx is an instance of the (ethereumjs-tx).Transaction class.
    signTransaction(tx) {
        const privKey = this.getPrivateKeyBuffer();
        const signedTx = tx.sign(privKey);
        // Newer versions of Ethereumjs-tx are immutable and return a new tx object
        return signedTx === undefined ? tx : signedTx;
    }
    verifyMessage(msg, signature, saysAddress) {
        const publicKey = this.recoverSignedMsgPublicKey(msg, signature);
        const actualAddress = this.getAddressFromPublicKey(publicKey);
        return ethUtil.toChecksumAddress(saysAddress) === actualAddress;
    }
    getAddressFromPublicKey(publicKey) {
        const address = '0x' + ethUtil.publicToAddress(Buffer.from(publicKey, 'hex')).toString('hex');
        return ethUtil.toChecksumAddress(address);
    }
    // get public key for nacl
    getEncryptionPublicKey() {
        return sigUtil.getEncryptionPublicKey(this.getPrivateKey());
    }
}
exports.EthAccount = EthAccount;
//# sourceMappingURL=eth-account.js.map