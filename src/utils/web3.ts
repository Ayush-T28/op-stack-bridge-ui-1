import { erc20Abi } from "viem";
import Web3 from "web3";

// Function to simulate sleep
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function waitForReceipt(txHash: string): Promise<any> {
    const web3 = new Web3(window.ethereum);
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const receipt = await web3.eth.getTransactionReceipt(txHash);
            if (receipt !== null) {
                return receipt;
            }
            // Sleep for some time before checking again
            await sleep(5000); // 5 seconds
        } catch (err) {
            // Handle error
            console.error("Error fetching transaction receipt:", err);
            throw err;
        }
    }
}

export const getBalance = async (level: "l1" | "l2", address: `0x${string}`, token: any, rpc: string) => {
    if(!address){
      return;
    }
    if (level === 'l2') {
      const walletAddress = address as `0x${string}`;
      const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
      const balance = await web3.eth.getBalance(walletAddress); //Will give value in.balance = web3.toDecimal(balance);
      return balance;
    } else {
      const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
      const contract = new web3.eth.Contract(erc20Abi, token.contractAddress)
      const balance: bigint = await contract.methods.balanceOf(address).call();
      return balance;
    }
}