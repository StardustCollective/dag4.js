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

 const toHexString = (val)  => {
  val = BigInt(val);
  let bInt;
  if (val < BigInt(0)) {
    bInt = (BigInt(1) << BigInt(64)) + val;
  } else {
    bInt = val;
  }

  return bInt.toString(16)
}

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
    encodedTx += bytesToHex([2]); // Always 2
    if (embedSpaces) {
      encodedTx += ' ';
    }
      const sourceAddressBytes = Buffer.from(tx.value.source, 'ASCII').toString('hex');
      const sourceAddressBytesLengthHex = numberToHex(tx.value.source.length);
      encodedTx += sourceAddressBytesLengthHex;
      if (embedSpaces) {
        encodedTx += ' ';
      }
      encodedTx += sourceAddressBytes.toString('hex');
      if (embedSpaces) {
        encodedTx += ' ';
      }

      const destAddressBytes = Buffer.from(tx.value.destination, 'ASCII').toString('hex');
      const destAddressBytesLengthHex = numberToHex(tx.value.destination.length);
      encodedTx += destAddressBytesLengthHex;
      if (embedSpaces) {
        encodedTx += ' ';
      }
      encodedTx += destAddressBytes.toString('hex');
      if (embedSpaces) {
        encodedTx += ' ';
      }
  }

  {
    // amount
    const amount = numberToHex(tx.value.amount);
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
    const lastTxRefHash = Buffer.from(tx.value.parent.hash, 'ASCII').toString('hex');
    const lastTxRefHashLen = numberToHex(tx.value.parent.hash.length);
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
    const lastTxRefOrdinal = numberToHex(tx.value.parent.ordinal);
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
    if (tx.value.fee !== undefined) {
      fee = numberToHex(tx.value.fee);
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
    const salt = numberToHex(toHexString(tx.value.salt));
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
