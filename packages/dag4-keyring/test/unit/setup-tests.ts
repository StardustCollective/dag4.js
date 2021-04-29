import {expect} from 'chai';
import {KeyringController} from '../../src/keyring-manager';

const phrase = "solution rookie cake shine hand attack claw awful harsh level case vocal";
const testExpect = {
  index: 5,
  key: '52754f72891614f0e3da8a716dedbaaf3f1e9e151e7475ff867838968e47d370',
  dagAddress: 'DAG27RfNfVXEtsLBt6aZf6BYQktyeB9NUX3bw7ma',
  ethAddress: '0x3d3c5ae620870cd8e708c96795d046b0c1e0f471'
}

describe('KeyringController', () => {

  it('setup', async () => {

    const keyringController = new KeyringController();

    // The KeyringController is also an event emitter:
    keyringController.on('newAccount', (address) => {
      console.log(`New account created: ${address}`)
    })
    keyringController.on('removedAccount', (address) => {
      console.log(`account removed: ${address}`)
    })

    keyringController.on('update', (state) => {
      console.log(`update`);
      console.log(JSON.stringify(state,null,2));
    })

    keyringController.createNewVaultAndKeychain('password');

    keyringController.removeAccount(keyringController.getAccounts()[0]);

    // expect(testExpect.key).to.equal(result.key);
    // expect(testExpect.dagAddress).to.equal(result.dagAddress);
    // expect(testExpect.ethAddress).to.equal(result.ethAddress);
  });


});
