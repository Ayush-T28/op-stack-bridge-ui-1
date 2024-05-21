import { ArrowDownward, ArrowRight, ArrowRightAlt, ArrowUpward, ContentCopy } from "@mui/icons-material"
import { useAccount } from 'wagmi'
import Web3 from 'web3'
import { Paper, Tabs, Tab, Box, useColorScheme, Stack, Divider, Typography, Button, Modal, LinearProgress } from "@mui/material"
import { useEffect, useState } from "react";
import { getDeposits } from "../api/deposit";
import { Activity as ActivityType, DepositQuery, WithdrawalQuery } from "../types";
import { getWithdrawals, updateWithdrawal } from "../api/withdrawal";
import { Chain } from "@rainbow-me/rainbowkit";
import { getAcitivity, getInitiateAcitivity } from "../api/activity";
import { formatTimestamp } from "../utils/date";
import { finalize, prove } from "../utils/withdrawal";
  
type ActivityProps = {
    chains: Chain[],
}
type DepositQueryAndStatus= DepositQuery & { status: string, subtype: string}
type WithdrawalQueryAndStatus= WithdrawalQuery & { status: string, subtype: string}

export default function Activity({chains}: ActivityProps){
    const { address, chain } = useAccount();
    const [value, setValue] = useState("deposits" as "deposits" | "withdrawals");
    const { mode } = useColorScheme();
    const [deposits, setDeposits] = useState([] as DepositQuery[]);
    const [withdrawals, setWithdrawals] = useState([] as WithdrawalQuery[]);

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [isRunning, setIsRunning] = useState(false);
    const [isTxComplete, setIsTxComplete] = useState(false);
    const [error, setError] = useState('');

    const [transactionId, setTransactionId] = useState("");
    const [type, setType] = useState<"deposit" | "withdrawl">("deposit");

    const [transactionDetails, setTransactionDetails] = useState<ActivityType>();

    async function getTransactions() {
        if (address) {
            if (value === 'deposits') {
                getDeposits(address?.toString() as string).then((data) => {
                    setDeposits(data);
                })
            } else {
                getWithdrawals(address?.toString() as string).then((data) => {
                    setWithdrawals(data);
                })
            }
        }
    }

    useEffect(() => {
       getTransactions();
    }, [address, value]);

    
    async function getActivityDetails() {
        const details = await getAcitivity(transactionId);
        setTransactionDetails(details);
    }

    useEffect(()=>{
        getActivityDetails();
    }, [transactionId])



    useEffect(()=>{
        // reset when modal is closed
        if(!open){
            setError('');
            setIsRunning(false);
            setIsTxComplete(false);
        }
    }, [open])

    async function handleButtonClick() {
        if(type === 'deposit'){
            // open in explorer
            window.open(`${chains[0].blockExplorers?.default.url}/tx/${transactionDetails?.transaction_hash}`, '_blank');
        }
        else{
            const initateTx = await getInitiateAcitivity(transactionDetails!.id);
            if(transactionDetails?.subtype === 'initiate'){
                setIsRunning(true);
                const [tx, err] = await prove(initateTx.transaction_hash as '0x${string}', chains[0], chains[1], chain!);
                if(!tx){
                    setIsRunning(false);
                    setError(err!);
                    setIsTxComplete(false);
                    return;
                }
                else {
                    setIsTxComplete(true);
                    setError(err);
                    setIsRunning(false);
                }
                
                await updateWithdrawal(transactionDetails.id, 'prove', tx);
                getTransactions();
                getActivityDetails();
            }
            else if(transactionDetails?.subtype === 'prove'){
                setIsRunning(true);
                const [tx, err] = await finalize(initateTx.transaction_hash as '0x${string}', chains[0], chains[1], chain!);
                if(!tx){
                    setIsRunning(false);
                    setError(err!);
                    setIsTxComplete(true);
                    return;
                }
                else {
                    setIsTxComplete(true);
                    setError(err);
                    setIsRunning(false);
                }
                await updateWithdrawal(transactionDetails.id, 'finalize', tx);
                getTransactions();
            }
            else{
                window.open(`${chains[0].blockExplorers?.default.url}/tx/${transactionDetails?.transaction_hash}`, '_blank');
            }
        }
    }

    return (
    <>
        <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
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
                Transaction Details
                </Typography>
                <Typography variant='caption'>{formatTimestamp(transactionDetails?.created_at)}</Typography>
                <Divider sx={{marginY: 1}}/>
                <Stack direction='row' alignItems='center' py={1} gap={1}>
                    <img src={chains[type === 'deposit' ? 0 : 1].iconUrl as string} height={35} />
                    <ArrowRightAlt />
                    <img src={chains[type === 'deposit' ? 1 : 0].iconUrl as string} height={35} />
                </Stack>
                <Typography>{type === 'deposit' ? 'Deposited' : 'Withdrew'} {transactionDetails?.amount ? Web3.utils.fromWei(transactionDetails?.amount , 'ether'): 0} ETH</Typography>
                <Stack direction='row' alignItems='center' gap={1}>
                    <Typography noWrap>Transaction Hash: {transactionDetails?.transaction_hash}</Typography>
                    <ContentCopy fontSize='small' sx={{marginLeft: 'auto', cursor: 'pointer'}} onClick={() => {navigator.clipboard.writeText(transactionDetails!.transaction_hash)}} titleAccess="Copy To Clipboard"/>
                </Stack>
                <Typography>Status: <span style={{textTransform: 'capitalize'}}>{transactionDetails?.subtype}</span></Typography>

                <Stack gap={1} marginTop={2}>
                    {isRunning && <LinearProgress variant='indeterminate' /> }
                    {error.length > 0 && <Typography variant='body2' textAlign='center' color='red'>{error}</Typography>}
                    {isTxComplete && <Typography variant='caption' textAlign='center' color='green'>Transaction Complete</Typography>}
                    <Button disabled={error.length !== 0} color="secondary" variant='contained' sx={{padding: 1, width: '100%', borderRadius: 2}} onClick={() => handleButtonClick()}>
                        {type === 'deposit' ? 'View in explorer' : 
                        transactionDetails?.subtype === 'initiate' ? 'Prove Withdrawal' : 
                        transactionDetails?.subtype === 'prove' ? 'Finalize Withdrawal' : 
                        'View in explorer'}
                    </Button>
                </Stack>
                </Box>
        </Modal>
        <Paper
            sx={{
            padding: 5,
            margin: 10,
            marginX: 'auto',
            height: '90vh',
            width: '97%',
            backgroundColor: mode === 'light' ? "rgba(255,255,255,0.7)" : 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)'
        }}
            variant="outlined">
            <Tabs
                value={value}
                onChange={(_event, newValue) => {
                    setValue(newValue)
                }}
                textColor="primary"
                indicatorColor="primary"
            >
                <Tab value="deposits" label="Deposits" iconPosition='start' icon={<ArrowDownward />}/>
                <Tab value="withdrawals" label="Withdrawls" iconPosition='start' icon={<ArrowUpward />}/>
            </Tabs>
            <Box width='100%' textAlign='center' marginX='auto' py={5} height='90%'>
                <Stack gap={2} overflow='scroll' maxHeight='100%' p={2} height='100%'>
                    {value === 'deposits' ? deposits.sort((a, b) => {
                    // Convert string timestamps to Date objects
                    const dateA = new Date(a.created_at);
                    const dateB = new Date(b.created_at);
                    
                    // Compare dates and return the comparison result
                    return dateB.getTime() - dateA.getTime();
                    }).map((deposit) => (                   
                    <Stack key={deposit.id} direction='row' sx={{ background: 'RGBA(99, 179, 101, 0.1)', backdropFilter: 'blur(3px)' }} borderRadius={2} minHeight={100} maxHeight={100} width='100%' overflow='hidden' border='2px solid' borderColor='RGB(99, 179, 101)'>
                        <div onClick={() => {
                            setTransactionId(deposit.id);
                            setType('deposit');
                            handleOpen();
                        }} style={{width: '100%'}}>
                        <Stack direction='row' height='100%' width='100%' alignItems='center' gap={1} p={2} sx={{cursor: 'pointer'}}>
                            <img src={chains[0].iconUrl as string} height={50}/>
                            <ArrowRight />
                            <img src={chains[1].iconUrl as string} height={50}/>
                            <Divider orientation='vertical' />
                            <Stack p={2}>
                                <Typography variant='h5' textAlign='left'>{Web3.utils.fromWei(parseFloat(deposit.amount), 'ether')} ETH</Typography>
                                <Typography variant="caption" textAlign='left'>{new Date(deposit.created_at).toString()}</Typography>
                            </Stack>
                            <Typography marginLeft='auto' variant='h6' color={deposit.status === 'failed' ? 'red' : 'green'}><span style={{textTransform: 'capitalize'}}>{deposit.subtype as string}</span></Typography>
                        </Stack>
                        </div>
                   </Stack>)) : withdrawals.sort((a, b) => {
                    // Convert string timestamps to Date objects
                    const dateA = new Date(a.created_at);
                    const dateB = new Date(b.created_at);
                    
                    // Compare dates and return the comparison result
                    return dateB.getTime() - dateA.getTime();
                    }).map((withdrawal) => (                   
                    <Stack key={withdrawal.id} direction='row' sx={{ background: 'RGBA(99, 179, 101, 0.1)', backdropFilter: 'blur(3px)' }} borderRadius={2} minHeight={100} maxHeight={100} width='100%' overflow='hidden' border='2px solid' borderColor='RGB(99, 179, 101)'>
                    <div onClick={() => {
                            setTransactionId(withdrawal.id);
                            setType('withdrawl');
                            handleOpen();
                        }} style={{width: '100%'}}>
                        <Stack direction='row' height='100%' width='100%' alignItems='center' gap={1} p={2} sx={{cursor: 'pointer'}}>
                                <img src={chains[1].iconUrl as string} height={50}/>
                                <ArrowRight />
                                <img src={chains[0].iconUrl as string} height={50}/>
                                <Divider orientation='vertical' />
                                <Stack p={2}>
                                    <Typography variant='h5' textAlign='left'>{Web3.utils.fromWei(withdrawal.amount, 'ether')} ETH</Typography>
                                    <Typography variant="caption" textAlign='left'>{new Date(withdrawal.created_at).toString()}</Typography>
                                </Stack>
                                <Typography marginLeft='auto' variant='h6' color={withdrawal.status === 'failed' ? 'red' : 'green'}><span style={{textTransform: 'capitalize'}}>{withdrawal.subtype as string}</span></Typography>
                            </Stack>
                        </div>
                   </Stack>))}
                </Stack>
            </Box>
        </Paper>
    </>
    )
}