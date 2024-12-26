import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";

import { Box, Paper, Tab, Tabs, useColorScheme } from "@mui/material";
import { useState } from "react";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import { Chain } from "@rainbow-me/rainbowkit";

type BridgeProps = {
  chains: Chain[];
  loaded: boolean;
};

export default function Bridge({ chains }: BridgeProps) {
  const [value, setValue] = useState("deposit");
  const { mode } = useColorScheme();

  return (
    <Paper
      sx={{
        padding: 5,
        marginTop: 5,
        marginX: "auto",
        height: "70vh",
        maxHeight: "70vh",
        width: "97%",
        backgroundColor: mode === "light" ? "#f3f3f3" : "#171717",
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
      }}
      variant="outlined"
    >
      <Tabs
        value={value}
        onChange={(_event, newValue) => {
          setValue(newValue);
        }}
        textColor="primary"
        indicatorColor="primary"
        centered
      >
        <Tab
          value="deposit"
          label="Deposit"
          iconPosition="start"
          icon={<ArrowDownward />}
        />
        <Tab
          value="withdraw"
          label="Withdraw"
          iconPosition="start"
          icon={<ArrowUpward />}
        />
      </Tabs>
      <Box width="50%" textAlign="center" marginX="auto" p={10}>
        {value === "deposit" ? (
          <Deposit chains={chains} />
        ) : (
          <Withdraw chains={chains} />
        )}
      </Box>
    </Paper>
  );
}
