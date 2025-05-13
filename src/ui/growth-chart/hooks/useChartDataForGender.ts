import { useEffect, useState } from 'react';
import type { ChartData, ChartDataForGenderProps } from '../config-schema';

export function useChartDataForGender({ gender, chartData = {} }: ChartDataForGenderProps) {
  const [chartDataForGender, setChartDataForGender] = useState<ChartData>({});

  useEffect(() => {
    const filteredData = Object.entries(chartData).reduce((acc: ChartData, [key, value]) => {
      if (value?.categoryMetadata?.gender === gender) {
        acc[key] = value;
      }
      return acc;
    }, {});

    setChartDataForGender(filteredData);
  }, [gender, chartData]);

  return { chartDataForGender };
}
