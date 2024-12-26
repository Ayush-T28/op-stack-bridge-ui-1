import { Stack, Typography, useColorScheme } from "@mui/material";
import getConfig from "../config.ts";

const Footer = () => {
  const config = getConfig;
  const { mode } = useColorScheme();

  return (
    <Stack
      direction="row"
      py={2}
      px={4}
      justifyContent="center"
      alignItems="center"
      sx={{
        borderTop: mode === "light" ? "1px solid #e0e0e0" : "1px solid #333",
        width: "100%",
      }}
    >
      <img
        src={config.brand.favicon || "/optimism.svg"}
        height="50px"
        alt={`${config.brand.name} Logo`}
      />
      <Typography
        color={mode === "light" ? "black" : "white"}
        letterSpacing={1}
        ml={2}
      >
        Powered by {`${config.brand.name || "Zeeve"}`}
      </Typography>
    </Stack>
  );
};

export default Footer;
