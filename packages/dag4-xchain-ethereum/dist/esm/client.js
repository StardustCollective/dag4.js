import { BigNumber, ethers, FixedNumber } from 'ethers';
import { Client } from '@xchainjs/xchain-ethereum';
import { tokenContractService } from './token-contract-service';
import ERC_20_ABI from 'erc-20-abi';
import * as utils from '@xchainjs/xchain-util';
export { utils };
const InfuraProvider = ethers.providers.InfuraProvider;
export class XChainEthClient extends Client {
    constructor({ network = 'testnet', explorerUrl, privateKey, etherscanApiKey, infuraCreds }) {
        super({ network, explorerUrl, etherscanApiKey, infuraCreds });
        if (infuraCreds.projectId) {
            this.infuraProjectId = infuraCreds.projectId;
        }
        this['changeWallet'](new ethers.Wallet(privateKey, this.getProvider()));
    }
    async estimateTokenTransferGasLimit(recipient, contractAddress, txAmount, defaultValue) {
        try {
            const contract = new ethers.Contract(contractAddress, ERC_20_ABI, this.getProvider());
            const gasLimit = await contract.estimateGas.transfer(recipient, txAmount, { from: this.getAddress() });
            return gasLimit.toNumber();
        }
        catch (e) {
            return defaultValue;
        }
    }
    isValidEthereumAddress(address) {
        return ethers.utils.isAddress(address);
    }
    getTransactionCount(address, chainId = 1) {
        const infuraProvider = new InfuraProvider(chainId, this.infuraProjectId);
        return infuraProvider.getTransactionCount(address, 'pending');
    }
    async getTokenBalance(ethAddress, token, chainId = 1) {
        const infuraProvider = new InfuraProvider(chainId, this.infuraProjectId);
        const tokenBalances = await tokenContractService.getTokenBalance(infuraProvider, ethAddress, token.address, chainId);
        return FixedNumber.fromValue(BigNumber.from(tokenBalances[token.address]), token.decimals).toUnsafeFloat();
    }
    async waitForTransaction(hash, chainId = 1) {
        const infuraProvider = new InfuraProvider(chainId, this.infuraProjectId);
        return infuraProvider.waitForTransaction(hash);
    }
    async getTokenInfo(address, chainId = 1) {
        if (this.isValidEthereumAddress(address)) {
            const infuraProvider = new InfuraProvider(chainId, this.infuraProjectId);
            try {
                const result = await tokenContractService.getTokenInfo(infuraProvider, address);
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
//Get Token Info by ContractAddress
//https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=0x0e3a2a1f2146d86a604adc220b4967a898d7fe07&apikey=YourApiKeyToken
//# sourceMappingURL=client.js.map