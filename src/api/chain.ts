import { Chain } from "@rainbow-me/rainbowkit";
import axiosBackendInstance from "../utils/axios";

export async function getChain(level: "l1"|"l2"): Promise<Chain> {
    const data = (await axiosBackendInstance.get(`/chain/${level}`)).data.data;
    
    const chain: Chain = {
        id: data.chainId,
        name:data.name,
        iconUrl: data.iconUrl,
        iconBackground: '#fff',
        nativeCurrency: { name: data.currency, symbol: data.currencySymbol, decimals: 18 },
        rpcUrls: {
          default: { http: [data.rpcUrl] },
        },
        blockExplorers: {
          default: { name: data.explorer, url: data.explorerUrl },
        },
        contracts: {
        },
    }

    if(level === 'l1'){
        chain.contracts = {
            "optimismPortalProxy": {
                address: data.optimismPortalProxy,
                blockCreated: 0, // actual value doesnt matter
            },
            "l2OutputOracle": {
                address: data.l2OutputOracleProxy,
                blockCreated: 0,
            },
        }
    }
    else{
        chain.contracts = {
            "l2ToL1MessagePasserProxy": {
                address: data.l2ToL1MessagePasserProxy,
                blockCreated: 0,
            }
        }

        chain.custom = {
            "finalizationPeriod" : data.finalizationPeriod
        }
    }

    return chain;
}