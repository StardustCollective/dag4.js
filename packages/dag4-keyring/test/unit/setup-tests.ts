import {expect} from 'chai';
import {KeyringManager} from '../../src';

const phrase = "solution rookie cake shine hand attack claw awful harsh level case vocal";
const testExpect = {
  index: 5,
  key: '52754f72891614f0e3da8a716dedbaaf3f1e9e151e7475ff867838968e47d370',
  dagAddress: 'DAG27RfNfVXEtsLBt6aZf6BYQktyeB9NUX3bw7ma',
  ethAddress: '0x3d3c5ae620870cd8e708c96795d046b0c1e0f471'
}

const keyringManager = new KeyringManager();

// The KeyringController is also an event emitter:
keyringManager.on('newAccount', (address) => {
  console.log(`New account created: ${address}`)
})

keyringManager.on('removedAccount', (address) => {
  console.log(`account removed: ${address}`)
})

keyringManager.on('update', (state) => {
  console.log(`update`);
  console.log(JSON.stringify(state,null,2));
})

describe('KeyringController', () => {

  it('setup', async () => {

    await keyringManager.createOrRestoreVault('', null, 'password');

    const accounts = keyringManager.getAccounts();

    let account = accounts[0];

    console.log("Account 1: " + account.getAddress(), JSON.stringify(account.serialize()))

    expect(true).to.equal(account.validateAddress(account.getAddress()));

    account = accounts[1];

    console.log("Account 2: " + account.getAddress(), JSON.stringify(account.serialize()))

    expect(true).to.equal(account.validateAddress(account.getAddress()));

    try {

      await keyringManager.removeAccount(account.getAddress());
    }
    catch(e) {
      expect(typeof e).to.equal(typeof Error, 'MultiChainWallet does not allow removing accounts')
      return;
    }

    // expect(testExpect.key).to.equal(result.key);

    // expect(testExpect.ethAddress).to.equal(result.ethAddress);
  });


});
