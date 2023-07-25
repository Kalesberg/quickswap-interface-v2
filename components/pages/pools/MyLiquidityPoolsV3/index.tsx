import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, CircularProgress } from '@mui/material';
import { useV3Positions } from 'hooks/v3/useV3Positions';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import usePrevious, { usePreviousNonEmptyArray } from 'hooks/usePrevious';
import PositionList from './components/PositionList';
import FilterPanelItem from '../FilterPanelItem';
import { PositionPool } from 'models/interfaces';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'next-i18next';
import { getConfig } from 'config';
import styles from 'styles/pages/Pools.module.scss';

export default function MyLiquidityPoolsV3() {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const router = useRouter();
  const [userHideClosedPositions, setUserHideClosedPositions] = useState(true);
  const [hideFarmingPositions, setHideFarmingPositions] = useState(false);
  const { positions, loading: positionsLoading } = useV3Positions(account);
  const prevAccount = usePrevious(account);

  const [openPositions, closedPositions] = positions?.reduce<
    [PositionPool[], PositionPool[]]
  >(
    (acc, p) => {
      acc[p.liquidity?.isZero() ? 1 : 0].push(p);
      return acc;
    },
    [[], []],
  ) ?? [[], []];

  const filters = [
    {
      title: t('closed'),
      method: setUserHideClosedPositions,
      checkValue: userHideClosedPositions,
    },
    {
      title: t('farming'),
      method: setHideFarmingPositions,
      checkValue: hideFarmingPositions,
    },
  ];

  const farmingPositions = useMemo(
    () => positions?.filter((el) => el.onFarming),
    [positions],
  );
  const inRangeWithOutFarmingPositions = useMemo(
    () => openPositions.filter((el) => !el.onFarming),
    [openPositions],
  );

  const filteredPositions = useMemo(
    () => [
      ...(hideFarmingPositions || !farmingPositions ? [] : farmingPositions),
      ...inRangeWithOutFarmingPositions,
      ...(userHideClosedPositions ? [] : closedPositions),
    ],
    [
      hideFarmingPositions,
      farmingPositions,
      inRangeWithOutFarmingPositions,
      userHideClosedPositions,
      closedPositions,
    ],
  );
  const prevFilteredPositions = usePreviousNonEmptyArray(filteredPositions);
  const _filteredPositions = useMemo(() => {
    if (account !== prevAccount) return filteredPositions;

    if (filteredPositions.length === 0 && prevFilteredPositions) {
      return prevFilteredPositions;
    }
    return filteredPositions;
  }, [prevFilteredPositions, filteredPositions, account, prevAccount]);

  const newestPosition = useMemo(() => {
    return Math.max(..._filteredPositions.map((position) => +position.tokenId));
  }, [_filteredPositions]);

  const showConnectAWallet = Boolean(!account);

  const toggleWalletModal = useWalletModalToggle();

  const { pairs: allV2PairsWithLiquidity } = useV2LiquidityPools(
    account ?? undefined,
  );

  const config = getConfig(chainId);
  const isMigrateAvailable = config['migrate']['available'];

  return (
    <Box>
      <p className='weight-600'>{t('myQuickSwapLP')}</p>
      {account && (
        <Box mt={2} className='flex items-center justify-between'>
          <Box className='flex'>
            {filters.map((item, key) => (
              <Box mr={1} key={key}>
                <FilterPanelItem item={item} />
              </Box>
            ))}
          </Box>
          {allV2PairsWithLiquidity.length > 0 && isMigrateAvailable && (
            <Box
              className={styles.v3ManageV2liquidityButton}
              onClick={() => router.push('/migrate')}
            >
              <small className='text-primary'>Migrate V2 Liquidity</small>
            </Box>
          )}
        </Box>
      )}
      <Box mt={2}>
        {positionsLoading ? (
          <Box className='flex justify-center'>
            <CircularProgress size={'2rem'} />
          </Box>
        ) : _filteredPositions && _filteredPositions.length > 0 ? (
          <PositionList
            positions={_filteredPositions.sort((posA, posB) =>
              Number(+posA.tokenId < +posB.tokenId),
            )}
            newestPosition={newestPosition}
          />
        ) : (
          <Box textAlign='center'>
            <p>{t('noLiquidityPositions')}.</p>
            {showConnectAWallet && (
              <Box maxWidth={250} margin='20px auto 0'>
                <Button
                  variant='contained'
                  fullWidth
                  onClick={toggleWalletModal}
                >
                  {t('connectWallet')}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
