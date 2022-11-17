import React, { useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme, Button } from '@material-ui/core';
import { getBulkPairData } from 'state/stake/hooks';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import FarmRewards from './FarmRewards';
import FarmsList from './FarmsList';
import { AdsSlider, CustomSwitch } from 'components';
import { useTranslation } from 'react-i18next';
import 'pages/styles/farm.scss';
import { useDefaultFarmList } from 'state/farms/hooks';
import { useDefaultCNTFarmList } from 'state/cnt/hooks';
import { useDefaultDualFarmList } from 'state/dualfarms/hooks';
import { ChainId } from '@uniswap/sdk';
import VersionToggle from 'components/Toggle/VersionToggle';
import V3Farms from 'pages/FarmPage/V3';
import { useIsV2 } from 'state/application/hooks';
import { getConfig } from '../../config/index';

const FarmPage: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const [bulkPairs, setBulkPairs] = useState<any>(null);
  const [farmIndex, setFarmIndex] = useState(
    GlobalConst.farmIndex.LPFARM_INDEX,
  );
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const farms = config['farm']['available'];
  const v3 = config['v3'];
  const v2 = config['v2'];
  const { isV2, updateIsV2 } = useIsV2();

  const lpFarms = useDefaultFarmList();
  const cntFarms = useDefaultCNTFarmList(chainIdToUse);
  const dualFarms = useDefaultDualFarmList();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const pairLists = useMemo(() => {
    const stakingPairLists = Object.values(lpFarms[chainIdToUse]).map(
      (item) => item.pair,
    );
    const dualPairLists = Object.values(dualFarms[chainIdToUse]).map(
      (item) => item.pair,
    );
    const cntPairLists = Object.values(cntFarms[chainIdToUse]).map(
      (item) => item.pair,
    );

    return stakingPairLists.concat(dualPairLists).concat(cntPairLists);
  }, [chainIdToUse, lpFarms, dualFarms, cntFarms]);

  useEffect(() => {
    if (isV2) {
      getBulkPairData(chainIdToUse, pairLists).then((data) =>
        setBulkPairs(data),
      );
    }
  }, [isV2, pairLists, chainIdToUse]);

  useEffect(() => {
    updateIsV2(v2 && v3 ? (isV2 === true ? true : false) : v2 ? true : false);
  }, [v2, v3, isV2]);

  const farmCategories = [
    {
      text: t('lpMining'),
      onClick: () => {
        setFarmIndex(GlobalConst.farmIndex.LPFARM_INDEX);
      },
      condition: farmIndex === GlobalConst.farmIndex.LPFARM_INDEX,
    },
    {
      text: t('otherLPMining'),
      onClick: () => {
        setFarmIndex(GlobalConst.farmIndex.OTHER_LP_INDEX);
      },
      condition: farmIndex === GlobalConst.farmIndex.OTHER_LP_INDEX,
    },
    {
      text: t('dualMining'),
      onClick: () => {
        setFarmIndex(GlobalConst.farmIndex.DUALFARM_INDEX);
      },
      condition: farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX,
    },
  ];
  const helpURL = process.env.REACT_APP_HELP_URL;

  return (
    <Box width='100%' mb={3} id='farmPage'>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('farm')}</h4>
          {v2 && v3 && (
            <Box ml={2}>
              <VersionToggle />
            </Box>
          )}
        </Box>
        {helpURL && (
          <Box
            className='helpWrapper'
            onClick={() => window.open(helpURL, '_blank')}
          >
            <small>{t('help')}</small>
            <HelpIcon />
          </Box>
        )}
      </Box>
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='0 auto 24px'>
        <AdsSlider sort='farms' />
      </Box>
      {isV2 && v2 && (
        <>
          {/* Custom switch layer */}
          <Box className='flex flex-wrap justify-between'>
            <CustomSwitch
              width={450}
              height={48}
              items={farmCategories}
              isLarge={true}
            />
            {farmIndex === GlobalConst.farmIndex.OTHER_LP_INDEX && (
              <Box className='flex'>
                <Button className='btn-xl'>Create A Farm</Button>
              </Box>
            )}
          </Box>

          {/* Rewards */}
          <Box my={3}>
            {farmIndex !== GlobalConst.farmIndex.OTHER_LP_INDEX && (
              <FarmRewards bulkPairs={bulkPairs} farmIndex={farmIndex} />
            )}
          </Box>

          {/* Farms List */}
          <Box className='farmsWrapper'>
            <FarmsList bulkPairs={bulkPairs} farmIndex={farmIndex} />
          </Box>
        </>
      )}
      {!isV2 && v3 && <V3Farms />}
    </Box>
  );
};

export default FarmPage;
