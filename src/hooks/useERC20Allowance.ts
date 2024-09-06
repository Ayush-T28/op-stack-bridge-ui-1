import { useCallback } from 'react'
import { Address, erc20Abi } from 'viem'
import { useReadContract, useWriteContract } from 'wagmi'

export type UseERC20AllowanceArgs = {
  token: Address
  chainId: number,
  amount: bigint
  owner: Address
  spender: Address
}

export const useERC20Allowance = ({
  token,
  chainId,
  amount,
  owner,
  spender,
}: UseERC20AllowanceArgs) => {
  const { writeContractAsync } = useWriteContract()

  const allowance = useReadContract({
    abi: erc20Abi,
    address: token,
    chainId: chainId,
    functionName: 'allowance',
    args: [owner, spender],
  })

  const approve = useCallback(async () => {
    return await writeContractAsync({
      abi: erc20Abi,
      address: token,
      chainId: chainId,
      functionName: 'approve',
      args: [spender, amount],
    })
  }, [amount, token, spender])

  return {
    allowance,
    approve,
  }
}
