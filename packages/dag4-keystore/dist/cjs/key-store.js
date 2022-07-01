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
exports.keyStore = exports.KeyStore = exports.DERIVATION_PATH = void 0;
const EC = __importStar(require("elliptic"));
const curve = new EC.ec("secp256k1");
const bignumber_js_1 = require("bignumber.js");
const jsSha256 = __importStar(require("js-sha256"));
const jsSha512 = __importStar(require("js-sha512"));
const bs58 = __importStar(require("bs58"));
const buffer_1 = require("buffer");
const ethereumjs_wallet_1 = __importStar(require("ethereumjs-wallet"));
const tx_encode_1 = require("./tx-encode");
const bip39_1 = require("./bip39/bip39");
const v3_keystore_1 = require("./v3-keystore");
//SIZE
// elliptic - 360kb
// ethereumjs-wallet -  680kb
// coin used by ledger nano s.
const CONSTELLATION_COIN = 1137;
const ETH_WALLET_PATH = 60;
const BASE58_ALPHABET = /['123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/;
//NOTE: During recover account from seed phrase, detect ETH accounts - inform user of derivation path and compatibility?  ETH (reuse ETH accounts) or DAG (ledger support)
const CONSTANTS = {
    BIP_44_DAG_PATH: `m/44'/${CONSTELLATION_COIN}'/0'/0`,
    BIP_44_ETH_PATH: `m/44'/${ETH_WALLET_PATH}'/0'/0`,
    //BIP_44_ETH_PATH_LEGACY: `m/44'/${ETH_WALLET_PATH}'/0'`,             //MEW, Legacy
    BIP_44_ETH_PATH_LEDGER: `m/44'/${ETH_WALLET_PATH}'`,
    PKCS_PREFIX: '3056301006072a8648ce3d020106052b8104000a034200' //Removed last 2 digits. 04 is part of Public Key.
};
var DERIVATION_PATH;
(function (DERIVATION_PATH) {
    DERIVATION_PATH[DERIVATION_PATH["DAG"] = 0] = "DAG";
    DERIVATION_PATH[DERIVATION_PATH["ETH"] = 1] = "ETH";
    DERIVATION_PATH[DERIVATION_PATH["ETH_LEDGER"] = 2] = "ETH_LEDGER";
})(DERIVATION_PATH = exports.DERIVATION_PATH || (exports.DERIVATION_PATH = {}));
const DERIVATION_PATH_MAP = {
    [DERIVATION_PATH.DAG]: CONSTANTS.BIP_44_DAG_PATH,
    [DERIVATION_PATH.ETH]: CONSTANTS.BIP_44_ETH_PATH,
    [DERIVATION_PATH.ETH_LEDGER]: CONSTANTS.BIP_44_ETH_PATH_LEDGER
};
class KeyStore {
    sha512(hash) {
        return jsSha512.sha512(hash);
    }
    sha256(hash) {
        return jsSha256.sha256(hash);
    }
    generateSeedPhrase() {
        return bip39_1.bip39.generateMnemonic();
    }
    generatePrivateKey() {
        return ethereumjs_wallet_1.default.generate().getPrivateKey().toString("hex");
    }
    encryptPhrase(phrase, password) {
        return v3_keystore_1.V3Keystore.encryptPhrase(phrase, password);
    }
    decryptPhrase(jKey, password) {
        return v3_keystore_1.V3Keystore.decryptPhrase(jKey, password);
    }
    async generateEncryptedPrivateKey(password, privateKey) {
        const wallet = privateKey ? ethereumjs_wallet_1.default.fromPrivateKey(buffer_1.Buffer.from(privateKey, "hex")) : ethereumjs_wallet_1.default.generate();
        const result = await wallet.toV3(password);
        return result;
    }
    async decryptPrivateKey(jKey, password) {
        if (this.isValidJsonPrivateKey(jKey)) {
            const wallet = await ethereumjs_wallet_1.default.fromV3(jKey, password);
            const key = wallet.getPrivateKey().toString("hex");
            return key;
        }
        throw new Error('Invalid JSON Private Key format');
    }
    isValidJsonPrivateKey(jKey) {
        const params = (jKey && jKey.crypto && jKey.crypto.kdfparams);
        if (params && params.salt && params.n !== undefined && params.r !== undefined && params.p !== undefined && params.dklen !== undefined) {
            return true;
        }
        return false;
    }
    //Extended keys can be used to derive child keys
    getExtendedPrivateKeyFromMnemonic(mnemonic) {
        if (bip39_1.bip39.validateMnemonic(mnemonic)) {
            const seedBytes = bip39_1.bip39.mnemonicToSeedSync(mnemonic);
            const rootKey = ethereumjs_wallet_1.hdkey.fromMasterSeed(seedBytes);
            return rootKey.privateExtendedKey();
        }
    }
    //Returns the first account
    getPrivateKeyFromMnemonic(mnemonic, derivationPath = DERIVATION_PATH.DAG) {
        if (bip39_1.bip39.validateMnemonic(mnemonic)) {
            const seedBytes = bip39_1.bip39.mnemonicToSeedSync(mnemonic);
            const rootKey = ethereumjs_wallet_1.hdkey.fromMasterSeed(seedBytes);
            const hardenedKey = rootKey.derivePath(DERIVATION_PATH_MAP[derivationPath]).deriveChild(0);
            return hardenedKey.getWallet().getPrivateKey().toString("hex");
        }
    }
    getMasterKeyFromMnemonic(mnemonic, derivationPath = DERIVATION_PATH.DAG) {
        if (bip39_1.bip39.validateMnemonic(mnemonic)) {
            const seedBytes = bip39_1.bip39.mnemonicToSeedSync(mnemonic);
            const masterKey = ethereumjs_wallet_1.hdkey.fromMasterSeed(seedBytes);
            return masterKey.derivePath(DERIVATION_PATH_MAP[derivationPath]);
        }
    }
    deriveAccountFromMaster(masterKey, index) {
        const accountKey = masterKey.deriveChild(index);
        const wallet = accountKey.getWallet();
        return wallet.getPrivateKey().toString("hex");
    }
    sign(privateKey, msg) {
        const sha512Hash = this.sha512(msg);
        const ecSig = curve.sign(sha512Hash, buffer_1.Buffer.from(privateKey, 'hex')); //, {canonical: true});
        const ecSigHex = buffer_1.Buffer.from(ecSig.toDER()).toString('hex');
        return ecSigHex;
    }
    verify(publicKey, msg, signature) {
        const sha512Hash = this.sha512(msg);
        const validSig = curve.verify(sha512Hash, signature, buffer_1.Buffer.from(publicKey, 'hex'));
        return validSig;
    }
    validateDagAddress(address) {
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
    getPublicKeyFromPrivate(privateKey, compact = false) {
        const point = curve.keyFromPrivate(privateKey).getPublic();
        return buffer_1.Buffer.from(point.encode(null, compact)).toString('hex');
    }
    getDagAddressFromPrivateKey(privateKeyHex) {
        return this.getDagAddressFromPublicKey(this.getPublicKeyFromPrivate(privateKeyHex));
    }
    getEthAddressFromPrivateKey(privateKeyHex) {
        const wallet = ethereumjs_wallet_1.default.fromPrivateKey(buffer_1.Buffer.from(privateKeyHex, "hex"));
        return wallet.getAddressString();
    }
    getDagAddressFromPublicKey(publicKeyHex) {
        //PKCS standard requires a prefix '04' for an uncompressed Public Key
        // An uncompressed public key consists of a 64-byte number; 2 bytes per number in HEX is 128
        // Check to see if prefix is missing
        if (publicKeyHex.length === 128) {
            publicKeyHex = '04' + publicKeyHex;
        }
        publicKeyHex = CONSTANTS.PKCS_PREFIX + publicKeyHex;
        const sha256Str = this.sha256(buffer_1.Buffer.from(publicKeyHex, 'hex'));
        const bytes = buffer_1.Buffer.from(sha256Str, 'hex');
        const hash = bs58.encode(bytes);
        let end = hash.slice(hash.length - 36, hash.length);
        let sum = end.split('').reduce((val, char) => (isNaN(char) ? val : val + (+char)), 0);
        let par = sum % 9;
        return ('DAG' + par + end);
    }
    async generateTransaction(amount, toAddress, keyTrio, lastRef, fee = 0) {
        const { address: fromAddress, publicKey, privateKey } = keyTrio;
        if (!privateKey) {
            throw new Error('No private key set');
        }
        if (!publicKey) {
            throw new Error('No public key set');
        }
        const { tx, hash } = this.prepareTx(amount, toAddress, fromAddress, lastRef, fee);
        const signature = this.sign(privateKey, hash);
        const uncompressedPublicKey = publicKey.length === 128 ? '04' + publicKey : publicKey;
        const success = this.verify(uncompressedPublicKey, hash, signature);
        if (!success) {
            throw new Error('Sign-Verify failed');
        }
        const signatureElt = {};
        signatureElt.signature = signature;
        signatureElt.id = {};
        signatureElt.id.hex = uncompressedPublicKey.substring(2); //Remove 04 prefix
        // const transaction = txEncode.getTxFromPostTransaction(tx as PostTransaction);
        // transaction.addSignature(signatureElt);
        // return transaction.getPostTransaction();
        tx.edge.signedObservationEdge.signatureBatch.signatures.push(signatureElt);
        return tx;
    }
    async generateTransactionV2(amount, toAddress, keyTrio, lastRef, fee = 0) {
        const { address: fromAddress, publicKey, privateKey } = keyTrio;
        if (!privateKey) {
            throw new Error('No private key set');
        }
        if (!publicKey) {
            throw new Error('No public key set');
        }
        const { tx, hash } = this.prepareTx(amount, toAddress, fromAddress, lastRef, fee, '2.0');
        const signature = this.sign(privateKey, hash);
        const uncompressedPublicKey = publicKey.length === 128 ? '04' + publicKey : publicKey;
        const success = this.verify(uncompressedPublicKey, hash, signature);
        if (!success) {
            throw new Error('Sign-Verify failed');
        }
        const signatureElt = {};
        signatureElt.id = uncompressedPublicKey.substring(2); //Remove 04 prefix
        signatureElt.signature = signature;
        const transaction = tx_encode_1.txEncode.getV2TxFromPostTransaction(tx);
        transaction.addSignature(signatureElt);
        return transaction.getPostTransaction();
    }
    prepareTx(amount, toAddress, fromAddress, lastRef, fee = 0, version = '1.0') {
        if (toAddress === fromAddress) {
            throw new Error('KeyStore :: An address cannot send a transaction to itself');
        }
        //Normalize to integer and only preserve 8 decimals of precision
        amount = Math.floor(new bignumber_js_1.BigNumber(amount).multipliedBy(1e8).toNumber());
        fee = Math.floor(new bignumber_js_1.BigNumber(fee).multipliedBy(1e8).toNumber());
        if (amount < 1e-8) {
            console.log('amount: ', amount);
            throw new Error('KeyStore :: Send amount must be greater than 1e-8');
        }
        if (fee < 0) {
            throw new Error('KeyStore :: Send fee must be greater or equal to zero');
        }
        let tx, encodedTx;
        if (version === '1.0') {
            tx = tx_encode_1.txEncode.getTx(amount, toAddress, fromAddress, lastRef, fee);
            tx.setEncodedHashReference();
            encodedTx = tx.getEncoded(false);
        }
        else {
            tx = tx_encode_1.txEncode.getTxV2(amount, toAddress, fromAddress, lastRef, fee);
            encodedTx = tx.getEncoded();
        }
        const serializedTx = tx_encode_1.txEncode.kryoSerialize(encodedTx, version === '1.0');
        console.log('serializedTx: ', serializedTx);
        const hash = this.sha256(buffer_1.Buffer.from(serializedTx, 'hex'));
        console.log('hash: ', hash);
        if (version === '1.0') {
            tx.setSignatureBatchHash(hash);
        }
        return {
            tx: tx.getPostTransaction(),
            hash,
            rle: encodedTx
        };
    }
}
exports.KeyStore = KeyStore;
exports.keyStore = new KeyStore();
//# sourceMappingURL=key-store.js.map