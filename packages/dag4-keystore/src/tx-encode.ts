import {Buffer} from 'buffer';
import { BigNumber } from "bignumber.js";
import {Transaction, AddressLastRef, PostTransaction} from './transaction';
import {TransactionV2, PostTransactionV2, AddressLastRefV2} from './transaction-v2';

/**
 * A class for encoding and building transactions.
 * Provides methods for creating, encoding, and serializing transactions.
 */
class TxEncode {

  /**
   * Converts an array of bytes to a hexadecimal string.
   * @param bytes - The array of bytes to convert
   * @returns The hexadecimal string representation
   */
  bytesToHex (bytes) {
    return bytes.map((x) => ('00' + x.toString(16)).slice(-2)).join('').toUpperCase();
  }

  /**
   * Converts a number to a hexadecimal string.
   * @param n - The number to convert
   * @returns The hexadecimal string representation
   */
  numberToHex (n) {
    // @ts-ignore
    const unpadded = new BigNumber(n).toString(16);
    if (unpadded.length % 2 == 0) {
      return unpadded;
    }
    return '0' + unpadded;
  };

  /**
   * Builds a transaction and returns its post-transaction form.
   * @param amount - The transaction amount
   * @param toAddress - The recipient's address
   * @param fromAddress - The sender's address
   * @param lastRef - The last transaction reference
   * @param fee - The transaction fee (optional)
   * @returns The post-transaction object
   */
  buildTx (amount: number, toAddress: string, fromAddress: string, lastRef: AddressLastRef, fee?: number): PostTransaction {
    const tx = this.getTx(
      amount, 
      toAddress,
      fromAddress,
      lastRef,
      fee,
    );

    return tx.getPostTransaction();
  }

  /**
   * Creates a new transaction object.
   * @param amount - The transaction amount
   * @param toAddress - The recipient's address
   * @param fromAddress - The sender's address
   * @param lastRef - The last transaction reference
   * @param fee - The transaction fee (optional)
   * @returns The transaction object
   */
  getTx (amount: number, toAddress: string, fromAddress: string, lastRef: AddressLastRef, fee?: number): Transaction {
    const tx = new Transaction({
      amount, 
      fee,
      toAddress,
      fromAddress,
      lastTxRef: lastRef
    });

    return tx;
  }

  /**
   * Creates a new V2 transaction object.
   * @param amount - The transaction amount
   * @param toAddress - The recipient's address
   * @param fromAddress - The sender's address
   * @param lastRef - The last transaction reference
   * @param fee - The transaction fee (optional)
   * @returns The V2 transaction object
   */
  getTxV2 (amount: number, toAddress: string, fromAddress: string, lastRef: AddressLastRefV2, fee?: number): TransactionV2 {
    const tx = new TransactionV2({
      amount, 
      fee,
      toAddress,
      fromAddress,
      lastTxRef: lastRef
    });

    return tx;
  }

  /**
   * Creates a transaction from a post-transaction object.
   * @param tx - The post-transaction object
   * @returns The transaction object
   */
  getTxFromPostTransaction(tx: PostTransaction) {
    return Transaction.fromPostTransaction(tx);
  }
  
  /**
   * Creates a V2 transaction from a post-transaction object.
   * @param tx - The post-transaction object
   * @returns The V2 transaction object
   */
  getV2TxFromPostTransaction(tx: PostTransactionV2) {
    return TransactionV2.fromPostTransaction(tx);
  }

  /**
   * Encodes a transaction for transmission.
   * @param tx - The post-transaction object
   * @param hashReference - Whether to include hash reference
   * @returns The encoded transaction
   */
  encodeTx (tx: PostTransaction, hashReference: boolean) {
    const transaction = Transaction.fromPostTransaction(tx);

    return transaction.getEncoded(hashReference);
  }

  /**
   * Serializes a message using Kryo serialization.
   * @param msg - The message to serialize
   * @param setReferences - Whether to set references (default: true)
   * @returns The serialized message
   */
  kryoSerialize (msg: string, setReferences = true) {
    const prefix = '03' + (setReferences ? '01' : '') + Buffer.from(this.utf8Length(msg.length + 1)).toString('hex'); 

    const coded = Buffer.from(msg, 'utf8').toString('hex');

    return prefix + coded;
  }

  /**
   * Calculates the UTF-8 length of a value using variable length encoding.
   * The first byte uses bit 8 to denote UTF8 and bit 7 to denote if another byte is present.
   * @param value - The value to calculate length for
   * @returns The encoded length as a Uint16Array
   */
  private utf8Length (value: number) {
    let buffer:Uint16Array;
    let position = 0;

    const require = length => buffer = new Uint16Array(length);

    if (value >>> 6 == 0) {
      require(1);
      buffer[position++] = (value | 0x80); // Set bit 8.
    } else if (value >>> 13 == 0) {
      require(2);
      buffer[position++] = (value | 0x40 | 0x80); // Set bit 7 and 8.
      buffer[position++] = (value >>> 6);
    } else if (value >>> 20 == 0) {
      require(3);
      buffer[position++] = (value | 0x40 | 0x80); // Set bit 7 and 8.
      buffer[position++] = ((value >>> 6) | 0x80); // Set bit 8.
      buffer[position++] = (value >>> 13);
    } else if (value >>> 27 == 0) {
      require(4);
      buffer[position++] = (value | 0x40 | 0x80); // Set bit 7 and 8.
      buffer[position++] = ((value >>> 6) | 0x80); // Set bit 8.
      buffer[position++] = ((value >>> 13) | 0x80); // Set bit 8.
      buffer[position++] = (value >>> 20);
    } else {
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

export const txEncode = new TxEncode();