import { ArrowDownward, ArrowRight, ArrowUpward } from "@mui/icons-material"
import { useAccount } from 'wagmi'
import Web3 from 'web3'
import { Paper, Tabs, Tab, Box, useColorScheme, Stack, Divider, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import { getDeposits } from "../api/deposit";
import { DepositQuery, WithdrawalQuery } from "../types";
import { getWithdrawals } from "../api/withdrawal";
  

export default function Activity(){
    const { address } = useAccount();
    const [value, setValue] = useState("deposits" as "deposits" | "withdrawals");
    const { mode } = useColorScheme();
    const [deposits, setDeposits] = useState([] as DepositQuery[]);
    const [withdrawals, setWithdrawals] = useState([] as WithdrawalQuery[]);
    useEffect(() => {
        console.log(value);
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
    }, [address, value]);
    return (
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
                    {value === 'deposits' ? deposits.map((deposit) => (                   
                    <Stack key={deposit.id} direction='row' sx={{ background: 'RGBA(99, 179, 101, 0.1)', backdropFilter: 'blur(3px)' }} borderRadius={2} minHeight={100} maxHeight={100} width='100%' overflow='hidden' border='2px solid' borderColor='RGB(99, 179, 101)'>
                        <Stack direction='row' height='100%' width='100%' alignItems='center' gap={1} p={2}>
                            <img src="/ethereum.png" height={50}/>
                            <ArrowRight />
                            <img src="/optimism.png" height={50}/>
                            <Divider orientation='vertical' />
                            <Stack p={2}>
                                <Typography variant='h5'>{Web3.utils.fromWei(deposit.amount, 'ether')} ETH</Typography>
                                <Typography variant="caption">{new Date(deposit.created_at).toString()}</Typography>
                            </Stack>
                            <Typography marginLeft='auto' variant='h6' color='green'>Completed</Typography>
                        </Stack>
                   </Stack>)) : withdrawals.map((withdrawal) => (                   
                    <Stack key={withdrawal.id} direction='row' sx={{ background: 'RGBA(99, 179, 101, 0.1)', backdropFilter: 'blur(3px)' }} borderRadius={2} minHeight={100} maxHeight={100} width='100%' overflow='hidden' border='2px solid' borderColor='RGB(99, 179, 101)'>
                        <Stack direction='row' height='100%' width='100%' alignItems='center' gap={1} p={2}>
                            <img src="/ethereum.png" height={50}/>
                            <ArrowRight />
                            <img src="/optimism.png" height={50}/>
                            <Divider orientation='vertical' />
                            <Stack p={2}>
                                <Typography variant='h5'>{Web3.utils.fromWei(withdrawal.amount, 'ether')} ETH</Typography>
                                <Typography variant="caption">{new Date(withdrawal.created_at).toString()}</Typography>
                            </Stack>
                            <Typography marginLeft='auto' variant='h6' color='green'>Completed</Typography>
                        </Stack>
                   </Stack>))}
                </Stack>
            </Box>
        </Paper>
    )
}