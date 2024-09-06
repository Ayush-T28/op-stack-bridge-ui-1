import { Stack, Typography, useColorScheme } from "@mui/material";

const Footer = () => {
  const { mode } = useColorScheme();

  return (
    <Stack
      direction="row"
      py={2}
      px={4}
      height={75}
      alignItems="center"
      margin="auto"
    >
      <img src="/optimism.png" height="50px" alt="Zeeve Logo"></img>
      <Stack direction="row" marginLeft={2} gap={3}>
        <Typography
          color={mode === "light" ? "black" : "white"}
          letterSpacing={1}
        >
          Powered by Optimism
        </Typography>
      </Stack>
    </Stack>
  );
};

export default Footer;
