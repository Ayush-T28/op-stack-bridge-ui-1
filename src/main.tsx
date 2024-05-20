import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'normalize.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {CssBaseline, Experimental_CssVarsProvider} from '@mui/material';

import '@rainbow-me/rainbowkit/styles.css';

const root = ReactDOM.createRoot(document.getElementById('root')as HTMLElement);
root.render(
    <React.StrictMode>
        <Experimental_CssVarsProvider>
            <CssBaseline/>
            <App/>
        </Experimental_CssVarsProvider>
    </React.StrictMode>
);
