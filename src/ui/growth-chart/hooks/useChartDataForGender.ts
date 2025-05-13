import { useMemo } from 'react';
import type { ChartDataForGenderProps } from '../config-schema';

export function useChartDataForGender({ gender, chartData = {} }: ChartDataForGenderProps) {
  const chartDataForGender = useMemo(() => {
    return Object.fromEntries(
      Object.entries(chartData).filter(([, value]) => value?.categoryMetadata?.gender === gender),
    );
  }, [gender, chartData]);

  return { chartDataForGender };
}
