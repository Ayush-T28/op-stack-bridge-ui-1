import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";

import { Box, Paper, Tab, Tabs, useTheme,  useColorScheme } from "@mui/material";
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
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        marginTop: 2,
        px: 2,
        width: "100%",
      }}
    >
      <Paper
        sx={{
          padding: { xs: 2, sm: 3, md: 3 },
          width: "100%",
          backgroundColor: mode === "light" ? "#f3f3f3" : "#171717",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          boxShadow: mode === "light" ? theme.shadows[2] : theme.shadows[5],
        }}
        variant="outlined"
      >
        {/* Tabs Section */}
        <Tabs
          value={value}
          onChange={(_event, newValue) => setValue(newValue)}
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

        {/* Content Section */}
        <Box
          sx={{
            marginTop: 4,
            px: { xs: 2, md: 4 },
            py: { xs: 2, md: 4 },
            display: "flex",
            justifyContent: "center",
          }}
        >
          {value === "deposit" ? (
            <Deposit chains={chains} />
          ) : (
            <Withdraw chains={chains} />
          )}
        </Box>
      </Paper>
    </Box>
  );
}
