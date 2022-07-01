"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenContractService = exports.TokenContractService = void 0;
const ethers_1 = require("ethers");
const single_call_balance_checker_abi_1 = __importDefault(require("single-call-balance-checker-abi"));
const erc_20_abi_1 = __importDefault(require("erc-20-abi"));
// const TOKEN_BALANCE_CONTRACT = '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39';
const NETWORK_TO_CONTRACT_MAP = {
    1: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
    3: '0x9a5f9a99054a513d1d6d3eb1fef7d06981b4ba9d',
    4: '0x3183B673f4816C94BeF53958BaF93C671B7F8Cf2'
};
class TokenContractService {
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
        const contract = new ethers_1.Contract(NETWORK_TO_CONTRACT_MAP[chainId], single_call_balance_checker_abi_1.default, provider);
        const balances = await contract.balances([ethAddress], tokenContractAddress);
        return this.formatAddressBalances(balances, [ethAddress], tokenContractAddress)[ethAddress];
    }
    async getTokenBalance(provider, ethAddress, tokenContractAddress, chainId = 1) {
        const contract = new ethers_1.Contract(NETWORK_TO_CONTRACT_MAP[chainId], single_call_balance_checker_abi_1.default, provider);
        const balances = await contract.balances([ethAddress], [tokenContractAddress]);
        return this.formatAddressBalances(balances, [ethAddress], [tokenContractAddress])[ethAddress];
    }
    async getTokenInfo(provider, tokenContractAddress) {
        let name = '', decimals, symbol;
        const contract = new ethers_1.Contract(tokenContractAddress, erc_20_abi_1.default, provider);
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
exports.TokenContractService = TokenContractService;
exports.tokenContractService = new TokenContractService();
//# sourceMappingURL=token-contract-service.js.map