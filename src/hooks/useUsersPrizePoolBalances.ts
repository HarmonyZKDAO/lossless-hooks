import { PrizePool } from '@losslessproject/client-js'
import { formatUnits } from '@ethersproject/units'
import { numberWithCommas } from '@losslessproject/utilities'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

import { TokenWithBalance } from '../types/token'
import { useRefetchInterval } from './useRefetchInterval'
import { PrizePoolTokens, usePrizePoolTokens } from './usePrizePoolTokens'

export interface UsersPrizePoolBalances {
  ticket: TokenWithBalance
  token: TokenWithBalance
}

export const USERS_PRIZE_POOL_BALANCES_QUERY_KEY = 'useUsersPrizePoolBalances'

export const useUsersPrizePoolBalances = (usersAddress: string, prizePool: PrizePool) => {
  const refetchInterval = useRefetchInterval(prizePool?.chainId)
  const { data: tokens, isFetched } = usePrizePoolTokens(prizePool)

  const enabled = Boolean(prizePool) && Boolean(usersAddress) && isFetched

  return useQuery(
    [USERS_PRIZE_POOL_BALANCES_QUERY_KEY, prizePool?.id(), usersAddress],
    async () => getUsersPrizePoolBalances(prizePool, usersAddress, tokens),
    {
      refetchInterval,
      enabled
    }
  )
}

export const prettyNumber = (amount: BigNumber, decimals: string): string =>
  numberWithCommas(amount, { decimals }) as string

export const getUsersPrizePoolBalances = async (
  prizePool: PrizePool,
  usersAddress: string,
  tokens: PrizePoolTokens
): Promise<{
  prizePool: PrizePool
  usersAddress: string
  balances: UsersPrizePoolBalances
}> => {
  const balances = await prizePool.getUsersPrizePoolBalances(usersAddress)
  const { ticket, token } = tokens

  return {
    prizePool,
    usersAddress,
    balances: {
      ticket: {
        ...ticket,
        hasBalance: !balances.ticket.isZero(),
        amountUnformatted: balances.ticket,
        amount: formatUnits(balances.ticket, ticket.decimals),
        amountPretty: prettyNumber(balances.ticket, ticket.decimals)
      },
      token: {
        ...token,
        hasBalance: !balances.token.isZero(),
        amountUnformatted: balances.token,
        amount: formatUnits(balances.token, token.decimals),
        amountPretty: prettyNumber(balances.token, token.decimals)
      }
    }
  }
}
