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