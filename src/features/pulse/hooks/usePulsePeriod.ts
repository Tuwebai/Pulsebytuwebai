import { useEffect, useState } from 'react';
import type { Period } from '@/data/types/pulse';

export function usePulsePeriod(defaultPeriod: Period = 'this_month') {
  const [period, setPeriodState] = useState<Period>(defaultPeriod);

  useEffect(() => {
    setPeriodState(defaultPeriod);
  }, [defaultPeriod]);

  const setPeriod = (nextPeriod: Period) => {
    setPeriodState(nextPeriod);
  };

  return { period, setPeriod };
}
