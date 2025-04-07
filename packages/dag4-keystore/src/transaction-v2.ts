import { randomBytes } from 'crypto';
import { TransactionInterface } from './transaction';
import { BigNumber } from "bignumber.js";

// Enforce a minimum complexity in resulting hash: 8725724278030335
const MIN_SALT = Number.MAX_SAFE_INTEGER - 2**48;

/**
 * Represents a reference to the last transaction for an address in V2 format.
 */
export type AddressLastRefV2 = {
  hash: string,
  ordinal: number
};

/**
 * Properties for creating a new V2 transaction.
 */
export type TransactionPropsV2 = {
  fromAddress?: string,
  toAddress?: string,
  amount?: number,
  fee?: number,
  lastTxRef?: AddressLastRefV2,
  salt?: string | BigNumber
};

/**
 * Represents a proof (signature) in a V2 transaction.
 */
export type Proof = {
  signature: string,
  id: string
};

/**
 * Represents a complete V2 transaction ready to be posted to the network.
 */
export type PostTransactionV2 = {
  value: {
     source: string,
     destination: string,
     amount: number,
     fee: number,
     parent: AddressLastRefV2,
     salt: string | BigNumber
  },
  proofs: Proof[]
};

/**
 * A class representing a V2 transaction in the Constellation network.
 * Implements the TransactionInterface and provides methods for creating,
 * encoding, and managing V2 transactions.
 */
export class TransactionV2 implements TransactionInterface {
  private tx: PostTransactionV2 = {
    value: {
      source: null,
      destination: null,
      amount: null,
      fee: 0,
      parent: null,
      salt: null
    },
    proofs: []
  };
  
  /**
   * Creates a new V2 transaction instance.
   * @param props - The transaction properties
   */
  constructor({fromAddress, toAddress, amount, fee, lastTxRef, salt}: TransactionPropsV2) {
    if (fromAddress) {
      this.tx.value.source = fromAddress;
    }

    if (toAddress) {
      this.tx.value.destination = toAddress;
    }

    if (amount !== undefined) {
      this.tx.value.amount = amount;
    }

    if (fee !== undefined) {
      this.tx.value.fee = fee;
    }

    if (lastTxRef) {
      this.tx.value.parent = lastTxRef;
    }

    if (salt === undefined) {
      salt = new BigNumber(MIN_SALT + parseInt(randomBytes(6).toString('hex'), 16));
    }

    this.tx.value.salt = salt;
  }

  /**
   * Creates a new V2 transaction instance from a post-transaction object.
   * @param tx - The post-transaction object
   * @returns A new TransactionV2 instance
   */
  static fromPostTransaction(tx: PostTransactionV2): TransactionV2 {
    return new TransactionV2({
      amount: tx.value.amount,
      fromAddress: tx.value.source,
      toAddress: tx.value.destination,
      lastTxRef: tx.value.parent,
      salt: tx.value.salt,
      fee: tx.value.fee
    });
  }

  /**
   * Converts a BigNumber or string to a hexadecimal string.
   * @param val - The value to convert
   * @returns The hexadecimal string representation
   */
  static toHexString(val: BigNumber | string) {
    val = new BigNumber(val);
    let bInt;
    if (val < new BigNumber(0)) {
      bInt = (1 << 64) + (val as any);
    } else {
      bInt = val;
    }

    return bInt.toString(16)
  }

  /**
   * Gets the post-transaction object.
   * @returns The post-transaction object
   */
  getPostTransaction() {
    return { 
      value: {
        ...this.tx.value,
        salt: this.tx.value.salt.toString().replace('n', '')
      },
      proofs: [...this.tx.proofs]
    };
  }

  /**
   * Gets the encoded transaction string.
   * @returns The encoded transaction string
   */
  getEncoded() {    
    const parentCount = '2';  // Always 2 parents
    const sourceAddress = this.tx.value.source;
    const destAddress = this.tx.value.destination;
    const amount = this.tx.value.amount.toString(16); // amount as hex
    const parentHash = this.tx.value.parent.hash;
    const ordinal = String(this.tx.value.parent.ordinal);
    const fee = String(this.tx.value.fee);
    const salt = TransactionV2.toHexString(this.tx.value.salt);

    return [
      parentCount,
      String(sourceAddress.length),
      sourceAddress,
      String(destAddress.length),
      destAddress,
      String(amount.length),
      amount,
      String(parentHash.length),
      parentHash,
      String(ordinal.length),
      ordinal,
      String(fee.length),
      fee,
      String(salt.length),
      salt
    ].join('');
  }

  /**
   * Sets the encoded hash reference for the transaction.
   * This is a no-op in V2 transactions.
   */
  setEncodedHashReference() {
    // NOOP
  }

  /**
   * Sets the signature batch hash for the transaction.
   * This is a no-op in V2 transactions.
   * @param hash - The hash to set
   */
  setSignatureBatchHash(hash: string) {
    // NOOP
  }

  /**
   * Adds a proof (signature) to the transaction.
   * @param proof - The proof to add
   */
  addSignature(proof: Proof) {
    this.tx.proofs.push(proof);
  }
}

export default TransactionV2;
