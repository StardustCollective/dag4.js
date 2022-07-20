import randomBytes from 'randombytes';
import { TransactionInterface } from './transaction';

// Enforce a minimum complexity in resulting hash: 8725724278030335
const MIN_SALT = Number.MAX_SAFE_INTEGER - 2**48;

export type AddressLastRefV2 = {
  hash: string,
  ordinal: number
};

export type TransactionPropsV2 = {
  fromAddress?: string,
  toAddress?: string,
  amount?: number,
  fee?: number,
  lastTxRef?: AddressLastRefV2,
  salt?: string | bigint
};

export type Proof = {
  signature: string,
  id: string
};

export type PostTransactionV2 = {
  value: {
     source: string,
     destination: string,
     amount: number,
     fee: number,
     parent: AddressLastRefV2,
     salt: string | bigint
  },
  proofs: Proof[]
};

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
      salt = BigInt(MIN_SALT + parseInt(randomBytes(6).toString('hex'), 16));
    }

    this.tx.value.salt = salt;
  }

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

  static toHexString(val: bigint | string) {
    val = BigInt(val);
    let bInt;
    if (val < BigInt(0)) {
      bInt = (BigInt(1) << BigInt(64)) + (val as any);
    } else {
      bInt = val;
    }

    return bInt.toString(16)
  }

  getPostTransaction() {
    return { 
      value: {
        ...this.tx.value,
        salt: this.tx.value.salt.toString().replace('n', '')
      },
      proofs: [...this.tx.proofs]
    };
  }

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

  setEncodedHashReference() {
    // NOOP
  }

  setSignatureBatchHash(hash: string) {
    // NOOP
  }

  addSignature(proof: Proof) {
    this.tx.proofs.push(proof);
  }
}

export default TransactionV2;
