/* eslint-disable no-async-promise-executor */
import { Chain } from "@rainbow-me/rainbowkit";
import {  ChainContract, createPublicClient, createWalletClient, custom, defineChain, http } from "viem";
import { getTransactionReceipt, switchChain } from "viem/actions";
import { chainConfig, getWithdrawals, publicActionsL1, publicActionsL2, walletActionsL1 } from 'viem/op-stack'
import { optimismPortalProxyABI } from "../constants/contracts";
import Web3 from "web3";

export function prove(transaction_hash: '0x${string}', l1: Chain, l2: Chain, currentChain: Chain, address: string): Promise<string>{
    
    return new Promise(async (resolve, reject) => {

        let txHash: string = '';

        try{

            if(currentChain !== l1){
                await switchChain(window.ethereum!, {id: l1.id});
            }
        
            const customL1Chain = defineChain({
                ...chainConfig,
                name: l1.name,
                id: l1.id,
                nativeCurrency: l1.nativeCurrency,
                rpcUrls: l1.rpcUrls,
                contracts: {
                    portal: {
                        [l1.id]: {  // Dynamic key assignment
                            address: (l1.contracts!.optimismPortalProxy as any).address as any,
                        }
                    },
                    l2OutputOracle: {
                        [l1.id]: {  // Dynamic key assignment
                            address: (l1.contracts!.l2OutputOracle as any).address as any,
                        }
                    },
                },
                blockExplorers: l1.blockExplorers,
            }) as any;
        
            const customL2Chain = defineChain({
                ...chainConfig,
                name: l2.name,
                id: l2.id,
                nativeCurrency: l2.nativeCurrency,
                rpcUrls: l2.rpcUrls,
                contracts: {
                    portal: {
                        [l1.id]: {  // Dynamic key assignment
                            address: (l1.contracts!.optimismPortalProxy as any).address as any,
                        }
                    },
                    l2OutputOracle: {
                        [l1.id]: {  // Dynamic key assignment
                            address: (l1.contracts!.l2OutputOracle as any).address as any,
                        }
                    },
                },
                blockExplorers: l2.blockExplorers,
            }) as any;
        
            const [account] = await window.ethereum.request({ 
                method: 'eth_requestAccounts'
              }) 
        
            const l1Client = createPublicClient({ 
                chain: l1, 
                transport: http(), 
            }).extend(publicActionsL1());
        
            const l2Client = createPublicClient({ 
                chain: customL2Chain, 
                transport: http(), 
            }).extend(publicActionsL2());
        
            const receipt = await getTransactionReceipt(l2Client, {
                hash: transaction_hash,
            });
        
            const [withdrawal] = getWithdrawals(receipt);
        
            const output = await l1Client.getL2Output({
                l2BlockNumber: receipt.blockNumber,
                targetChain: customL1Chain,
            });
                
            const args = await l2Client.buildProveWithdrawal({
                chain: l1,
                account,
                output,
                withdrawal: withdrawal,
            });
        
            const web3 = new Web3(window.ethereum)
        
            const contract = new web3.eth.Contract(optimismPortalProxyABI, (l1.contracts!.optimismPortalProxy as ChainContract).address)
        
        
            // Send the transaction and subscribe to the transactionHash event
            const proveWithdrawal = contract.methods
            .proveWithdrawal(
                [
                    withdrawal.nonce,
                    withdrawal.sender,
                    withdrawal.target,
                    withdrawal.value,
                    withdrawal.gasLimit,
                    withdrawal.data,
                ],
                output.outputIndex,
                [
                    args.outputRootProof.version,
                    args.outputRootProof.stateRoot,
                    args.outputRootProof.messagePasserStorageRoot,
                    args.outputRootProof.latestBlockhash,
                ],
                args.withdrawalProof
            )
        
            const gasLimit = await proveWithdrawal.estimateGas({from: address});
        
            const functionArgs = {
                from: address,
                gas: gasLimit.toString(), // Set your desired gas limit here
            }
        
            const txPromiEvent = proveWithdrawal.send(functionArgs);
        
            // Subscribe to the transactionHash event
            txPromiEvent.on('transactionHash', (hash: string) => {
                txHash = hash;
            });
        
            // Subscribe to the confirmation event
            txPromiEvent.on('confirmation', (confirmations) => {
                if (confirmations.confirmations > 0) {
                    resolve(txHash);

                }
            });
        
            // Handle errors
            txPromiEvent.on('error', (error) => {
                console.error('Transaction error:', error);
                reject(error);
            });
    
            }
            catch(err: any){
                console.log('error proving withdrawl: ' , err);
                reject(err);
            }
    })

}


export async function finalize(transaction_hash: '0x${string}', l1: Chain, l2: Chain, currentChain: Chain){
    if(currentChain !== l1){
        await switchChain(window.ethereum!, {id: l1.id});
    }

    const customL2Chain = defineChain({
        ...chainConfig,
        name: l2.name,
        id: l2.id,
        nativeCurrency: l2.nativeCurrency,
        rpcUrls: l2.rpcUrls,
        contracts: {
            portal: {
                [l1.id]: {  // Dynamic key assignment
                    address: (l1.contracts!.optimismPortalProxy as any).address as any,
                }
            },
            l2OutputOracle: {
                [l1.id]: {  // Dynamic key assignment
                    address: (l1.contracts!.l2OutputOracle as any).address as any,
                }
            },
        },
        blockExplorers: l2.blockExplorers,
    }) as any;

    const [account] = await window.ethereum.request({ 
        method: 'eth_requestAccounts'
    });

    const walletClientL1 = createWalletClient({
        account,
        chain: l1,
        transport: custom(window.ethereum)
    }).extend(walletActionsL1())

    const l2Client = createPublicClient({ 
        chain: customL2Chain, 
        transport: http(), 
    }).extend(publicActionsL2());

    try{
    const receipt = await getTransactionReceipt(l2Client, {
        hash: transaction_hash,
    })
    
    const [withdrawal] = getWithdrawals(receipt)

    const hash = await walletClientL1.finalizeWithdrawal({ 
    account, 
    targetChain: l2Client.chain, 
    withdrawal, 
    });
    return [hash, null];
    }
    catch(err: any){
        console.log(err);
        return [null, err.message]
    }
}