import randomBytes from 'randombytes';

//Enforce a minimum complexity in resulting hash: 8725724278030335
const MIN_SALT = Number.MAX_SAFE_INTEGER - 2**48;

/**
 * Represents a reference to the last transaction for an address.
 */
export type AddressLastRef ={
  prevHash: string,
  ordinal: number
};

/**
 * Properties for creating a new transaction.
 */
export type TransactionProps = {
  fromAddress?: string,
  toAddress?: string,
  amount?: number,
  fee?: number,
  lastTxRef?: AddressLastRef,
  salt?: number,
  signedObservationEdge?: any
};

/**
 * Represents a signature element in a transaction.
 */
export type SignatureElt = {
  signature: string,
  id: {
    hex: string
  }
}

/**
 * Represents a complete transaction ready to be posted to the network.
 */
export type PostTransaction = {
  edge: {
    observationEdge: {
      parents: {
        hashReference: string,
        hashType: 'AddressHash',
      }[],
      data: {
        hashType: 'TransactionDataHash',
        hashReference: string
      },
    },
    signedObservationEdge: {
      signatureBatch: {
        hash: string,
        signatures: SignatureElt[],
      },
    },
    data: {
      fee?: number;
      amount: number,
      lastTxRef: {
        prevHash: string,
        ordinal: number,
      },
      salt: number,
    },
  },
  lastTxRef: {
    prevHash: string,
    ordinal: number,
  },
  isDummy: boolean,
  isTest: boolean,
}

/**
 * Interface defining the required methods for a transaction implementation.
 */
export interface TransactionInterface {
  getPostTransaction(): any;
  getEncoded(hashReference: boolean): string;
  setEncodedHashReference(): void;
  setSignatureBatchHash(hash: string): void;
  addSignature(signature: Record<string, any>): void;
}

/**
 * A class representing a transaction in the Constellation network.
 * Implements the TransactionInterface and provides methods for creating,
 * encoding, and managing transactions.
 */
export class Transaction implements TransactionInterface {
  private tx: PostTransaction = {
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
  
  /**
   * Creates a new transaction instance.
   * @param props - The transaction properties
   */
  constructor({fromAddress, toAddress, amount, fee, lastTxRef, salt, signedObservationEdge}: TransactionProps) {
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
      salt = MIN_SALT + parseInt(randomBytes(6).toString('hex'), 16);
    }

    if (fee) { // defined and > 0
      this.tx.edge.data.fee = fee;
    }

    this.tx.edge.data.salt = salt;
  }

  /**
   * Creates a new transaction instance from a post-transaction object.
   * @param tx - The post-transaction object
   * @returns A new Transaction instance
   */
  static fromPostTransaction(tx: PostTransaction): Transaction {
    return new Transaction({
      amount: tx.edge.data.amount,
      fromAddress: tx.edge.observationEdge.parents[0].hashReference,
      toAddress: tx.edge.observationEdge.parents[1].hashReference,
      lastTxRef: tx.edge.data.lastTxRef,
      salt: tx.edge.data.salt
    });
  }

  /**
   * Gets the post-transaction object.
   * @returns The post-transaction object
   */
  getPostTransaction() {
    return this.tx;
  }

  /**
   * Gets the encoded transaction string.
   * @param hashReference - Whether to include hash reference
   * @returns The encoded transaction string
   */
  getEncoded(hashReference?: boolean) {
    let parentsTx = '';

    const tx = this.tx;

    if (!hashReference) {
      //Encode parents
      parentsTx += tx.edge.observationEdge.parents.length.toString();
      parentsTx += tx.edge.observationEdge.parents.map(p => p.hashReference.length + p.hashReference).join('')
    }

    let encodedTx = '';

    // == amount
    const amount = tx.edge.data.amount.toString(16);
    const amountLen = amount.length;

    encodedTx += amountLen;
    encodedTx += amount;

    // == lastTxRef
    const lastTxRefHash = tx.lastTxRef.prevHash ? tx.lastTxRef.prevHash : '';
    const lastTxRefHashLen = lastTxRefHash ? lastTxRefHash.length : 0;

    encodedTx += lastTxRefHashLen;
    encodedTx += lastTxRefHash;

    // == lastTxRefOrdinal
    const lastTxRefOrdinal = tx.lastTxRef.ordinal ? tx.lastTxRef.ordinal.toString() : '';
    const lastTxRefOrdinalLen = lastTxRefOrdinal.length;

    encodedTx += lastTxRefOrdinalLen;
    encodedTx += lastTxRefOrdinal;

    // == fee
    const fee = (tx.edge.data.fee || 0).toString();
    const feeLen = fee.length;

    encodedTx += feeLen;
    encodedTx += fee;

    // == salt
    const salt = tx.edge.data.salt.toString(16)
    const saltLen = salt.length;

    encodedTx += saltLen;
    encodedTx += salt;
    //

    encodedTx = parentsTx + encodedTx;

    return encodedTx;
  }

  /**
   * Sets the encoded hash reference for the transaction.
   */
  setEncodedHashReference() {
    this.tx.edge.observationEdge.data.hashReference = this.getEncoded(true);
  }

  /**
   * Sets the signature batch hash for the transaction.
   * @param hash - The hash to set
   */
  setSignatureBatchHash(hash: string) {
    this.tx.edge.signedObservationEdge.signatureBatch.hash = hash;
  }

  /**
   * Adds a signature to the transaction.
   * @param signatureElt - The signature element to add
   */
  addSignature(signatureElt: SignatureElt) {
    this.tx.edge.signedObservationEdge.signatureBatch.signatures.push(signatureElt);
  }
}

export default Transaction;