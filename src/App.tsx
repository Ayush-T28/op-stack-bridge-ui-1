import {Divider, Stack} from '@mui/material';
import Header from './components/Header';
import Bridge from './components/Bridge';
import {Chain, getDefaultConfig, RainbowKitProvider} from '@rainbow-me/rainbowkit';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {WagmiProvider} from 'wagmi';
import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import Activity from './components/Activity';
import { getChain } from './api/chain';
import { mainnet, optimism } from 'viem/chains';

function App() {

    const [loaded, setLoaded] = useState<boolean>(false);
    const [chains, setChains] = useState<Chain[]>([mainnet, optimism]);

    const [customToken, setCustomToken] = useState({
        name: "BridgeUI",
        symbol: "BUI",
        decimals: 18,
        address: "0x90fa379e947fDe331f3465d19845A8eB5031AC0B",
    })

    const config = getDefaultConfig({
        appName: 'Optimism Bridge',
        projectId: '62707a90c9737f0d7d60d8ec06a8b45a',
        chains: chains,
        ssr: false, // If your dApp uses server side rendering (SSR)
    });

    const queryClient = new QueryClient();


    async function getChains(){
        const l1 = await getChain('l1');
        const l2 = await getChain('l2');
        setChains([l1, l2]);
        setLoaded(true);
    }

    useEffect(()=>{
        getChains();
    } , []);

    return (
      <BrowserRouter>
        {loaded && <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    <Stack
                        sx={{
                        background: 'url(/bg.svg)',
                        backgroundSize: 'cover',
                        height: '100vh',
                        flexGrow: 1
                    }}>
                        <Header loaded={loaded} chains={chains}/>
                        <Divider/>
                        <Routes>
                          <Route element={<Bridge loaded={loaded} chains={chains}/>} index path='/' />
                          <Route element={<Activity />}  path='/activity' />
                        </Routes>
                    </Stack>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>}
        </BrowserRouter>
    );
}

export default App;
