import { Contract } from 'ethers';
import SINGLE_CALL_BALANCES_ABI from 'single-call-balance-checker-abi';
import ERC_20_ABI from 'erc-20-abi';
// const TOKEN_BALANCE_CONTRACT = '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39';
const NETWORK_TO_CONTRACT_MAP = {
    1: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
    3: '0x9a5f9a99054a513d1d6d3eb1fef7d06981b4ba9d',
    4: '0x3183B673f4816C94BeF53958BaF93C671B7F8Cf2'
};
export class TokenContractService {
    formatAddressBalances(values, addresses, tokens) {
        const balances = {};
        addresses.forEach((addr, addrIdx) => {
            balances[addr] = {};
            tokens.forEach((tokenAddr, tokenIdx) => {
                const balance = values[addrIdx * tokens.length + tokenIdx];
                balances[addr][tokenAddr] = balance;
            });
        });
        return balances;
    }
    async getAddressBalances(provider, ethAddress, tokenContractAddress, chainId = 1) {
        const contract = new Contract(NETWORK_TO_CONTRACT_MAP[chainId], SINGLE_CALL_BALANCES_ABI, provider);
        const balances = await contract.balances([ethAddress], tokenContractAddress);
        return this.formatAddressBalances(balances, [ethAddress], tokenContractAddress)[ethAddress];
    }
    async getTokenBalance(provider, ethAddress, tokenContractAddress, chainId = 1) {
        const contract = new Contract(NETWORK_TO_CONTRACT_MAP[chainId], SINGLE_CALL_BALANCES_ABI, provider);
        const balances = await contract.balances([ethAddress], [tokenContractAddress]);
        return this.formatAddressBalances(balances, [ethAddress], [tokenContractAddress])[ethAddress];
    }
    async getTokenInfo(provider, tokenContractAddress) {
        let name = '', decimals, symbol;
        const contract = new Contract(tokenContractAddress, ERC_20_ABI, provider);
        try {
            decimals = await contract.decimals();
            symbol = await contract.symbol();
            name = await contract.name();
        }
        catch (e) {
            throw new Error(e.message);
        }
        return {
            address: tokenContractAddress,
            decimals,
            symbol,
            name
        };
    }
}
export const tokenContractService = new TokenContractService();
//# sourceMappingURL=token-contract-service.js.map