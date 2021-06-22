import {ExplorerUrl, InfuraCreds} from '@xchainjs/xchain-ethereum';
import { Network} from '@xchainjs/xchain-client';
import {BigNumber, ethers, FixedNumber} from 'ethers';
import {Client} from '@xchainjs/xchain-ethereum';
import {tokenContractService} from './token-contract-service';

import * as utils from '@xchainjs/xchain-util';

export {utils};

type XClientEthParams = {
  explorerUrl?: ExplorerUrl
  etherscanApiKey?: string
  infuraCreds?: InfuraCreds
  network?: Network;
  privateKey?: string;
}

const InfuraProvider = ethers.providers.InfuraProvider;

export class XChainEthClient extends Client {

  private infuraProjectId: string;

  constructor ({network = 'testnet', explorerUrl, privateKey, etherscanApiKey, infuraCreds}: XClientEthParams) {
    super({network, explorerUrl, etherscanApiKey, infuraCreds});

    if (infuraCreds.projectId) {
      this.infuraProjectId = infuraCreds.projectId;
    }

    this['changeWallet'](new ethers.Wallet(privateKey, this.getProvider()));
  }

  isValidEthereumAddress (address: string) {
    return ethers.utils.isAddress(address);
  }

  getTransactionCount(address: string, chainId = 1) {
    const infuraProvider = new InfuraProvider(chainId, this.infuraProjectId);

    return infuraProvider.getTransactionCount(address, 'pending');
  }

  async getTokenBalance (ethAddress: string, token: TokenInfo, chainId = 1) {
    const infuraProvider = new InfuraProvider(chainId, this.infuraProjectId);
    const tokenBalances = await tokenContractService.getTokenBalance(infuraProvider, ethAddress, token.address, chainId);

    return FixedNumber.fromValue(BigNumber.from(tokenBalances[token.address]), token.decimals).toUnsafeFloat()
  }

  async waitForTransaction (hash: string, chainId = 1) {
    const infuraProvider = new InfuraProvider(chainId, this.infuraProjectId);

    return infuraProvider.waitForTransaction(hash);
  }

  async getTokenInfo (address: string, chainId = 1) {
    if (this.isValidEthereumAddress(address)) {
      const infuraProvider = new InfuraProvider(chainId, this.infuraProjectId);
      try {
        const result = await tokenContractService.getTokenInfo(infuraProvider, address);
        console.log('getTokenInfo');
        return result;
      }
      catch(e) {
        console.log('getTokenInfo.ERROR -', e.message);
        return null;
      }
    }
    return null;
  }

  async isContractAddress(address: string, chainId = 1) {
    if (this.isValidEthereumAddress(address)) {
      const provider = new InfuraProvider(chainId, this.infuraProjectId);
      const code = await provider.getCode(address);
      console.log('isContractAddress');
      console.log(code);
      return code !== '0x';
    }
    return false;
  }

}

type TokenInfo = {
  "address": string,
  "decimals": number,
  "symbol"?: string,
  "name"?: string,
  "logoURI"?: string
  "balance"?: string
}



//Get Token Info by ContractAddress
//https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=0x0e3a2a1f2146d86a604adc220b4967a898d7fe07&apikey=YourApiKeyToken
