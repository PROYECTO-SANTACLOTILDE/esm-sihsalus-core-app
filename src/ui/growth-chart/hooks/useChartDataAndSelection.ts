import { useEffect, useMemo, useState } from 'react';
import { type ChartData, type CategoryCodes, MeasurementTypeCodesLabel, TimeUnitCodes } from '../types';

export function useChartDataAndSelection(
  chartData: ChartData,
  gender: string,
  defaultIndicator: string,
  childAgeInWeeks: number,
  childAgeInMonths: number,
) {
  const chartDataForGender = useMemo(() => {
    return Object.fromEntries(
      Object.entries(chartData).filter(([, value]) => value?.categoryMetadata?.gender === gender),
    );
  }, [chartData, gender]);

  const [selectedCategory, setSelectedCategory] = useState<keyof typeof CategoryCodes>();
  const [selectedDataset, setSelectedDataset] = useState<string>();

  useEffect(() => {
    const key = defaultIndicator as keyof typeof CategoryCodes;
    if (!chartDataForGender[key]) return;

    const datasets = chartDataForGender[key].datasets;
    const datasetKey = pickDatasetKey(datasets, childAgeInWeeks, childAgeInMonths);

    setSelectedCategory(key);
    setSelectedDataset(datasetKey);
  }, [chartDataForGender, defaultIndicator, childAgeInWeeks, childAgeInMonths]);

  return {
    chartDataForGender,
    selectedCategory,
    setSelectedCategory,
    selectedDataset,
    setSelectedDataset,
  };
}

function pickDatasetKey(
  datasets: ChartData[string]['datasets'],
  weeks: number,
  months: number,
): string {
  const isMeasurementType = (xAxis: string) =>
    (Object.values(MeasurementTypeCodesLabel) as string[]).includes(xAxis);

  const getMaxRangeKey = () =>
    Object.entries(datasets).reduce((max, [key, value]) =>
      !max || value.metadata.range.end > max[1].metadata.range.end ? [key, value] : max,
    )[0];

  for (const [key, { metadata }] of Object.entries(datasets)) {
    const { xAxisLabel, range } = metadata;

    if (
      isMeasurementType(xAxisLabel) ||
      (xAxisLabel === TimeUnitCodes.weeks && weeks < 13) ||
      (xAxisLabel === TimeUnitCodes.months && months >= range.start && months < range.end)
    ) {
      return key;
    }

    if (xAxisLabel === TimeUnitCodes.months && months >= range.end) {
      return getMaxRangeKey();
    }
  }

  return Object.keys(datasets)[0];
}
