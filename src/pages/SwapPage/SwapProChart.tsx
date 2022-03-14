import React from 'react';
import { AdvancedChart } from 'react-tradingview-embed';

const SwapProChart: React.FC = () => {
  return (
    <AdvancedChart
      widgetProps={{
        theme: 'dark',
        height: '100%',
        symbol: 'QUICKSWAP:QUICKOM',
      }}
    />
  );
};

export default React.memo(SwapProChart);
