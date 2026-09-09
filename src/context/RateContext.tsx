import React, { useMemo, useCallback, type ReactNode } from 'react';
import {
  useGetRatesQuery,
  useUpdateRatesMutation,
  DEFAULT_RATES,
  type MetalRates,
} from '../store/api/rateApi';

export type { MetalRates };

export interface RateContextType {
  rates: MetalRates;
  updateRate: (metal: keyof MetalRates | 'all', value: number | MetalRates) => Promise<void>;
  getTrend: (current: number, previous?: number) => { percent: string; direction: 'up' | 'down' | 'stable' };
}

export const RateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useRates = (): RateContextType => {
  const { data: rates = DEFAULT_RATES } = useGetRatesQuery();
  const [updateRatesMutation] = useUpdateRatesMutation();

  const updateRate = useCallback(
    async (metal: keyof MetalRates | 'all', value: number | MetalRates) => {
      try {
        let payload: Partial<MetalRates> = {};
        if (metal === 'all' && typeof value === 'object') {
          payload = value as MetalRates;
        } else if (typeof metal === 'string' && metal !== 'previous') {
          payload = { ...rates, [metal]: value };
        }
        await updateRatesMutation(payload).unwrap();
      } catch (error) {
        console.error('Failed to update rate', error);
        throw error;
      }
    },
    [rates, updateRatesMutation]
  );

  const getTrend = useCallback((current: number, previous?: number) => {
    if (!previous) return { percent: '0.00', direction: 'stable' as const };
    const diff = current - previous;
    const percent = (diff / previous) * 100;
    return {
      percent: Math.abs(percent).toFixed(2),
      direction: diff > 0 ? ('up' as const) : diff < 0 ? ('down' as const) : ('stable' as const),
    };
  }, []);

  return useMemo(
    () => ({
      rates,
      updateRate,
      getTrend,
    }),
    [rates, updateRate, getTrend]
  );
};
