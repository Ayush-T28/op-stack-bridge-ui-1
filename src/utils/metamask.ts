import { Chain } from "@rainbow-me/rainbowkit";
import Web3 from "web3";

export async function addChain(chain: Chain, customToken: any) {
    if (window.ethereum && window.ethereum.request) {
        const chainId = Web3.utils.toHex(chain.id);
        try {
            const chainData = await window.ethereum.request({
                method: 'eth_chainId'
            });
            const currentChainId = Web3.utils.toHex(chainData);
            if (currentChainId !== chainId) {
                const params = [{
                    chainId: chainId,
                    chainName: chain.name,
                    nativeCurrency: { name: customToken.name, symbol: customToken.symbol, decimals: 18 },
                    rpcUrls: [chain.rpcUrls.default.http[0]],
                    blockExplorerUrls: [chain.blockExplorers?.default.url],
                }];

                // If chain is not present, add it
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params,
                });
            }
        } catch (error) {
            console.error("Error adding chain to Metamask:", error);
        }
    }
}