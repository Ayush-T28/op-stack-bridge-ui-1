import ArrowDownward from "@mui/icons-material/ArrowDownward";
import { Box, Button, Divider, Grid, IconButton, Input, LinearProgress, Modal, Paper, Stack, TextField, Typography } from "@mui/material";
import { Chain } from "@rainbow-me/rainbowkit";
import Balance from "./Balance";
import { useERC20Allowance } from "../hooks/useERC20Allowance";
import { useAccount, usePublicClient } from "wagmi";
import { Address, ChainContract } from "viem";
import { useContext, useEffect, useState } from "react";
import { switchChain } from "viem/actions";
import { optimismPortalProxyABI } from "../constants/contracts";
import Web3 from 'web3'
import { ContentCopy } from "@mui/icons-material";
import { createDeposit } from '../api/deposit';
import { TokenContext } from "../App";
import { getBalance } from "../utils/web3";
import BN from 'bn.js';

type DepositProps = {
    chains: Chain[],
}


export default function Deposit({chains} : DepositProps){
    const {address, chain} = useAccount();
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState<bigint>(BigInt(0));
    const web3 = new Web3(window.ethereum)

    const [runningTx, setRunningTx] = useState(false);
    const [isTxComplete, setIsTxComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState('');

    const [gasLimit, setGasLimit] = useState(0);
    const [gas, setGas] = useState(0);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const token = useContext(TokenContext);

    const { allowance, approve } = useERC20Allowance({
        token: token.contractAddress as `0x${string}`,
        chainId: chains[0].id,
        amount: BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
        owner: address as Address,
        spender: (chains[0].contracts!.optimismPortalProxy! as ChainContract).address,
    });


    async function fetchBalance() {
            const balance = Number(await getBalance("l1", address!, token, chains[0].rpcUrls.default.http[0]))
            setBalance(balance);
    }

    useEffect(()=>{
        if(address){
            fetchBalance();
        }
    }, [address, amount, chains, token])

    const l1PublicClient = usePublicClient({ chainId: chains[0].id })

    async function approveSpending() {
        if(!allowance.data){
            return;
        }
        const shouldApprove = BigInt(allowance.data) < amount;
        if (shouldApprove) {
            const approvalTxHash = await approve()
            await l1PublicClient!.waitForTransactionReceipt({ hash: approvalTxHash })
        }
        await allowance.refetch();
    }

    async function estimateGas() {
        const contract = new web3.eth.Contract(optimismPortalProxyABI, (chains[0].contracts!.optimismPortalProxy as ChainContract).address)
    
        const functionArgs = {
            from: address,
        }
    
        let gasLimit = await contract.methods.depositERC20Transaction(address?.toString(), amount, amount, 21000, false, '0x',)
            .estimateGas(functionArgs)
            .catch((error) => {
                console.log("failed to estimate gas: ", error)
                // setError("Cannot estimate gas. Transaction will likely fail.");
        })
           
        if (!gasLimit) {
            setGas(30000);
            gasLimit = BigInt(30000);
        }

        const gasPrice = await web3.eth.getGasPrice();
        const gasCostWei = gasLimit * gasPrice;
 
        setGasLimit(parseFloat(gasLimit.toString()));
        setGas(parseFloat(gasCostWei.toString()));
    }

    async function callDeposit() {
            setRunningTx(true);
            setIsTxComplete(false);
            setError(null);

            const contract = new web3.eth.Contract(optimismPortalProxyABI, (chains[0].contracts!.optimismPortalProxy as ChainContract).address)

            const functionArgs = {
                from: address,
                gas: gasLimit.toString(), // Set your desired gas limit here
            }
            // Send the transaction and subscribe to the transactionHash event
            const txPromiEvent = contract.methods
            .depositERC20Transaction(address?.toString(), amount, amount, 21000, false, '0x')
            .send(functionArgs);

            // Subscribe to the transactionHash event
            txPromiEvent.on('transactionHash', (hash: string) => {
                setTxHash(hash);
                setRunningTx(true);
                createDeposit(address?.toString() as string, 'deposit', 'initiate', amount.toString(), hash);
            });

            // Subscribe to the confirmation event
            txPromiEvent.on('confirmation', (confirmations) => {
                if (confirmations.confirmations > 0) {
                    setRunningTx(false);
                    setIsTxComplete(true);
                }
            });

            // Handle errors
            txPromiEvent.on('error', (error) => {
                console.error('Transaction error:', error);
                setRunningTx(false);
                setError(error.message);
            });
    }


    async function showReviewModal() {
        if(chain !== chains[0]){
            await switchChain(window.ethereum!, {id: chains[0].id});
        }
        setError(null);
        estimateGas();
        handleOpen();
    }

    async function executeDeposit() {
        await approveSpending();
        await callDeposit();
    }

    useEffect(()=>{
        approveSpending();
    }, []);


    useEffect(()=>{
        // reset tx hash when modal is closed
        if(!open){
            setTxHash('');
        }
    }, [open])
      
    return (
        <>
        <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        
        >
        <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
            Review Deposit
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Please make sure the following details are correct before proceeding
            </Typography>
            <Divider sx={{marginTop: 3}}/>
            <Stack gap={1} paddingY={3}>
            <Typography variant='body2'>
                You are sending: {Web3.utils.fromWei(amount.toString(), 'ether')} {token.symbol}
            </Typography>
            <Typography variant='body2'>
                Estimated Gas: {Web3.utils.fromWei(gas, 'ether')} ETH
            </Typography>
            {txHash && <Stack direction='row' alignItems='center' gap={1}>
                <Typography variant="body2" noWrap>Transaction Hash: {txHash}</Typography>
                <ContentCopy fontSize='small' sx={{marginLeft: 'auto', cursor: 'pointer'}} onClick={() => {navigator.clipboard.writeText(txHash)}} titleAccess="Copy To Clipboard"/>
            </Stack>}
            </Stack>
            <Typography variant='caption'>Time to transfer: ~1 minute</Typography>
            {txHash && !error ? (
                <Stack gap={1} marginTop={2}>
                {runningTx && <LinearProgress variant='indeterminate' /> }
                {isTxComplete && <Typography variant='caption' textAlign='center' color='green'>Transaction Complete</Typography>}
                <Button
                    className="cursor-pointer underline"
                    href={`${chains[0].blockExplorers?.default.url}/tx/${txHash}`}
                    target='_blank'
                    variant='contained' sx={{padding: 1, width: '100%', borderRadius: 2}}
                >
                    View Transaction
                </Button>
                </Stack>
            ) : <Button disabled={gas === 0} color="secondary" variant='contained' sx={{padding: 1, width: '100%', marginTop: 2, borderRadius: 2}} onClick={executeDeposit}>{ runningTx ? 'Sending Deposit' : gas === 0 ? 'Estimating Gas' : 'Confirm Deposit' }</Button>}
            {error && <Typography color='red' variant="body2" noWrap>There was an error : {error}</Typography>}
            </Box>
        </Modal>
        <Stack gap={2} alignItems='center'> 
            <Grid container width='100%' alignItems='center' gap={2}> 
                <Typography variant='h5' color='InactiveCaptionText'>From </Typography>
                <img src={chains[0].iconUrl?.toString()} height={35} alt='Ethereum logo'/> 
                <Typography variant="h5">{chains[0].name}</Typography>

                <Balance rpc={chains[0].rpcUrls.default.http[0]} level="l1" />
            </Grid>

            <Paper
            component="form"
            sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
            >
                <TextField
                    sx={{ ml: 0, flex: 1, border: 'none' }}
                    placeholder="Amount"
                    onChange={(e: any)=>{setAmount(BigInt(Web3.utils.toWei(e.target.value || "0", 'ether')))}}
                    inputProps={{ 'aria-label': 'search google maps' }}
                    defaultValue={0.00}
                    autoFocus
                    error={balance < amount}
                    variant='outlined'
                />
                <IconButton color="primary" sx={{ padding: '10px' }} aria-label="directions">
                    <img src={token.iconUrl} height={35} />
                    <Typography marginLeft={1}>{token.symbol}</Typography>
                </IconButton>
            </Paper>

            <ArrowDownward fontSize='large' color='secondary' />

            <Grid container width='100%' alignItems='center' gap={2}> 
                <Typography variant='h5' color='InactiveCaptionText'>To </Typography>
                <img src={chains[1].iconUrl?.toString()} height={35} alt='Ethereum logo'/> 
                <Typography variant="h5">{chains[1].name}</Typography>

                <Balance rpc={chains[1].rpcUrls.default.http[0]} level="l2" />
            </Grid>

            <Button  disabled={balance < amount} color="secondary" variant='contained' sx={{padding: 2, width: '75%', marginTop: 8, borderRadius: 2}} onClick={showReviewModal}>Review Deposit</Button>
        </Stack>
        </>
    )
}