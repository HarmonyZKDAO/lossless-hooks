import { batch, contract } from '@pooltogether/etherplex'
import { useQuery } from 'react-query'
import { BigNumber } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { BaseProvider } from '@ethersproject/providers'

import PrizePoolAbi from '../abis/PrizePool_3_3_0'
import { NO_REFETCH } from '../constants'
import { useReadProvider } from './useReadProvider'
import { sToMs } from '@losslessproject/utilities'

export function useV3ExitFee(
  chainId: number,
  poolAddress: string,
  ticketAddress: string,
  usersAddress: string,
  amountUnformatted: BigNumber
) {
  const readProvider = useReadProvider(chainId)

  const enabled = Boolean(
    amountUnformatted && usersAddress && chainId && ticketAddress && poolAddress
  )

  return useQuery(
    [
      'useV3ExitFee',
      enabled,
      amountUnformatted?.toString(),
      usersAddress,
      chainId,
      ticketAddress,
      poolAddress
    ],
    () => fetchExitFee(readProvider, usersAddress, poolAddress, ticketAddress, amountUnformatted),
    { enabled }
  )
}

export const fetchExitFee = async (
  readProvider: Provider,
  usersAddress: string,
  poolAddress: string,
  ticketAddress: string,
  amountUnformatted: BigNumber
) => {
  try {
    const etherplexPrizePoolContract = contract('prizePool', PrizePoolAbi, poolAddress)
    const values = await batch(
      readProvider,
      etherplexPrizePoolContract.calculateEarlyExitFee(
        usersAddress,
        ticketAddress,
        amountUnformatted
      )
    )
    return values.prizePool.calculateEarlyExitFee.exitFee
  } catch (e) {
    console.warn(e.message)
    return BigNumber.from(0)
  }
}
