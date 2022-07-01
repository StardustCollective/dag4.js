"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const randombytes_1 = __importDefault(require("randombytes"));
//Enforce a minimum complexity in resulting hash: 8725724278030335
const MIN_SALT = Number.MAX_SAFE_INTEGER - 2 ** 48;
class Transaction {
    tx = {
        edge: {
            observationEdge: {
                parents: [{
                        hashReference: '',
                        hashType: 'AddressHash',
                    }, {
                        hashReference: '',
                        hashType: 'AddressHash',
                    }],
                data: {
                    hashType: 'TransactionDataHash',
                    hashReference: ''
                },
            },
            signedObservationEdge: {
                signatureBatch: {
                    hash: '',
                    signatures: [],
                },
            },
            data: {
                amount: null,
                lastTxRef: {
                    prevHash: '',
                    ordinal: null,
                },
                salt: null,
            },
        },
        lastTxRef: {
            prevHash: null,
            ordinal: null,
        },
        isDummy: false,
        isTest: false
    };
    constructor({ fromAddress, toAddress, amount, fee, lastTxRef, salt, signedObservationEdge }) {
        if (signedObservationEdge) {
            this.tx.edge.signedObservationEdge = signedObservationEdge;
        }
        if (fromAddress) {
            this.tx.edge.observationEdge.parents[0].hashReference = fromAddress;
        }
        if (toAddress) {
            this.tx.edge.observationEdge.parents[1].hashReference = toAddress;
        }
        if (amount !== undefined) {
            this.tx.edge.data.amount = amount;
        }
        if (lastTxRef) {
            this.tx.edge.data.lastTxRef = lastTxRef;
            this.tx.lastTxRef = lastTxRef;
        }
        if (salt === undefined) {
            salt = MIN_SALT + parseInt((0, randombytes_1.default)(6).toString('hex'), 16);
        }
        if (fee) { // defined and > 0
            this.tx.edge.data.fee = fee;
        }
        this.tx.edge.data.salt = salt;
    }
    static fromPostTransaction(tx) {
        return new Transaction({
            amount: tx.edge.data.amount,
            fromAddress: tx.edge.observationEdge.parents[0].hashReference,
            toAddress: tx.edge.observationEdge.parents[1].hashReference,
            lastTxRef: tx.edge.data.lastTxRef,
            salt: tx.edge.data.salt
        });
    }
    getPostTransaction() {
        return this.tx;
    }
    getEncoded(hashReference) {
        let parentsTx = '';
        const tx = this.tx;
        if (!hashReference) {
            //Encode parents
            parentsTx += tx.edge.observationEdge.parents.length.toString();
            parentsTx += tx.edge.observationEdge.parents.map(p => p.hashReference.length + p.hashReference).join('');
        }
        let encodedTx = '';
        // == amount
        const amount = tx.edge.data.amount.toString(16);
        const amountLen = amount.length;
        encodedTx += amountLen;
        encodedTx += amount;
        // == lastTxRef
        const lastTxRefHash = tx.lastTxRef.prevHash;
        const lastTxRefHashLen = lastTxRefHash.length;
        encodedTx += lastTxRefHashLen;
        encodedTx += lastTxRefHash;
        // == lastTxRefOrdinal
        const lastTxRefOrdinal = tx.lastTxRef.ordinal.toString();
        const lastTxRefOrdinalLen = lastTxRefOrdinal.length;
        encodedTx += lastTxRefOrdinalLen;
        encodedTx += lastTxRefOrdinal;
        // == fee
        const fee = (tx.edge.data.fee || 0).toString();
        const feeLen = fee.length;
        encodedTx += feeLen;
        encodedTx += fee;
        // == salt
        const salt = tx.edge.data.salt.toString(16);
        const saltLen = salt.length;
        encodedTx += saltLen;
        encodedTx += salt;
        //
        encodedTx = parentsTx + encodedTx;
        return encodedTx;
    }
    setEncodedHashReference() {
        this.tx.edge.observationEdge.data.hashReference = this.getEncoded(true);
    }
    setSignatureBatchHash(hash) {
        this.tx.edge.signedObservationEdge.signatureBatch.hash = hash;
    }
    addSignature(signatureElt) {
        this.tx.edge.signedObservationEdge.signatureBatch.signatures.push(signatureElt);
    }
}
exports.Transaction = Transaction;
exports.default = Transaction;
//# sourceMappingURL=transaction.js.map