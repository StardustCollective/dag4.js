import {expect} from 'chai';
import {keyStore} from '../../src/key-store';
import {txEncode} from '../../src/tx-encode';

const testData = require('../resources/valid-tx.json');

const HASH_REFERENCE = '100101010';
const ENCODED_TX = '240DAG2rVZNxft1DFyegDqEuTHV7uS27j1qb2CbepnS40DAG5A4s8whzjwz2y9VxjLQgL9bwtUjuRzvemTGFd100101010';
const SERIALIZED_TX = '0301df013234304441473272565a4e7866743144467965674471457554485637755332376a31716232436265706e533430444147354134733877687a6a777a32793956786a4c51674c39627774556a75527a76656d54474664313030313031303130';
const HASH = 'bf74a28f2e64de19b312b73c0b8a3233b1de3cdff84fc2743ebb7efa219e7f56';

describe('TX-Encode', () => {

  let hashReference, encodedTx, serializedTx, hash;

  it('hash reference', () => {
    hashReference = txEncode.encodeTx(testData, true);

    expect(hashReference).to.equal(HASH_REFERENCE);
  });

  it('encoded tx', () => {
    encodedTx = txEncode.encodeTx(testData, false);

    expect(encodedTx).to.equal(ENCODED_TX);
  });

  it('kryo serialize', () => {
    serializedTx = txEncode.kryoSerialize(encodedTx);

    expect(serializedTx).to.equal(SERIALIZED_TX);
  });

  it('sha 256 hash', () => {
    hash = keyStore.sha256(Buffer.from(serializedTx, 'hex'));

    expect(hash).to.equal(HASH);
  });

});
