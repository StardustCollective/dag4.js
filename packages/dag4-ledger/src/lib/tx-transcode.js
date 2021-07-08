'use strict';
// libraries

// modules

// constants

// variables

// functions
const bytesToHex = (bytes) => {
  return Array.prototype.map.call(bytes, (x) => ('00' + x.toString(16)).slice(-2)).join('').toUpperCase();
};

const hex2ascii = (hexx) => {
  const hex = hexx.toString();
  let str = '';
  for (let i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
};

const numberToHex = (n) => {
  const unpadded = n.toString(16);
  if (unpadded.length % 2 == 0) {
    return unpadded;
  }
  return '0' + unpadded;
};

const encodeTx = (tx, embedSpaces, hashReference) => {
  let encodedTx = '';
  /* istanbul ignore if */
  if (tx == undefined) {
    throw Error('tx is a required parameter.');
  }
  /* istanbul ignore if */
  if (embedSpaces == undefined) {
    throw Error('embedSpaces is a required parameter.');
  }
  /* istanbul ignore if */
  if (hashReference == undefined) {
    throw Error('hashReference is a required parameter.');
  }

  if (!hashReference) {
    encodedTx += bytesToHex([tx.edge.observationEdge.parents.length]);
    if (embedSpaces) {
      encodedTx += ' ';
    }
    tx.edge.observationEdge.parents.forEach((parent) => {
      const parentBytes = Buffer.from(parent.hashReference, 'ASCII').toString('hex');
      const parentBytesLengthHex = numberToHex(parent.hashReference.length);

      encodedTx += parentBytesLengthHex;
      if (embedSpaces) {
        encodedTx += ' ';
      }

      encodedTx += parentBytes.toString('hex');
      if (embedSpaces) {
        encodedTx += ' ';
      }
    });
  }

  {
    // amount
    const amount = numberToHex(tx.edge.data.amount);
    const amountLen = numberToHex(amount.length / 2);
    encodedTx += amountLen;
    if (embedSpaces) {
      encodedTx += ' ';
    }

    encodedTx += amount;
    if (embedSpaces) {
      encodedTx += ' ';
    }
  }

  {
    // lastTxRef
    const lastTxRefHash = Buffer.from(tx.lastTxRef.prevHash, 'ASCII').toString('hex');
    const lastTxRefHashLen = numberToHex(tx.lastTxRef.prevHash.length);
    encodedTx += lastTxRefHashLen;
    if (embedSpaces) {
      encodedTx += ' ';
    }

    encodedTx += lastTxRefHash;
    if (embedSpaces) {
      encodedTx += ' ';
    }
  }

  {
    // lastTxRefOrdinal
    const lastTxRefOrdinal = numberToHex(tx.lastTxRef.ordinal);
    const lastTxRefOrdinalLen = numberToHex(lastTxRefOrdinal.length / 2);
    encodedTx += lastTxRefOrdinalLen;
    if (embedSpaces) {
      encodedTx += ' ';
    }

    encodedTx += lastTxRefOrdinal;
    if (embedSpaces) {
      encodedTx += ' ';
    }
  }

  {
    // fee
    let fee;
    if (tx.edge.data.fee !== undefined) {
      fee = numberToHex(tx.edge.data.fee);
    } else {
      fee = numberToHex(0);
    }
    const feeLen = numberToHex(fee.length / 2);

    encodedTx += feeLen;
    if (embedSpaces) {
      encodedTx += ' ';
    }

    encodedTx += fee;
    if (embedSpaces) {
      encodedTx += ' ';
    }
  }

  {
    // salt
    const salt = numberToHex(tx.edge.data.salt);
    const saltLen = numberToHex(salt.length / 2);

    encodedTx += saltLen;
    if (embedSpaces) {
      encodedTx += ' ';
    }

    encodedTx += salt;
  }

  return encodedTx.toLowerCase();
};

const decodeTx = (tx) => {
  /* istanbul ignore if */
  if (tx == undefined) {
    throw Error('tx is a required parameter.');
  }

  const buffer = Buffer.from(tx, 'hex');
  let offset = 0;

  // console.log('buffer', buffer.length);

  const getNextTx = () => {
    const next = buffer[offset];
    // console.log('getNextTx', offset, next);
    offset++;
    return next;
  };

  const getNextTxSubarray = (subarrayLength) => {
    const subarray = buffer.subarray(offset, offset + subarrayLength);
    // console.log('getNextTxSubarray', offset, subarrayLength, subarray);
    offset += subarrayLength;
    return subarray;
  };

  const getNextTxAscii = () => {
    return hex2ascii(getNextTxVariableLengthHex());
  };

  const getNextTxVariableLength = () => {
    return getNextTxSubarray(getNextTx());
  };

  const getNextTxVariableLengthHex = () => {
    return getNextTxVariableLength().toString('hex');
  };

  const getNextTxBase10Str = () => {
    return Number('0x' + getNextTxVariableLengthHex()).toString(10);
  };

  const getNextTxInteger = () => {
    return parseInt(getNextTxBase10Str(), 10);
  };

  const numParents = getNextTx();
  if (numParents != 2) {
    throw Error(`expected 2 parents, got '${numParents}'`);
  }
  const address = getNextTxAscii();
  const toAddress = getNextTxAscii();

  const amount = getNextTxInteger();
  const prevHash = getNextTxAscii();
  const ordinal = getNextTxInteger();
  const fee = getNextTxInteger();
  const salt = getNextTxInteger();

  const decodedTx = {
    'edge': {
      'observationEdge': {
        'parents': [{
          'hashReference': address,
          'hashType': 'AddressHash',
        }, {
          'hashReference': toAddress,
          'hashType': 'AddressHash',
        }],
        'data': {
          'hashType': 'TransactionDataHash',
        },
      },
      'signedObservationEdge': {
        'signatureBatch': {
          'signatures': [
          ],
        },
      },
      'data': {
        'amount': amount,
        'lastTxRef': {
          'prevHash': prevHash,
          'ordinal': ordinal,
        },
        'salt': salt,
      },
    },
    'lastTxRef': {
      'prevHash': prevHash,
      'ordinal': ordinal,
    },
    'isDummy': false,
    'isTest': false,
  };

  if (fee > 0) {
    decodedTx.edge.data.fee = fee;
  }
  return decodedTx;
};

exports.encodeTx = encodeTx;
exports.decodeTx = decodeTx;
