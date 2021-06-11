import {Buffer} from 'buffer';

import randomBytes from 'randombytes';

//Enforce a minimum complexity in resulting hash: 8725724278030335
const MIN_SALT = Number.MAX_SAFE_INTEGER - 2**48;


class TxEncode {

  bytesToHex (bytes) {
    return bytes.map((x) => ('00' + x.toString(16)).slice(-2)).join('').toUpperCase();
  }

  numberToHex (n) {
    // @ts-ignore
    const unpadded = BigInt(n).toString(16);
    if (unpadded.length % 2 == 0) {
      return unpadded;
    }
    return '0' + unpadded;
  };

  buildTx (amount: number, toAddress: string, fromAddress: string, lastRef: AddressLastRef): PostTransaction {

    const salt = MIN_SALT + parseInt(randomBytes(6).toString('hex'), 16);

    return {
      'edge': {
        'observationEdge': {
          'parents': [{
            'hashReference': fromAddress,
            'hashType': 'AddressHash',
          }, {
            'hashReference': toAddress,
            'hashType': 'AddressHash',
          }],
          'data': {
            'hashType': 'TransactionDataHash',
            'hashReference': ''
          },
        },
        'signedObservationEdge': {
          'signatureBatch': {
            'hash': '',
            'signatures': [],
          },
        },
        'data': {
          'amount': amount,
          'lastTxRef': {
            'prevHash': lastRef.prevHash,
            'ordinal': lastRef.ordinal,
          },
          'salt': salt,
        },
      },
      'lastTxRef': {
        'prevHash': lastRef.prevHash,
        'ordinal': lastRef.ordinal,
      },
      'isDummy': false,
      'isTest': false
    };
  }

  encodeTx (tx: PostTransaction, hashReference: boolean) {

    let parentsTx = '';

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
    const salt = tx.edge.data.salt.toString(16)
    const saltLen = salt.length;

    encodedTx += saltLen;
    encodedTx += salt;
    //

    encodedTx = parentsTx + encodedTx;

    return encodedTx;
  }

  kryoSerialize (msg: string) {
    const prefix = '0301' + Buffer.from(this.utf8Length(msg.length + 1)).toString('hex');

    const coded = Buffer.from(msg, 'utf8').toString('hex');

    return prefix + coded;
  }

  /** Writes the length of a string, which is a variable length encoded int except the first byte uses bit 8 to denote UTF8 and
   * bit 7 to denote if another byte is present. */
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

type AddressLastRef ={
  prevHash: string,
  ordinal: number
}

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
        signatures: string[],
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
