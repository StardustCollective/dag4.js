"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XChainEthClient = exports.utils = void 0;
const ethers_1 = require("ethers");
const xchain_ethereum_1 = require("@xchainjs/xchain-ethereum");
const token_contract_service_1 = require("./token-contract-service");
const erc_20_abi_1 = __importDefault(require("erc-20-abi"));
const utils = __importStar(require("@xchainjs/xchain-util"));
exports.utils = utils;
const InfuraProvider = ethers_1.ethers.providers.InfuraProvider;
class XChainEthClient extends xchain_ethereum_1.Client {
    infuraProjectId;
    constructor({ network = 'testnet', explorerUrl, privateKey, etherscanApiKey, infuraCreds }) {
        super({ network, explorerUrl, etherscanApiKey, infuraCreds });
        if (infuraCreds.projectId) {
            this.infuraProjectId = infuraCreds.projectId;
        }
        this['changeWallet'](new ethers_1.ethers.Wallet(privateKey, this.getProvider()));
    }
    async estimateTokenTransferGasLimit(recipient, contractAddress, txAmount, defaultValue) {
        try {
            const contract = new ethers_1.ethers.Contract(contractAddress, erc_20_abi_1.default, this.getProvider());
            const gasLimit = await contract.estimateGas.transfer(recipient, txAmount, { from: this.getAddress() });
            return gasLimit.toNumber();
        }
        catch (e) {
            return defaultValue;
        }
    }
    isValidEthereumAddress(address) {
        return ethers_1.ethers.utils.isAddress(address);
    }
    getTransactionCount(address, chainId = 1) {
        const infuraProvider = new InfuraProvider(chainId, this.infuraProjectId);
        return infuraProvider.getTransactionCount(address, 'pending');
    }
    async getTokenBalance(ethAddress, token, chainId = 1) {
        const infuraProvider = new InfuraProvider(chainId, this.infuraProjectId);
        const tokenBalances = await token_contract_service_1.tokenContractService.getTokenBalance(infuraProvider, ethAddress, token.address, chainId);
        return ethers_1.FixedNumber.fromValue(ethers_1.BigNumber.from(tokenBalances[token.address]), token.decimals).toUnsafeFloat();
    }
    async waitForTransaction(hash, chainId = 1) {
        const infuraProvider = new InfuraProvider(chainId, this.infuraProjectId);
        return infuraProvider.waitForTransaction(hash);
    }
    async getTokenInfo(address, chainId = 1) {
        if (this.isValidEthereumAddress(address)) {
            const infuraProvider = new InfuraProvider(chainId, this.infuraProjectId);
            try {
                const result = await token_contract_service_1.tokenContractService.getTokenInfo(infuraProvider, address);
                console.log('getTokenInfo');
                return result;
            }
            catch (e) {
                console.log('getTokenInfo.ERROR -', e.message);
                return null;
            }
        }
        return null;
    }
    async isContractAddress(address, chainId = 1) {
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
exports.XChainEthClient = XChainEthClient;
//Get Token Info by ContractAddress
//https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=0x0e3a2a1f2146d86a604adc220b4967a898d7fe07&apikey=YourApiKeyToken
//# sourceMappingURL=client.js.map