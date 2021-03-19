import {ExplorerUrl, InfuraCreds} from '@xchainjs/xchain-ethereum';
import {Network} from '@xchainjs/xchain-client';
import {BigNumber, ethers, FixedNumber} from 'ethers';
import {Client} from '@xchainjs/xchain-ethereum';
import knownTokenList from './data/tokens.json';
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

type InfuraProvider = ethers.providers.InfuraProvider;


export class XChainEthClient extends Client {

  private infuraProvider: InfuraProvider;

  constructor ({ network = 'testnet', explorerUrl, privateKey, etherscanApiKey, infuraCreds }: XClientEthParams) {
    super({ network, explorerUrl, etherscanApiKey, infuraCreds });

    if (infuraCreds.projectId) {
      this.infuraProvider = new ethers.providers.InfuraProvider(null, infuraCreds.projectId);
    }

    this['changeWallet'](new ethers.Wallet(privateKey, this.getProvider()));
  }

  isValidEthereumAddress (address: string) {
    return ethers.utils.isAddress(address);
  }

  getTokenInfo (address: string) {
    return tokenContractService.getTokenInfo(this.infuraProvider, address);
  }

  getKnownTokens (chainId: number) {
    return knownTokenList.filter(t => t.chainId === chainId);
  }

  async getKnownTokenBalances (address: string, customList: CustomAsset[], chainId = 1) {

    const map = {};

    const tokens = customList.map(t => {
      map[t.address] = { ...t };
      return t.address;
    })
    .concat(this.getKnownTokens(chainId).map(t => {
      map[t.address] = { ...t };
      return t.address
    }));

    //const provider = ethers.getDefaultProvider(null, { ethers: this.infuraProjectId, quorum: 1});



    const ethBalance = await this.infuraProvider.getBalance(address);

    const ethBalanceNum = FixedNumber.fromValue(BigNumber.from(ethBalance), 18).toUnsafeFloat()

    const tokenBalances = await tokenContractService.getAddressBalances(this.infuraProvider, address, tokens);

    const assetBalances = Object.keys(tokenBalances).map(address => {
      const assetInfo: CustomAsset = map[address];

      assetInfo.balance = FixedNumber.fromValue(BigNumber.from(tokenBalances[address]), assetInfo.decimals).toUnsafeFloat()

      return assetInfo;
    });

    const ethAsset: CustomAsset = {address: '0x0', symbol: 'ETH', decimals: 18, balance: ethBalanceNum};

    return [ethAsset].concat(assetBalances.filter(b => b.balance > 0));

  }
}

type CustomAsset = {
  "address": string,
  "name"?: string,
  "symbol": string,
  "decimals": number,
  "logoURI"?: string
  "balance"?: number
}

//Get Token Info by ContractAddress
//https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=0x0e3a2a1f2146d86a604adc220b4967a898d7fe07&apikey=YourApiKeyToken
