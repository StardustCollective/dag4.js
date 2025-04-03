/**
 * Interface for Web3 providers.
 * Defines methods for interacting with blockchain networks.
 * @template T - The type of transaction data
 */
export interface Web3Provider<T=any> {
    /**
     * Gets the balance of an address.
     * @param address - The address to get the balance for
     * @returns A promise that resolves to the balance
     */
    getBalance(address: string): Promise<BigNumberLike>;
    
    /**
     * Gets the transaction count for an address.
     * @param address - The address to get the transaction count for
     * @returns A promise that resolves to the transaction count
     */
    getTransactionCount(address: string): Promise<number>;
    
    /**
     * Gets the transaction history for an address.
     * @param address - The address to get the transaction history for
     * @param limit - The maximum number of transactions to return
     * @returns A promise that resolves to the transaction history
     */
    getTransactionHistory (address: string, limit?: number): Promise<T[]>;
    
    /**
     * Gets the token transaction history for an address.
     * @param address - The address to get the token transaction history for
     * @param limit - The maximum number of transactions to return
     * @returns A promise that resolves to the token transaction history
     */
    getTokenTransactionHistory (address: string, limit?: number): Promise<T[]>;
    
    /**
     * Gets the token balances for multiple addresses.
     * @param addresses - The addresses to get the token balances for
     * @param tokenContractAddress - The token contract addresses to check
     * @returns A promise that resolves to a map of token addresses to balances
     */
    getTokenAddressBalances (addresses: string[], tokenContractAddress?: string[]): Promise<{[tokenAddress: string]: BigNumberLike}>
}

/**
 * Type representing a big number-like value.
 * This is a placeholder for the actual big number implementation.
 */
export type BigNumberLike = any;