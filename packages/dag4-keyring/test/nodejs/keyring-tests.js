

const {dagDi} = require("@stardust-collective/dag4-core");

const {KeyringNetwork} = require("../../dist/cjs/index");

const testData = require('../resources/test-data.json');
const {KeyringManager} = require("../../dist/cjs/index");
const {Encryptor} = require("../../dist/cjs/encryptor");



const keyringManager = new KeyringManager();
const encryptor = new Encryptor();

keyringManager.setPassword('password');

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

async function test () {
  // const keyring = new EthSimpleKeyring([testData.PRIVATE_KEY]);

  //const wallet = await keyringManager.createNewPrivateKeyWallet('Account', KeyringNetwork.Ethereum, testData.PRIVATE_KEY);

  const wallet = await keyringManager.createOrRestoreVault(null, null);

  //console.log(wallet.getAccounts())
  //console.log(wallet.exportSecretKey('0xCb156fCC8Bcda96Fb2790a25d29824B91148d99F'));

  console.log(wallet.exportSecretKey());



  const encryptedVault = dagDi.getStateStorageDb().get('vault');

  const vault = await encryptor.decrypt('password', encryptedVault)

  console.log(JSON.stringify(vault, null, 2));

  // console.log(Buffer.from('414243', 'hex').toString('hex'));
  // console.log(Buffer.from('0x414243', 'hex').toString('hex'));
}

function test2 () {



  keyringManager.createOrRestoreVault('','','password');

  keyringManager.removeAccount(keyringManager.getAccounts()[0]);

}

test();
