import { ArrowDownward, ArrowRight, ArrowUpward } from "@mui/icons-material"
import { Paper, Tabs, Tab, Box, useColorScheme, Stack, Divider, Typography } from "@mui/material"
import { useState } from "react";
  

export default function Activity(){
    const [value, setValue] = useState("all");
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
            >
                <Tab value="all" label="Deposits" iconPosition='start' icon={<ArrowDownward />}/>
                <Tab value="pending" label="Withdrawls" iconPosition='start' icon={<ArrowUpward />}/>
            </Tabs>
            <Box width='100%' textAlign='center' marginX='auto' py={5} height='90%'>
                <Stack gap={2} overflow='scroll' maxHeight='100%' p={2} height='100%'>
                   <Stack direction='row' sx={{ background: 'RGBA(99, 179, 101, 0.1)', backdropFilter: 'blur(3px)' }} borderRadius={2} minHeight={100} maxHeight={100} width='100%' overflow='hidden' border='2px solid' borderColor='RGB(99, 179, 101)'>
                        <Stack direction='row' height='100%' width='100%' alignItems='center' gap={1} p={2}>
                            <img src="/ethereum.png" height={50}/>
                            <ArrowRight />
                            <img src="/optimism.png" height={50}/>
                            <Divider orientation='vertical' />
                            <Stack p={2}>
                                <Typography variant='h5'>20 ETH</Typography>
                                <Typography variant="caption">May 11 05:47 PM</Typography>
                            </Stack>
                            <Typography marginLeft='auto' variant='h6' color='green'>Completed</Typography>
                        </Stack>
                   </Stack>
                   <Stack direction='row' sx={{ background: 'RGBA(255,120,0, 0.1)', backdropFilter: 'blur(3px)' }} borderRadius={2} minHeight={100} maxHeight={100} width='100%' overflow='hidden' border='2px solid' borderColor='RGB(255,120,0)'>
                   <Stack direction='row' height='100%' width='100%' alignItems='center' gap={1} p={2}>
                            <img src="/ethereum.png" height={50}/>
                            <ArrowRight />
                            <img src="/optimism.png" height={50}/>
                            <Divider orientation='vertical' />
                            <Stack p={2}>
                                <Typography variant='h5'>20 ETH</Typography>
                                <Typography variant="caption">May 11 05:47 PM</Typography>
                            </Stack>
                            <Typography marginLeft='auto' variant='h6' color='yellow'>Pending</Typography>
                        </Stack>
                    </Stack>
                   <Stack direction='row' sx={{ background: 'RGBA(255,50,50, 0.1)', backdropFilter: 'blur(3px)' }} borderRadius={2} minHeight={100} maxHeight={100} width='100%' overflow='hidden' border='2px solid' borderColor='RGB(255,50,50)'>
                   <Stack direction='row' height='100%' width='100%' alignItems='center' gap={1} p={2}>
                            <img src="/ethereum.png" height={50}/>
                            <ArrowRight />
                            <img src="/optimism.png" height={50}/>
                            <Divider orientation='vertical' />
                            <Stack p={2}>
                                <Typography variant='h5'>20 ETH</Typography>
                                <Typography variant="caption">May 11 05:47 PM</Typography>
                            </Stack>
                            <Typography marginLeft='auto' variant='h6' color='red'>Failed</Typography>
                        </Stack>
                   </Stack>
                </Stack>
            </Box>
        </Paper>
    )
}