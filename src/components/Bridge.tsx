import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";

import {Box, Paper, Tab, Tabs, useColorScheme} from "@mui/material";
import {useState} from "react";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import { Chain } from "@rainbow-me/rainbowkit";

type BridgeProps = {
    chains: Chain[],
    loaded: boolean,
}

export default function Bridge({chains}: BridgeProps) {

    const [value, setValue] = useState("deposit");
    const { mode } = useColorScheme();

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
                centered
            >
                <Tab value="deposit" label="Deposit" iconPosition='start' icon={<ArrowDownward />}/>
                <Tab value="withdraw" label="Withdraw" iconPosition='start' icon={<ArrowUpward />}/>
            </Tabs>
            <Box width='50%' textAlign='center' marginX='auto' p={10}>
            {value === 'deposit' ? <Deposit chains={chains}/> : <Withdraw chains={chains}/>}
            </Box>
        </Paper>
    )
}