import { ethers } from 'ethers';
import { Signer } from 'ethers';
declare type Provider = ethers.providers.Provider;
declare type BalanceMap = {
    [tokenAddress: string]: string;
};
declare type AddressBalanceMap = {
    [address: string]: BalanceMap;
};
export declare class TokenContractService {
    formatAddressBalances(values: string[], addresses: string[], tokens: string[]): AddressBalanceMap;
    getAddressBalances(provider: Provider | Signer, ethAddress: string, tokenContractAddress: string[], chainId?: number): Promise<BalanceMap>;
    getTokenBalance(provider: Provider | Signer, ethAddress: string, tokenContractAddress: string, chainId?: number): Promise<BalanceMap>;
    getTokenInfo(provider: Provider | Signer, tokenContractAddress: string): Promise<{
        address: string;
        decimals: any;
        symbol: any;
        name: string;
    }>;
}
export declare const tokenContractService: TokenContractService;
export {};
