import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "normalize.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  CssBaseline,
  Experimental_CssVarsProvider,
  experimental_extendTheme as extendTheme,
} from "@mui/material";

import "@rainbow-me/rainbowkit/styles.css";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#afac88",
        },
        secondary: {
          main: "#afac88",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#afac88",
        },
        secondary: {
          main: "#afac88",
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Experimental_CssVarsProvider theme={theme}>
      <CssBaseline />
      <App />
    </Experimental_CssVarsProvider>
  </React.StrictMode>
);
