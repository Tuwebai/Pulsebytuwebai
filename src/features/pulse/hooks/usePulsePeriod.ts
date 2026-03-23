import { useEffect, useState } from 'react';
import type { Period } from '@/data/types/pulse';

const STORAGE_KEY = 'pulse_period';

export function usePulsePeriod(defaultPeriod: Period = 'this_month') {
  const [period, setPeriodState] = useState<Period>(() => {
    if (typeof window === 'undefined') {
      return defaultPeriod;
    }

    const saved = window.localStorage.getItem(STORAGE_KEY) as Period | null;
    return saved || defaultPeriod;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, period);
  }, [period]);

  const setPeriod = (nextPeriod: Period) => {
    setPeriodState(nextPeriod);
  };

  return { period, setPeriod };
}
