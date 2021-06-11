// max length in bytes.
const MAX_SIGNED_TX_LEN = 512;

const debug = false;

const DEVICE_ID = '8004000000';

////////////////////
// Interfaces
////////////////////

interface Message {
  enabled: boolean;
  error: boolean;
  message: String;
}

////////////////////
// Class
////////////////////

export class LedgerLink {

  ////////////////////
  // Properties
  ////////////////////

  transport: any;

  ////////////////////
  // Constructor
  ////////////////////

  constructor (transport: any) {
    this.transport = transport;
  }

  ////////////////////
  // Private
  ////////////////////

  private createBipPathFromAccount (index: number) {
    console.log('createBipPathFromAccount', index);

    const bip44Path =
      '8000002C' +
      '80000471' +
      '80000000' +
      '00000000' +
      `0000000${index}`;

    return bip44Path;

    // return `8000002C80000471${account}0000000000000000`;
  }


  private async getLedgerInfo () {
    const supported = await this.transport.isSupported();
    if (!supported) {
      throw new Error('Your computer does not support the ledger device.');
    }
    const paths: string[] = await this.transport.list();
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

  ///////////////////////
  // Public Methods
  ///////////////////////

  public async getPublicKeys (numberOfAccounts: number, progressUpdateCallback?: (progress: number) => void) {
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


  async sign (rle: string) {

    const bip44Path =
      '8000002C' +
      '80000471' +
      '80000000' +
      '00000000' +
      '00000000';

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
    /**
     * https://stackoverflow.com/questions/25829939/specification-defining-ecdsa-signature-data
     * <br>
     * the signature is TLV encoded.
     * the first byte is 30, the "signature" type<br>
     * the second byte is the length (always 44)<br>
     * the third byte is 02, the "number: type<br>
     * the fourth byte is the length of R (always 20)<br>
     * the byte after the encoded number is 02, the "number: type<br>
     * the byte after is the length of S (always 20)<br>
     * <p>
     * eg:
     * 304402200262675396fbcc768bf505c9dc05728fd98fd977810c547d1a10c7dd58d18802022069c9c4a38ee95b4f394e31a3dd6a63054f8265ff9fd2baf68a9c4c3aa8c5d47e9000
     * is
     * 30LL0220RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR0220SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
     */

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

