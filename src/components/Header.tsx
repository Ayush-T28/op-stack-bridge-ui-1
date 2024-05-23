import {PaletteMode, Skeleton, Stack, Typography, useColorScheme} from "@mui/material";
import {Chain, ConnectButton} from '@rainbow-me/rainbowkit';
import ToggleColorMode from "./ToggleColorMode";
import { Link, useLocation } from "react-router-dom";

type HeaderProps = {
    loaded: boolean,
    chains: Chain[],
}

export default function Header({loaded}: HeaderProps) {
    const { mode, setMode } = useColorScheme();
    const location = useLocation();
    
    const toggleColorMode = () => {
        if(mode === 'light'){
            setMode('dark');
        }
        else{
            setMode('light');
        }
    };
    

    return (
        <nav style={{backgroundColor: mode === 'light' ? "rgba(255,255,255,0.7)" : 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)'}}>
        <Stack direction='row' py={2} px={4} height={75} alignItems='center'>
            <img src={mode === 'light' ? "/logo.svg" : "/logo_dark.svg"} height='50px' alt="Zeeve Logo"></img>
            <Stack direction='row' marginLeft={6} gap={3}>
                <Typography color={location.pathname === '/' ? 'HighlightText' : 'InactiveCaptionText'} textTransform='uppercase' variant='button' letterSpacing={1} sx={{cursor: 'pointer', "&:hover": {color: 'HighlightText'}}}><Link to="/" style={{color: 'inherit', textDecoration: 'inherit'}}>Bridge</Link></Typography>
               <Typography color={location.pathname === '/activity' ?  'HighlightText' : 'InactiveCaptionText'} textTransform='uppercase' variant='button' letterSpacing={1} sx={{cursor: 'pointer', "&:hover": {color: 'HighlightText'}}}><Link to="/activity" style={{color: 'inherit', textDecoration: 'inherit'}}>Activity</Link></Typography>
            </Stack>
            <Stack marginLeft='auto' direction='row' alignItems='center'>
                <ToggleColorMode mode={mode as PaletteMode} toggleColorMode={toggleColorMode} />
                {loaded ? <ConnectButton showBalance={false} /> : <Skeleton height={80} width={140}></Skeleton>} 
            </Stack>
        </Stack>
        </nav>
    )
}