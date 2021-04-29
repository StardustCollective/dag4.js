const {EthSimpleKeyring} = require('../../dist/cjs/keyrings/eth/eth-simple-keyring.js');
const testData = require('../resources/test-data.json');
const {KeyringManager} = require("../../dist/cjs/index");

function test () {
  const keyring = new EthSimpleKeyring([testData.PRIVATE_KEY]);

  console.log(keyring.getAccounts())
  console.log(keyring.exportAccount('0xCb156fCC8Bcda96Fb2790a25d29824B91148d99F'))

  console.log(Buffer.from('414243', 'hex').toString('hex'));
  console.log(Buffer.from('0x414243', 'hex').toString('hex'));
}

function test2 () {
  const keyringController = new KeyringManager();

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

}

test();
