import {expect} from 'chai';
import {Bip39Helper, KeyringManager, KeyringNetwork} from '../../src';
import {BIP_44_PATHS, HdKeyring} from '../../src/rings';
import Wallet from 'ethereumjs-wallet';

const keyringManager = new KeyringManager();
const phrase = "solution rookie cake shine hand attack claw awful harsh level case vocal";

describe('HdRing', () => {

  it('setup', async () => {

    const w = Bip39Helper.generateMnemonic();

    const ring = HdKeyring.create(phrase, BIP_44_PATHS.ETH_WALLET_PATH, KeyringNetwork.Ethereum, 10);

    const xPubKey = ring.getExtendedPublicKey();

    console.log('xPubKey', xPubKey);

    const ring2 = HdKeyring.createFromExtendedKey(xPubKey, KeyringNetwork.Ethereum, 10);

    const a1 = ring.getAccounts();
    const a2 = ring2.getAccounts();

    a1.forEach((a,i) => {
      console.log(a.getAddress(), a2[i].getAddress())
    })


    // expect(testExpect.key).to.equal(result.key);

    // expect(testExpect.ethAddress).to.equal(result.ethAddress);
  });


});
