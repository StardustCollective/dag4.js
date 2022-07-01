import { ExplorerUrl, InfuraCreds } from '@xchainjs/xchain-ethereum';
import { Network } from '@xchainjs/xchain-client';
import { BigNumber, ethers } from 'ethers';
import { Client } from '@xchainjs/xchain-ethereum';
import * as utils from '@xchainjs/xchain-util';
export { utils };
declare type XClientEthParams = {
    explorerUrl?: ExplorerUrl;
    etherscanApiKey?: string;
    infuraCreds?: InfuraCreds;
    network?: Network;
    privateKey?: string;
};
export declare class XChainEthClient extends Client {
    private infuraProjectId;
    constructor({ network, explorerUrl, privateKey, etherscanApiKey, infuraCreds }: XClientEthParams);
    estimateTokenTransferGasLimit(recipient: string, contractAddress: string, txAmount: BigNumber, defaultValue?: number): Promise<number>;
    isValidEthereumAddress(address: string): boolean;
    getTransactionCount(address: string, chainId?: number): Promise<number>;
    getTokenBalance(ethAddress: string, token: TokenInfo, chainId?: number): Promise<number>;
    waitForTransaction(hash: string, chainId?: number): Promise<ethers.providers.TransactionReceipt>;
    getTokenInfo(address: string, chainId?: number): Promise<{
        address: string;
        decimals: any;
        symbol: any;
        name: string;
    }>;
    isContractAddress(address: string, chainId?: number): Promise<boolean>;
}
declare type TokenInfo = {
    "address": string;
    "decimals": number;
    "symbol"?: string;
    "name"?: string;
    "logoURI"?: string;
    "balance"?: string;
};
