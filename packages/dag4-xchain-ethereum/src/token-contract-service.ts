import {ethers} from 'ethers';
import { Contract, Signer } from 'ethers';

import BalanceCheckerABI from './abis/BalanceChecker.abi.json';
import MetaABI from './abis/Meta.abi.json';
import BigNumber from 'bignumber.js';

type Provider = ethers.providers.Provider;

interface Options {
  contractAddress?: string;
}

type BalanceMap = {
  [tokenAddress: string]: string;
}

type AddressBalanceMap = {
  [address: string]: BalanceMap;
}

const TOKEN_BALANCE_CONTRACT = '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39';

export class TokenContractService {

  formatAddressBalances<T> (values: T[], addresses: string[], tokens: string[]) {
    const balances: AddressBalanceMap = {};
    addresses.forEach((addr, addrIdx) => {
      balances[addr] = {};
      tokens.forEach((tokenAddr, tokenIdx) => {
        const balance = values[addrIdx * tokens.length + tokenIdx];
        balances[addr][tokenAddr] = balance.toString();
      });
    });
    return balances;
  }


  async getAddressBalances (
    provider: Provider | Signer,
    address: string,
    tokens: string[]
  ) {

    const contract = new Contract(
      TOKEN_BALANCE_CONTRACT,
      BalanceCheckerABI as any,
      provider
    );

    const balances = await contract.balances([address], tokens);

    return this.formatAddressBalances<BigNumber>(balances, [address], tokens)[address];
  }


  async getTokenInfo (
    provider: Provider | Signer,
    tokenAddress: string
  ) {

    let name = '', decimals, symbol;

    const contract = new Contract(tokenAddress, MetaABI as any, provider);

    try {
      decimals = await contract.decimals();
      symbol = await contract.symbol();
      name = await contract.name();
    }
    catch (e) {
      throw new Error(e.message);
    }

    return {
      address: tokenAddress,
      decimals,
      symbol,
      name
    }
  }
}


export const tokenContractService = new TokenContractService();
