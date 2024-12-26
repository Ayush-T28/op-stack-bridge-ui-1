import ArrowDownward from "@mui/icons-material/ArrowDownward";
import {
  Box,
  Button,
  Divider,
  IconButton,
  LinearProgress,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Chain } from "@rainbow-me/rainbowkit";
import Balance from "./Balance";
import { ContentCopy } from "@mui/icons-material";
import Web3 from "web3";
import { useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ChainContract } from "viem";
import { l2ToL1MessagePasserProxyABI } from "../constants/contracts";
import { TokenContext } from "../App";
import { createWithdrawal } from "../api/withdrawal";
import { addChain } from "../utils/metamask";
import { switchChain } from "viem/actions";
import { formatTime } from "../utils/date";
import { getBalance } from "../utils/web3";

type WithdrawProps = {
  chains: Chain[];
};

export default function Withdraw({ chains }: WithdrawProps) {
  const token = useContext(TokenContext);
  const web3 = new Web3(window.ethereum);
  const { address, chain } = useAccount();
  const [balance, setBalance] = useState(0);

  const [amount, setAmount] = useState<bigint>(BigInt(0));
  const [gasLimit, setGasLimit] = useState(0);
  const [gas, setGas] = useState(0);
  const [txHash, setTxHash] = useState("");
  const [runningTx, setRunningTx] = useState(false);
  const [isTxComplete, setIsTxComplete] = useState(false);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchBalance() {
    const balance = Number(
      await getBalance("l2", address!, token, chains[1].rpcUrls.default.http[0])
    );
    setBalance(balance);
  }

  useEffect(() => {
    if (address) {
      fetchBalance();
    }
  }, [address, amount, chains, token]);

  async function estimateGas() {
    const contract = new web3.eth.Contract(
      l2ToL1MessagePasserProxyABI,
      (chains[1].contracts!.l2ToL1MessagePasserProxy as ChainContract).address
    );

    const functionArgs = {
      from: address,
      value: amount.toString(),
    };

    let gasLimit = await contract.methods
      .initiateWithdrawal(address?.toString(), 21000, "0x")
      .estimateGas(functionArgs)
      .catch((error) => {
        console.log("error estimating gas", error);
        // setError("Cannot estimate gas. Transaction will likely fail.");
      });

    if (!gasLimit) {
      setGas(30000);
      gasLimit = BigInt(30000);
    }

    const gasPrice = await web3.eth.getGasPrice();
    const gasCostWei = gasLimit * gasPrice;

    setGasLimit(parseFloat(gasLimit.toString()));
    setGas(parseFloat(gasCostWei.toString()));
  }

  async function initateWithdrawl() {
    setRunningTx(true);
    setIsTxComplete(false);
    setError(null);

    const contract = new web3.eth.Contract(
      l2ToL1MessagePasserProxyABI,
      (chains[1].contracts!.l2ToL1MessagePasserProxy as ChainContract).address
    );

    const functionArgs = {
      from: address,
      gas: gasLimit.toString(), // Set your desired gas limit here
      value: amount.toString(),
    };
    // Send the transaction and subscribe to the transactionHash event
    const txPromiEvent = contract.methods
      .initiateWithdrawal(address?.toString(), 21000, "0x")
      .send(functionArgs);

    // Subscribe to the transactionHash event
    txPromiEvent.on("transactionHash", (hash: string) => {
      setTxHash(hash);
      createWithdrawal(
        address?.toString() as string,
        "withdrawal",
        "initiate",
        amount.toString(),
        hash
      );
    });

    // Subscribe to the accepted event
    txPromiEvent.on("sending", () => {
      setRunningTx(true);
    });

    // Subscribe to the confirmation event
    txPromiEvent.on("confirmation", (confirmations) => {
      if (confirmations.confirmations > 0) {
        setRunningTx(false);
        setIsTxComplete(true);
      }
    });

    // Handle errors
    txPromiEvent.on("error", (error) => {
      console.error("Transaction error:", error);
      setRunningTx(false);
      setError(error.message);
    });
  }

  async function executeWithdrawl() {
    await initateWithdrawl();
  }

  async function showReviewModal() {
    if (chain !== chains[1] && window.ethereum) {
      await addChain(chains[1]);
      await switchChain(window.ethereum!, { id: chains[1].id });
    }
    setError(null);
    estimateGas();
    handleOpen();
  }

  useEffect(() => {
    // reset tx hash when modal is closed
    if (!open) {
      setTxHash("");
    }
  }, [open]);

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            maxWidth: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
          >
            Review Withdrawal
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{
              mt: 2,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Please make sure the following details are correct before proceeding
          </Typography>
          <Divider sx={{ marginTop: 3 }} />
          <Stack gap={1} paddingY={3}>
            <Typography
              variant="body2"
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              You are withdrawing:{" "}
              {Web3.utils.fromWei(amount.toString(), "ether")} {token?.symbol}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Estimated Gas: {Web3.utils.fromWei(gas, "ether")} {token?.symbol}
            </Typography>
            {txHash && (
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Transaction Hash: {txHash}
                </Typography>
                <ContentCopy
                  fontSize="small"
                  sx={{ marginLeft: "auto", cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(txHash);
                  }}
                  titleAccess="Copy To Clipboard"
                />
              </Stack>
            )}
          </Stack>
          <Typography
            variant="caption"
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            Time to transfer: ~
            {formatTime(chains[1].custom!.finalizationPeriod as number)}
          </Typography>
          {txHash && !error ? (
            <Stack gap={1} marginTop={2}>
              {runningTx && <LinearProgress variant="indeterminate" />}
              {isTxComplete && (
                <Typography
                  variant="caption"
                  textAlign="center"
                  color="green"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  Transaction Complete
                </Typography>
              )}
              <Button
                className="cursor-pointer underline"
                href={`${chains[1].blockExplorers?.default.url}/tx/${txHash}`}
                target="_blank"
                variant="contained"
                sx={{
                  padding: 1,
                  width: "100%",
                  borderRadius: 2,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                View Transaction
              </Button>
            </Stack>
          ) : (
            <Button
              disabled={gas === 0}
              color="secondary"
              variant="contained"
              sx={{
                padding: 1,
                width: "100%",
                marginTop: 2,
                borderRadius: 2,
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
              onClick={executeWithdrawl}
            >
              {runningTx
                ? "Initiating Withdrawal"
                : gas === 0
                ? "Estimating Gas"
                : "Initiate Withdrawal"}
            </Button>
          )}
          {error && (
            <Typography
              color="red"
              variant="caption"
              noWrap
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              There was an error: {error}
            </Typography>
          )}
        </Box>
      </Modal>

      <Stack gap={2} alignItems="center">
        <Stack direction="row" alignItems="center" gap={2} width="100%">
          <Typography
            variant="h5"
            color="InactiveCaptionText"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            From{" "}
          </Typography>
          <img
            src={chains[1].iconUrl?.toString()}
            height={35}
            alt="Ethereum logo"
          />
          <Typography
            variant="h5"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {chains[1].name}
          </Typography>

          <Balance
            rpc={chains[1].rpcUrls.default.http[0]}
            level="l2"
          />
        </Stack>

        <Paper
          component="form"
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: { xs: 1, sm: 2 },
          }}
        >
          <TextField
            sx={{
              ml: 0,
              flex: 1,
              border: "none",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
            placeholder="Amount"
            onChange={(e: any) => {
              setAmount(
                BigInt(Web3.utils.toWei(e.target.value || "0", "ether"))
              );
            }}
            inputProps={{ "aria-label": "search google maps" }}
            defaultValue={0.0}
            autoFocus
            error={balance < amount}
            variant="outlined"
          />
          <IconButton
            color="primary"
            sx={{ padding: "10px" }}
            aria-label="directions"
          >
            <img src={token.iconUrl} height={35} />
            <Typography marginLeft={1}>{token.symbol}</Typography>
          </IconButton>
        </Paper>

        <ArrowDownward fontSize="large" color="secondary" />

        <Stack direction="row" alignItems="center" gap={2} width="100%">
          <Typography
            variant="h5"
            color="InactiveCaptionText"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            To{" "}
          </Typography>
          <img
            src={chains[0].iconUrl?.toString()}
            height={35}
            alt="Ethereum logo"
          />
          <Typography
            variant="h5"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {chains[0].name}
          </Typography>

          <Balance
            rpc={chains[0].rpcUrls.default.http[0]}
            level="l1"
          />
        </Stack>

        <Button
          disabled={balance < amount || amount === BigInt(0)}
          color="secondary"
          variant="contained"
          sx={{
            padding: 2,
            width: "75%",
            marginTop: 8,
            borderRadius: 2,
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
          onClick={showReviewModal}
        >
          Review Withdrawal
        </Button>
      </Stack>
    </>
  );
}
