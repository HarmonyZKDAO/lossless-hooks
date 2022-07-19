import { NETWORK } from '@losslessproject/utilities'
import { useIsTestnets } from './useIsTestnets'

export const useGovernanceChainId = () => {
  const { isTestnets } = useIsTestnets()
  return isTestnets ? NETWORK.rinkeby : NETWORK.mainnet
}
