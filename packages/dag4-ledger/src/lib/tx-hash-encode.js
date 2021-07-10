'use strict';
// libraries

// modules

// constants

// variables

// functions
const encodeTxHash = (tx, hashReference) => {
  let parentsTx = '';

  if (!hashReference) {
    // Encode parents
    parentsTx += tx.edge.observationEdge.parents.length.toString();
    parentsTx += tx.edge.observationEdge.parents.map((p) => p.hashReference.length + p.hashReference).join('');
  }

  let encodedTx = '';

  // == amount
  const amount = Number(tx.edge.data.amount).toString(16);
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
  const salt = Number(tx.edge.data.salt || 0).toString(16);
  const saltLen = salt.length;

  encodedTx += saltLen;
  encodedTx += salt;

  encodedTx = parentsTx + encodedTx;

  return encodedTx;
};

exports.encodeTxHash = encodeTxHash;
