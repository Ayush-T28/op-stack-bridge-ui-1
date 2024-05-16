import { Typography, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { erc20Abi } from "viem";
import { useAccount } from "wagmi";
import Web3 from "web3";

type BalanceProps = {
    rpc: string,
    level: "l1" | "l2",
}

export default function Balance({rpc, level}: BalanceProps){
    const { address } = useAccount()

    const [balance, setBalance] = useState({
        isPending: true,
        data: {
          formatted: 0
        }
      });

      const getBalance = async () => {
        if (level === 'l2') {
          const walletAddress = address as `0x${string}`;
          const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
          const balance = await web3.eth.getBalance(walletAddress); //Will give value in.balance = web3.toDecimal(balance);
          setBalance({
            isPending: false,
            data: {
              formatted: parseFloat(balance.toString())
            }
          });
        } else {
          const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
          const contract = new web3.eth.Contract(erc20Abi, '0x90fa379e947fDe331f3465d19845A8eB5031AC0B')
          const balance: bigint = await contract.methods.balanceOf(address).call();
            setBalance({
              isPending: false,
              data: {
                formatted: parseFloat(balance.toString())
              }
            });
          }
      }

      useEffect(()=>{
        if(rpc !== '' && address !== undefined){
          getBalance();
        }
        else{
            setBalance({
                isPending: true,
                data: {
                  formatted: 0
                }
            });
        }

        const cronJob = setInterval(() => getBalance(), 10000);
        return () => clearInterval(cronJob);
      }, [address, rpc, level])

    return (
        <>
            <Typography marginLeft='auto'>Balance: </Typography>
            {balance.isPending ? <Skeleton width={50} height={40}></Skeleton> : <Typography>{Web3.utils.fromWei(balance.data.formatted, 'ether')}</Typography>}
        </>
    )
}