import axios from 'axios';
import { ChainId, Pair as UniswapSdkPair } from '@uniswap/sdk';
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from 'constants/v3/addresses';
import { useQuery } from '@tanstack/react-query';
const TEAM_FINANCE_BACKEND_URL =
  'https://team-finance-backend-dev-origdfl2wq-uc.a.run.app/api';
const API_KEY = process.env.TEAM_FINANCE_BACKEND_API_KEY ?? 'yolobolo';
const chain_id = ChainId.MATIC;

export interface Event {
  chainId: string;
  createdAt: string;
  isNftMinted: boolean;
  isWithdrawn: boolean;
  liquidityContractAddress: string;
  liquidityPairAddress: string;
  liquidityPairReserve: string;
  liquidityTokenReserve: string;
  liquidityTotalSupply: string;
  lockAmount: string;
  lockContractAddress: string;
  lockDepositId: number;
  lockNftContractAddress: string;
  migratedLockDepositId: number;
  network: string;
  senderAddress: string;
  timeStamp: number;
  tokenAddress: string;
  tokenId: string;
  tokenTotalSupply: string;
  transactionAmount: string;
  transactionHash: string;
  transactionIndex: number;
  unlockTime: number;
  updatedAt: string;
  withdrawalAddress: string;
}

export interface Token {
  chainId: string;
  createdAt: string;
  isLiquidityToken: boolean;
  isNFT: boolean;
  liquidityLockedInPercent: number;
  liquidityLockedInUsd: number;
  network: string;
  tokenAddress: string;
  tokenCirculatingSupply: string;
  tokenDecimals: number;
  tokenId: string;
  tokenLocked: string;
  tokenName: string;
  tokenImage: string;
  tokenSymbol: string;
  tokenTotalSupply: string;
  updatedAt: string;
}

export interface LiquidityContract {
  chainId: string;
  createdAt: string;
  isLiquidityToken: boolean;
  network: string;
  token0: string;
  token1: string;
  tokenAddress: string;
  tokenDecimals: number;
  tokenName: string;
  tokenSymbol: string;
  tokenTotalSupply: string;
  updatedAt: string;
}

export interface Pair {
  chainId: string;
  createdAt: string;
  isLiquidityToken: boolean;
  isNFT: boolean;
  liquidityLockedInPercent: number;
  liquidityLockedInUsd: number;
  network: string;
  tokenAddress: string;
  tokenCirculatingSupply: string;
  tokenDecimals: number;
  tokenId: string;
  tokenLocked: string;
  tokenName: string;
  tokenImage: string;
  tokenSymbol: string;
  tokenTotalSupply: string;
  updatedAt: string;
}

export interface LockInterface {
  event: Event;
  token: Token;
  liquidityContract: LiquidityContract;
  pair: Pair;
}

axios.defaults.baseURL = TEAM_FINANCE_BACKEND_URL;
axios.defaults.timeout = 120000;
axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.headers.common.Authorization = API_KEY;

export const useUserV2LiquidityLocks = (
  liquidityTokenList: UniswapSdkPair[],
  account?: string,
) => {
  const addressArray = liquidityTokenList.map(
    (item: UniswapSdkPair) => item.liquidityToken.address,
  );
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['v2-tf-lpLock', addressArray, account],
    queryFn: async () => {
      if (!account || addressArray.length === 0) return;
      try {
        const URL = `/app/allMylocks/${account}`;
        const response = await axios.get(URL);
        const v2LpLocks_ = response.data.data.filter((item: LockInterface) => {
          return (
            item.event.chainId == '0x89' &&
            addressArray.includes(item.liquidityContract?.tokenAddress)
          );
        });
        return v2LpLocks_ as LockInterface[];
      } catch (error) {
        return;
      }
    },
  });

  return { data, loading, error };
};

export const useUserV3LiquidityLocks = (account?: string) => {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['v3-tf-lpLock', account],
    queryFn: async () => {
      if (!account) return;
      try {
        const URL = `/app/allMylocks/${account}`;
        const response = await axios.get(URL);
        const v3LpLocks_ = response.data.data.filter((item: LockInterface) => {
          return (
            item.event.chainId == '0x89' &&
            item.liquidityContract?.tokenAddress ==
              NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chain_id]
          );
        });
        return v3LpLocks_ as LockInterface[];
      } catch (error) {
        return;
      }
    },
  });

  return { data, loading, error };
};

export const updateUserLiquidityLock = async (
  lockContractAddress: string,
  lockDepositId: number,
) => {
  const URL = `/app/locks/${lockContractAddress}/${lockDepositId}`;
  return await axios.put(
    URL,
    {},
    {
      headers: {},
      params: {
        network: 'polygon',
        chainId: '0x89',
      },
    },
  );
};
