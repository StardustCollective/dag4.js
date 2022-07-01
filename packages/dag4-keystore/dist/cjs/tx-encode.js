"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txEncode = void 0;
const buffer_1 = require("buffer");
const transaction_1 = require("./transaction");
const transaction_v2_1 = require("./transaction-v2");
class TxEncode {
    bytesToHex(bytes) {
        return bytes.map((x) => ('00' + x.toString(16)).slice(-2)).join('').toUpperCase();
    }
    numberToHex(n) {
        // @ts-ignore
        const unpadded = BigInt(n).toString(16);
        if (unpadded.length % 2 == 0) {
            return unpadded;
        }
        return '0' + unpadded;
    }
    ;
    buildTx(amount, toAddress, fromAddress, lastRef, fee) {
        const tx = this.getTx(amount, toAddress, fromAddress, lastRef, fee);
        return tx.getPostTransaction();
    }
    getTx(amount, toAddress, fromAddress, lastRef, fee) {
        const tx = new transaction_1.Transaction({
            amount,
            fee,
            toAddress,
            fromAddress,
            lastTxRef: lastRef
        });
        return tx;
    }
    getTxV2(amount, toAddress, fromAddress, lastRef, fee) {
        const tx = new transaction_v2_1.TransactionV2({
            amount,
            fee,
            toAddress,
            fromAddress,
            lastTxRef: lastRef
        });
        return tx;
    }
    getTxFromPostTransaction(tx) {
        return transaction_1.Transaction.fromPostTransaction(tx);
    }
    getV2TxFromPostTransaction(tx) {
        return transaction_v2_1.TransactionV2.fromPostTransaction(tx);
    }
    encodeTx(tx, hashReference) {
        const transaction = transaction_1.Transaction.fromPostTransaction(tx);
        return transaction.getEncoded(hashReference);
    }
    kryoSerialize(msg, setReferences = true) {
        const prefix = '03' + (setReferences ? '01' : '') + buffer_1.Buffer.from(this.utf8Length(msg.length + 1)).toString('hex');
        const coded = buffer_1.Buffer.from(msg, 'utf8').toString('hex');
        return prefix + coded;
    }
    /** Writes the length of a string, which is a variable length encoded int except the first byte uses bit 8 to denote UTF8 and
     * bit 7 to denote if another byte is present. */
    utf8Length(value) {
        let buffer;
        let position = 0;
        const require = length => buffer = new Uint16Array(length);
        if (value >>> 6 == 0) {
            require(1);
            buffer[position++] = (value | 0x80); // Set bit 8.
        }
        else if (value >>> 13 == 0) {
            require(2);
            buffer[position++] = (value | 0x40 | 0x80); // Set bit 7 and 8.
            buffer[position++] = (value >>> 6);
        }
        else if (value >>> 20 == 0) {
            require(3);
            buffer[position++] = (value | 0x40 | 0x80); // Set bit 7 and 8.
            buffer[position++] = ((value >>> 6) | 0x80); // Set bit 8.
            buffer[position++] = (value >>> 13);
        }
        else if (value >>> 27 == 0) {
            require(4);
            buffer[position++] = (value | 0x40 | 0x80); // Set bit 7 and 8.
            buffer[position++] = ((value >>> 6) | 0x80); // Set bit 8.
            buffer[position++] = ((value >>> 13) | 0x80); // Set bit 8.
            buffer[position++] = (value >>> 20);
        }
        else {
            require(5);
            buffer[position++] = (value | 0x40 | 0x80); // Set bit 7 and 8.
            buffer[position++] = ((value >>> 6) | 0x80); // Set bit 8.
            buffer[position++] = ((value >>> 13) | 0x80); // Set bit 8.
            buffer[position++] = ((value >>> 20) | 0x80); // Set bit 8.
            buffer[position++] = (value >>> 27);
        }
        return buffer;
    }
}
exports.txEncode = new TxEncode();
//# sourceMappingURL=tx-encode.js.map