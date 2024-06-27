import { Chain } from "@rainbow-me/rainbowkit";
import { createWalletClient, custom } from 'viem';

export async function addChain(chain: Chain) {
    if (window.ethereum && window.ethereum.request) {
                const walletClient = createWalletClient({
            transport: custom(window.ethereum!),
        });
        await walletClient.addChain({ chain: chain }) 
    }
}