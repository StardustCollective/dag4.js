// max length in bytes.
import {dag4} from '@stardust-collective/dag4';
import {DagAccount} from '@stardust-collective/dag4-wallet';

const MAX_SIGNED_TX_LEN = 512;

const DEVICE_ID = '8004000000';

export type LedgerAccount = {
  publicKey: string;
  address: string;
  balance: string;
}

interface LedgerTransport {
  list(): Promise<string[]>;
  open (string: string): Promise<any>;
  isSupported(): Promise<boolean>;
}

export class LedgerBridge {

  constructor(private transport: LedgerTransport) {}

  // async buildTx (publicKey: string, fromAddress: string, toAddress: string) {
  //
  //   const lastRef = await dag4.network.loadBalancerApi.getAddressLastAcceptedTransactionRef(fromAddress);
  //
  //   const { tx, rle } = dag4.keyStore.prepareTx(1e-7, toAddress, fromAddress, publicKey, lastRef, 0);
  //
  //   const hash = tx.edge.signedObservationEdge.signatureBatch.hash;
  //
  //   console.log(rle);
  //   console.log(hash);
  //
  //   const hashReference = txHashEncodeUtil.encodeTxHash(tx, true);
  //   tx.edge.observationEdge.data.hashReference = hashReference;
  //
  //   console.log('amount', tx.edge.data.amount);
  //
  //   const encodedTx = txTranscodeUtil.encodeTx(tx, false, false);
  //
  //   console.log(hashReference);
  //   console.log(encodedTx);
  //
  //   this.signTransaction(publicKey, hashReference, encodedTx);
  // }

  /**
   * Returns a signed transaction ready to be posted to the network.
   */
  async signTransaction(publicKey: string, bip44Index: number, hash: string, rle: string) {
    const results = await this.sign(rle, bip44Index);

    console.log('signTransaction\n' + results.signature);

    const success = dag4.keyStore.verify(publicKey, hash, results.signature);


    console.log('verify: ', success);
  }

  /**
   * Takes a signed transaction and posts it to the network.
   */
  postTransaction() {}

  public async getAccountInfoForPublicKeys (ledgerAccounts: { publicKey: string}[]) {

    if (ledgerAccounts.length > 0) {
      let responseArray = [];
      for (let i = 0; i < ledgerAccounts.length; i++) {
        const publicKey = ledgerAccounts[i].publicKey;
        dag4.account.loginPublicKey(publicKey);
        const address = dag4.account.address;
        console.log('public', publicKey, address);
        const balance = (await dag4.account.getBalance() || 0);
        const response = {
          address,
          publicKey,
          balance: balance
        };
        responseArray.push(response);
      }
      return responseArray;
    } else {
      throw new Error('No accounts found');
    }
  }

  public async getPublicKeys (numberOfAccounts = 8, progressUpdateCallback?: (progress: number) => void) {
    if (!this.transport) {
      throw new Error('Error: A transport must be set via the constructor before calling this method');
    }
    if (isNaN(numberOfAccounts) || numberOfAccounts < 1 || Math.floor(numberOfAccounts) !== numberOfAccounts) {
      throw new Error('Error: Number of accounts must be an integer greater than zero');
    }

    const device = await this.getLedgerInfo();

    let results = [];

    // Get the public key for each account
    for (let i = 0; i < numberOfAccounts; i++) {

      const bip44Path = this.createBipPathFromAccount(i);
      const result = await this.sendExchangeMessage(bip44Path, device)

      results.push(result);

      if(progressUpdateCallback) {
        progressUpdateCallback((i+1) / numberOfAccounts)
      }
    }

    device.close();

    return results;
  }


  private async sign (rle: string, bip44Index: number) {

    const bip44Path = this.createBipPathFromAccount(bip44Index);

    console.log('bip44Path', bip44Path);

    const transactionByteLength = Math.ceil(rle.length / 2);

    if (transactionByteLength > MAX_SIGNED_TX_LEN) {
      throw new Error(`Transaction length of ${transactionByteLength} bytes exceeds max length of ${MAX_SIGNED_TX_LEN} bytes.`)
    }

    const ledgerMessage = rle + bip44Path;

    const messages = this.splitMessageIntoChunks(ledgerMessage);

    const device = await this.getLedgerInfo();

    let lastResponse = undefined;
    console.log('splitMessageIntoChunks', messages);
    for (let ix = 0; ix < messages.length; ix++) {
      const request = messages[ix];
      const message = Buffer.from(request, 'hex');
      const response = await device.exchange(message);
      const responseStr = response.toString('hex').toUpperCase();
      console.log('exchange', 'request', request);
      console.log('exchange', 'response', responseStr);
      lastResponse = responseStr;
    }
    device.close();

    let signature = '';
    let success = false;
    let message = lastResponse;
    if (lastResponse !== undefined) {
      if (lastResponse.endsWith('9000')) {
        signature = this.decodeSignature(lastResponse);
        success = true;
      } else {
        if (lastResponse == '6985') {
          message += ' Tx Denied on Ledger';
        }
        if (lastResponse == '6D08') {
          message += ' Tx Too Large for Ledger';
        }
        if (lastResponse == '6D06') {
          message += ' Tx Decoding Buffer Underflow';
        }
      }
    }

    return {
      success,
      message,
      signature,
    };
  }

  private createBipPathFromAccount (index: number) {

    const childIndex = index.toString(16).padStart(8,'0');

    console.log('createBipPathFromAccount', index, childIndex);

    //`m/44'/1137'/0'/0/${index}`

    const bip44Path =
      '8000002C' +
      '80000471' +
      '80000000' +
      '00000000' +
      childIndex

    return bip44Path;
  }


  private async getLedgerInfo () {
    const supported = await this.transport.isSupported();
    if (!supported) {
      throw new Error('Your computer does not support the ledger device.');
    }
    const paths = await this.transport.list();
    if (paths.length === 0) {
      throw new Error('No USB device found.');
    } else {
      return this.transport.open(paths[0]);
    }
  }

  private sendExchangeMessage (bip44Path: String, device: any): Promise<LedgerMessageResponse> {
    return  new Promise((resolve, reject) => {
      const message = Buffer.from(DEVICE_ID + bip44Path, 'hex');
      device.exchange(message).then((response: Buffer) => {
        const responseStr = response.toString('hex').toUpperCase();
        let success = false;
        let message = '';
        let publicKey = '';
        if (responseStr.endsWith('9000')) {
          success = true;
          message = responseStr;
          publicKey = responseStr.substring(0, 130);
        } else {
          if (responseStr == '6E01') {
            message = '6E01 App Not Open On Ledger Device';
            throw new Error(message);
          } else {
            message = responseStr + ' Unknown Error';
          }
        }
        resolve({
          success: success,
          message: message,
          publicKey: publicKey,
        });
      }).catch((error: Error) => {
        reject({
          success: false,
          message: error.message,
        });
      });
    })
  }

  private splitMessageIntoChunks (ledgerMessage: string) {
    const messages = [];
    const bufferSize = 255 * 2;
    let offset = 0;
    while (offset < ledgerMessage.length) {
      let chunk;
      let p1;
      if ((ledgerMessage.length - offset) > bufferSize) {
        chunk = ledgerMessage.substring(offset, offset + bufferSize);
      } else {
        chunk = ledgerMessage.substring(offset);
      }
      if ((offset + chunk.length) == ledgerMessage.length) {
        p1 = '80';
      } else {
        p1 = '00';
      }

      const chunkLength = chunk.length / 2;

      let chunkLengthHex = chunkLength.toString(16);
      while (chunkLengthHex.length < 2) {
        chunkLengthHex = '0' + chunkLengthHex;
      }

      messages.push('8002' + p1 + '00' + chunkLengthHex + chunk);
      offset += chunk.length;
    }

    return messages;
  }

  private decodeSignature (response: string) {
    const rLenHex = response.substring(6, 8);
    const rLen = parseInt(rLenHex, 16) * 2;
    const rStart = 8;
    const rEnd = rStart + rLen;

    const sLenHex = response.substring(rEnd + 2, rEnd + 4);
    const sLen = parseInt(sLenHex, 16) * 2;
    const sStart = rEnd + 4;
    const sEnd = sStart + sLen;

    return response.substring(0, sEnd);
  }


}

type LedgerMessageResponse = {
  success: boolean,
  message: string,
  publicKey: string,
}

