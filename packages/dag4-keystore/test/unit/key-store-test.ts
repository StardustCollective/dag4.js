import {expect} from 'chai';
import {keyStore} from '../../src/key-store';
import {BitHash} from '../../src/bip32/bit-hash';

const testData = require('../resources/test-data.json');

describe('Key Store', () => {

  it('IsValid DAG address', async () => {

    const result = keyStore.validateDagAddress(testData.DAG_ADDRESS);

    expect(result).to.equal(true);
  });

  it('Public key from Private', () => {

    const result = keyStore.getPublicKeyFromPrivate(testData.PRIVATE_KEY);
    expect(result).to.equal(testData.PUBLIC_KEY);

  });

  it('Compact Public key from Private', () => {

    const result = keyStore.getPublicKeyFromPrivate(testData.PRIVATE_KEY, true);
    expect(result).to.equal(testData.COMPACT_PUBLIC_KEY);

  });

  it('DAG address from Public',  () => {

    const result = keyStore.getDagAddressFromPublicKey(testData.PUBLIC_KEY);
    expect(result).to.equal(testData.DAG_ADDRESS);
  });

  it('Private Key from Mnemonic Seed Phrase',  () => {

    const result = keyStore.getPrivateKeyFromMnemonic(testData.SEED_PHRASE);
    expect(result).to.equal(testData.SEED_PRIVATE_KEY);

    // console.log(keyStore.generateSeedPhrase());
  });


  it('ETH address from Public', () => {

    const result = ethFromPublicKey(testData.PUBLIC_KEY);
    expect(result).to.equal(testData.ETH_ADDRESS);

  });

  it('BTC address from Public', () => {

    const result = btcFromPublicKey(testData.COMPACT_PUBLIC_KEY);
    expect(result).to.equal(testData.BTC_ADDRESS);
  });
});

// const RIPEMD160 = require('ripemd160');
const bs58 = require('bs58');

//https://www.freecodecamp.org/news/how-to-create-a-bitcoin-wallet-address-from-a-private-key-eca3ddd9c05f/
function btcFromPublicKey (publicKey) {

  // publicKey = '031e7bcc70c72770dbb72fea022e8a6d07f814d2ebe4de9ae3f7af75bf706902a7'

  // let base = '00' + new RIPEMD160().update(keyStore.sha256(Buffer.from(publicKey, 'hex')), 'hex').digest('hex');
  let base = '00' + BitHash.hash160(Buffer.from(publicKey, 'hex')).toString('hex');

  //console.log(base);
  // console.log(base2);

  // const shaSha = keyStore.sha256(Buffer.from(keyStore.sha256(Buffer.from(base, 'hex')), 'hex'));
  const shaSha = BitHash.dblHash256(Buffer.from(base, 'hex')).toString('hex')

  //console.log(shaSha);
  // console.log(shaSha2);

  const result = base + shaSha.substring(0,8);

  // console.log(publicKey, base, shaSha, result)

  return bs58.encode(Buffer.from(result, 'hex'));
}

//https://medium.com/coinmonks/compiling-deploying-and-interacting-with-smart-contract-using-javascript-641cf0342824

const Hash = require("eth-lib/lib/hash");
// const ethers = require('ethers');

const toChecksum = address => {
  const addressHash = Hash.keccak256(address.slice(2));
  let checksumAddress = "0x";
  for (let i = 0; i < 40; i++)
    checksumAddress += parseInt(addressHash[i + 2], 16) > 7
      ? address[i + 2].toUpperCase()
      : address[i + 2];
  return checksumAddress;
}

function ethFromPublicKey (publicKey) {

  publicKey = "0x" + publicKey.slice(2);
  const publicHash = Hash.keccak256(publicKey);
  const address = toChecksum("0x" + publicHash.slice(-40));
  return address;
}
