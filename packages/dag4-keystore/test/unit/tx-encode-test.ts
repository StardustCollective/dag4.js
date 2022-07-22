import {expect} from 'chai';
import {keyStore} from '../../src/key-store';
import {txEncode} from '../../src/tx-encode';

const validV1Txns = require('../resources/valid-txns-v1.json');

const HASH_REFERENCE = '100101010';
const ENCODED_TX = '240DAG2rVZNxft1DFyegDqEuTHV7uS27j1qb2CbepnS40DAG5A4s8whzjwz2y9VxjLQgL9bwtUjuRzvemTGFd100101010';
const SERIALIZED_TX = '0301df013234304441473272565a4e7866743144467965674471457554485637755332376a31716232436265706e533430444147354134733877687a6a777a32793956786a4c51674c39627774556a75527a76656d54474664313030313031303130';
const HASH = 'bf74a28f2e64de19b312b73c0b8a3233b1de3cdff84fc2743ebb7efa219e7f56';

const stripTxnSignatures = (txn: Record<string, any>) => {
  return {
    ...txn,
    signedObservationEdge: {
      signatureBatch: {
        hash: '',
        signatures: [],
      },
    },
  }
}

describe('TX-Encode', () => {
  it('hash reference', () => {
    const hashReference = txEncode.encodeTx(validV1Txns[0].transaction, true);

    expect(hashReference).to.equal('55839064fa640ea8a562d61540904f4a1658a04bb6a7238d02d49ece14ef8b2fefff539624010141f465cec34dfd8');
  });

  it('encoded tx', () => {
    const encodedTx = txEncode.encodeTx(validV1Txns[0].transaction, false);

    expect(encodedTx).to.equal('240DAG4bQGdnDJ5okVdsdtvJzBwQoPGjLNzN7HC1CBV40DAG4EqbfJNSYZDDfs7AUzofotJzZXeRYgHaGZ6jQ55839064fa640ea8a562d61540904f4a1658a04bb6a7238d02d49ece14ef8b2fefff539624010141f465cec34dfd8');
  });

  it('kryo serialize', () => {
    const encodedTx = txEncode.encodeTx(validV1Txns[0].transaction, false);
    const serializedTx = txEncode.kryoSerialize(encodedTx);

    expect(serializedTx).to.equal('0301f30232343044414734625147646e444a356f6b5664736474764a7a4277516f50476a4c4e7a4e37484331434256343044414734457162664a4e53595a444466733741557a6f666f744a7a5a58655259674861475a366a51353538333930363466613634306561386135363264363135343039303466346131363538613034626236613732333864303264343965636531346566386232666566666635333936323430313031343166343635636563333464666438');
  });

  it('sha 256 hash', () => {
    const txn = stripTxnSignatures(validV1Txns[0].transaction);
    const encodedTx = txEncode.encodeTx(txn as any, false);
    const serializedTx = txEncode.kryoSerialize(encodedTx);

    const hash = keyStore.sha256(Buffer.from(serializedTx, 'hex'));

    expect(hash).to.equal('9aa281d664953cb181e8c420b2e07b5f540b86bc92271258d697aada4ee48865');
  });
});
