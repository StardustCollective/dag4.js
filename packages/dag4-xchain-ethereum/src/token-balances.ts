import {ethers} from 'ethers';
import { Contract, Signer } from 'ethers';

import BalanceCheckerABI from './abis/BalanceChecker.abi.json';
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

const DEFAULT_CONTRACT_ADDRESS = '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39';

function formatAddressBalances<T>(values: T[], addresses: string[], tokens: string[]) {
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


export async function getAddressBalances(
  provider: Provider | Signer,
  address: string,
  tokens: string[],
  options: Options = {},
) {

  const contract = new Contract(
    DEFAULT_CONTRACT_ADDRESS,
    BalanceCheckerABI as any,
    provider
  );

  const balances = await contract.balances([address], tokens);

  return formatAddressBalances<BigNumber>(balances, [address], tokens)[address];
}





