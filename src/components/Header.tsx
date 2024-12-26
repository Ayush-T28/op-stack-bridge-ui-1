import {
  PaletteMode,
  Skeleton,
  Stack,
  Typography,
  useColorScheme,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Chain, ConnectButton } from "@rainbow-me/rainbowkit";
import ToggleColorMode from "./ToggleColorMode";
import { Link, useLocation } from "react-router-dom";
import getConfig from "../config.ts";

type HeaderProps = {
  loaded: boolean;
  chains: Chain[];
};

export default function Header({ loaded }: HeaderProps) {
  const config = getConfig;
  const { mode, setMode } = useColorScheme();
  const location = useLocation();

  const toggleColorMode = () => {
    if (mode === "light") {
      setMode("dark");
    } else {
      setMode("light");
    }
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <nav
      style={{
        backgroundColor:
          mode === "light" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Stack
        direction="row"
        py={2}
        px={isSmallScreen ? 2 : 4}
        height={75}
        alignItems="center"
        spacing={isSmallScreen ? 2 : 4}
        sx={{
          flexWrap: "nowrap",
        }}
      >
        {/* Logo */}
        <img
          src={
            mode === "light"
              ? config.brand.logo.light ?? "/logo.svg"
              : config.brand.logo.dark ?? "/logo_dark.svg"
          }
          height={"50px"}
          alt={`${config.brand.name} Logo`}
        />

        {/* Bridge and Activity Links (Stacked on small screens) */}
        <Stack
          direction={isSmallScreen ? "column" : "row"} // Stack vertically on small screens
          marginLeft={6}
          gap={isSmallScreen ? 1 : 3} // Adjust gap for small screens
          alignItems={isSmallScreen ? "flex-start" : "center"} // Align left for small screens
        >
          <Typography
            color={
              location.pathname === "/" ? "secondary" : "InactiveCaptionText"
            }
            textTransform="uppercase"
            variant={isSmallScreen ? "body2" : "button"}
            letterSpacing={1}
            sx={{ cursor: "pointer", "&:hover": { color: "secondary" } }}
          >
            <Link
              to="/"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              Bridge
            </Link>
          </Typography>
          <Typography
            color={
              location.pathname === "/activity"
                ? "secondary"
                : "InactiveCaptionText"
            }
            textTransform="uppercase"
            variant={isSmallScreen ? "body2" : "button"}
            letterSpacing={1}
            sx={{ cursor: "pointer", "&:hover": { color: "secondary" } }}
          >
            <Link
              to="/activity"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              Activity
            </Link>
          </Typography>
        </Stack>

        {/* Spacer */}
        <Stack direction="row" flexGrow={1} />

        {/* Theme Toggle and Connect Wallet Button */}
        <Stack direction="row" alignItems="center" gap={1}>
          <ToggleColorMode
            mode={mode as PaletteMode}
            toggleColorMode={toggleColorMode}
          />
          {loaded ? (
            <ConnectButton
              showBalance={false}
              accountStatus="address"
              chainStatus="none"
              label={isSmallScreen ? "Connect" : "Connect Wallet"}
            />
          ) : (
            <Skeleton
              height={isSmallScreen ? 60 : 80}
              width={isSmallScreen ? 120 : 140}
            />
          )}
        </Stack>
      </Stack>
    </nav>
  );
}
