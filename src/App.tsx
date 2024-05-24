import {Divider, Stack, useColorScheme} from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import Bridge from './components/Bridge';
import {Chain, getDefaultConfig, RainbowKitProvider} from '@rainbow-me/rainbowkit';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {WagmiProvider} from 'wagmi';
import { createContext, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import Activity from './components/Activity';
import { getChain } from './api/chain';
import { mainnet, optimism } from 'viem/chains';
import { getToken } from './api/token';
import { addChain } from './utils/metamask';
import { rainbowTheme } from './theme';

export const TokenContext = createContext({
    name: "",
    symbol: "",
    contractAddress: "",
    iconUrl: "",
});


function App() {
    const [loaded, setLoaded] = useState<boolean>(false);
    const [chains, setChains] = useState<Chain[]>([mainnet, optimism]);
    const { mode } = useColorScheme();
    const [customToken, setCustomToken] = useState({
        name: "",
        symbol: "",
        contractAddress: "",
        iconUrl: ""
    });

  const config = getDefaultConfig({
    appName: "Optimism Bridge",
    projectId: "62707a90c9737f0d7d60d8ec06a8b45a",
    chains: chains as any,
    ssr: false, // If your dApp uses server side rendering (SSR)
  });

  const queryClient = new QueryClient();

  async function addL1Chain() {
    const l1 = chains[0];
    await addChain(l1, customToken);
  }

  async function addL2Chain() {
    const l2 = chains[1];
    await addChain(l2, customToken);
  }

  async function getChains() {
    const l1 = await getChain("l1");
    const l2 = await getChain("l2");
    setChains([l1, l2]);
  }

  async function getTokenDetails() {
    const token = await getToken();
    setCustomToken(token);
  }

  async function getDetails() {
    await getTokenDetails();
    await getChains();
    setLoaded(true);
  }

  useEffect(() => {
    getDetails();
  }, []);

  useEffect(() => {
    if (window.ethereum && loaded) {
      addL1Chain();
      addL2Chain();
    }
  }, [window.ethereum, loaded]);


  useEffect(()=>{
      getDetails();
  } , []);


  useEffect(()=>{
      if(window.ethereum && loaded){
          addL1Chain();
          addL2Chain();
      }
  }, [window.ethereum, loaded])

  return (
  <TokenContext.Provider value={customToken}>
    <BrowserRouter>
      {loaded && <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
              <RainbowKitProvider showRecentTransactions>
                  <Stack
                      sx={{
                      background: mode === 'light' ? "#ffffff" : "black",
                      backgroundSize: 'cover',
                      height: '100vh',
                      flexGrow: 1
                  }}>
                      <Header loaded={loaded} chains={chains}/>
                      <Divider/>
                      <Routes>
                        <Route element={<Bridge loaded={loaded} chains={chains}/>} index path='/' />
                        <Route element={<Activity chains={chains}/>}  path='/activity' />
                      </Routes>
                      <Footer />
                  </Stack>
              </RainbowKitProvider>
          </QueryClientProvider>
      </WagmiProvider>}
      </BrowserRouter>
  </TokenContext.Provider>
  );
}

export default App;
