import ArrowDownward from "@mui/icons-material/ArrowDownward";
import { Button, Checkbox, Divider, FormControlLabel, IconButton, InputBase, Paper, Stack, Typography } from "@mui/material";
import { Chain } from "@rainbow-me/rainbowkit";
import Balance from "./Balance";

type WithdrawProps = {
    chains: Chain[],
}

export default function Withdraw({chains}: WithdrawProps){
    return (
        <Stack gap={2} alignItems='center'> 
            <Stack direction='row' alignItems='center' gap={2} width='100%'>
                <Typography variant='h5' color='InactiveCaptionText'>From </Typography>
                <img src={chains[1].iconUrl?.toString()} height={35} alt='Ethereum logo'/> 
                <Typography variant="h5">{chains[1].name}</Typography>

                <Balance rpc={chains[1].rpcUrls.default.http[0]} level="l2" />
            </Stack>

            <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}
            >
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Amount"
                    inputProps={{ 'aria-label': 'search google maps' }}
                    defaultValue={0.00}
                    autoFocus
                />
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
                    <img src="/ethereum.png" height={35} />
                    <Typography marginLeft={1}>ETH</Typography>
                </IconButton>
            </Paper>

            <ArrowDownward fontSize='large' color='secondary' />

            <Stack direction='row' alignItems='center' gap={2} width='100%'>
                <Typography variant='h5' color='InactiveCaptionText'>To </Typography>
                <img src={chains[0].iconUrl?.toString()} height={35} alt='Ethereum logo'/> 
                <Typography variant="h5">{chains[0].name}</Typography>

                <Balance rpc={chains[0].rpcUrls.default.http[0]} level="l1" />
            </Stack>

            <FormControlLabel sx={{marginTop: 8}} required control={<Checkbox color="secondary"/>} label="I understand that withdrawls takes upto 7 days to finalize."/>
            <Button color="secondary" variant='contained' sx={{padding: 2, width: '75%', marginTop: 1, borderRadius: 2}}>Review Withdrawl</Button>
        </Stack>
    )
}