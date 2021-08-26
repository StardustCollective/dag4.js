
export interface Web3Provider<T=any> {
    getBalance(address: string): Promise<BigNumberLike>;
    getTransactionCount(address: string): Promise<number>;
    getTransactionHistory (address: string, limit?: number): Promise<T[]>;
    getTokenTransactionHistory (address: string, limit?: number): Promise<T[]>;
    getTokenAddressBalances (addresses: string[], tokenContractAddress?: string[]): Promise<{[tokenAddress: string]: BigNumberLike}>
}

export type BigNumberLike = any;