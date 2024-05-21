import { Chain } from "@rainbow-me/rainbowkit";
import {  createPublicClient, createWalletClient, custom, defineChain, http } from "viem";
import { getTransactionReceipt, switchChain } from "viem/actions";
import { chainConfig, getWithdrawals, publicActionsL1, publicActionsL2, walletActionsL1 } from 'viem/op-stack'

export async function prove(transaction_hash: '0x${string}', l1: Chain, l2: Chain, currentChain: Chain){
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
                    address: '0xD0608c887Ac8B97C20a0fC6574b6Eb6e978f42cD'
                }
            },
            l2OutputOracle: {
                [l1.id]: {  // Dynamic key assignment
                    address: '0xc961e9814733bcaE318F85b23D5530376A0a4297'
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
                    address: '0xD0608c887Ac8B97C20a0fC6574b6Eb6e978f42cD'
                }
            },
            l2OutputOracle: {
                [l1.id]: {  // Dynamic key assignment
                    address: '0xc961e9814733bcaE318F85b23D5530376A0a4297'
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

    const walletClientL1 = createWalletClient({
        account,
        chain: l1,
        transport: custom(window.ethereum)
    }).extend(walletActionsL1())

    const l2Client = createPublicClient({ 
        chain: customL2Chain, 
        transport: http(), 
    }).extend(publicActionsL2());

    const receipt = await getTransactionReceipt(l2Client, {
        hash: transaction_hash,
    });


    const [withdrawal] = getWithdrawals(receipt);

    let output;

    try{
        output = await l1Client.getL2Output({
        l2BlockNumber: receipt.blockNumber,
        targetChain: customL1Chain,
        })
    }
    catch(err){
        console.log(err);
        return [null, 'Block not proposed yet. Try again after 15 minutes']
    }
    
    try{
        const args = await l2Client.buildProveWithdrawal({
            chain: l1,
            account,
            output,
            withdrawal: withdrawal,
        })
        
        const hash = await walletClientL1.proveWithdrawal({
            account,
            l2OutputIndex: output.outputIndex,
            outputRootProof: args.outputRootProof,
            withdrawalProof: args.withdrawalProof,
            withdrawal,
            targetChain: customL2Chain,
        });

    return [hash, null];
    }
    catch(err: any){
        return [null, err]
    }
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
                    address: '0xD0608c887Ac8B97C20a0fC6574b6Eb6e978f42cD'
                }
            },
            l2OutputOracle: {
                [l1.id]: {  // Dynamic key assignment
                    address: '0xc961e9814733bcaE318F85b23D5530376A0a4297'
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

    const receipt = await getTransactionReceipt(l2Client, {
        hash: transaction_hash,
      })
       
      const [withdrawal] = getWithdrawals(receipt)

      try{
            
            const hash = await walletClientL1.finalizeWithdrawal({ 
            account, 
            targetChain: l2Client.chain, 
            withdrawal, 
            });

            return [hash, null];
      }
      catch(err: any){
            return [null, err]
      }
}