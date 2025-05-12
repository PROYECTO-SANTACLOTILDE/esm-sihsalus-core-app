import { DataSetLabels } from '../../chartDataTypes';
import { useEffect, useRef, useState } from 'react';
import { CategoryCodes, MeasurementTypeCodesLabel, TimeUnitCodes } from '../../chartDataTypes';
import type { ChartData } from '../../chartDataTypes';

export const useAppropriateChartData = (
  chartDataForGender: ChartData,
  defaultIndicator: string,
  gender: string,
  childAgeInWeeks: number,
  childAgeInMonths: number,
) => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof CategoryCodes>();
  const [selectedDataset, setSelectedDataset] = useState<string>();

  const selectDatasetForCategoryRef = useRef<(category: keyof typeof CategoryCodes) => void>();
  selectDatasetForCategoryRef.current = (category: keyof typeof CategoryCodes) => {
    const { datasets } = chartDataForGender[category];
    const isMeasurementType = (xAxis: string) =>
      (
        Object.values(MeasurementTypeCodesLabel) as Array<'Head circumference' | 'Length' | 'Height' | 'Weight'>
      ).includes(xAxis as 'Head circumference' | 'Length' | 'Height' | 'Weight');

    const isWeeksInRange = (xAxis: string) => xAxis === TimeUnitCodes.weeks && childAgeInWeeks < 13;

    const isMonthsInRange = (xAxis: string, range: { start: number; end: number }) =>
      xAxis === TimeUnitCodes.months && childAgeInMonths >= range.start && childAgeInMonths < range.end;

    const getMaxRangeDataset = (datasets: ChartData[0]['datasets']) =>
      Object.entries(datasets).reduce((max, [key, value]) =>
        !max || value.metadata.range.end > max[1].metadata.range.end ? [key, value] : max,
      );

    const isAboveRange = (xAxis: string, range: { start: number; end: number }) =>
      xAxis === TimeUnitCodes.months && childAgeInMonths >= range.end;
    Object.entries(datasets).some(([key, value]) => {
      const { range } = value.metadata;
      const xAxis = value.metadata.xAxisLabel;

      if (isMeasurementType(xAxis) || isWeeksInRange(xAxis) || isMonthsInRange(xAxis, range)) {
        setSelectedDataset((prevDataset) => (prevDataset !== key ? key : prevDataset));
        return true;
      }

      if (isAboveRange(xAxis, range)) {
        const [newDatasetKey] = getMaxRangeDataset(datasets);
        setSelectedDataset(newDatasetKey);
        return true;
      }
      return false;
    });
  };

  useEffect(() => {
    if (selectedCategory && chartDataForGender[selectedCategory]) {
      selectDatasetForCategoryRef.current?.(selectedCategory);
    }
  }, [selectedCategory, chartDataForGender]);

  const isKeyOfCategoryCodes = (key: string): key is keyof typeof CategoryCodes => key in CategoryCodes;

  useEffect(() => {
    const key = `${defaultIndicator}`;

    if (isKeyOfCategoryCodes(key) && chartDataForGender[key]) {
      const newCategory = CategoryCodes[key];

      setSelectedCategory(newCategory);
      const newDataset = Object.keys(chartDataForGender[newCategory].datasets)[0];
      setSelectedDataset(newDataset);
    }
  }, [chartDataForGender, defaultIndicator, gender]);

  return {
    selectedCategory,
    selectedDataset,
    setSelectedCategory,
    setSelectedDataset,
  };
};

interface DatasetMap {
  [x: string]: () => string;
}

export const calculateDecimalDate = (date: string, dataset: string, dateOfBirth: Date): string => {
  const millisecondsInDay = 1000 * 60 * 60 * 24;
  const formattedDate: Date = new Date(date);
  const diffInMilliseconds = formattedDate.getTime() - dateOfBirth.getTime();

  const calculateDiffInMonths = (maxMonths: number | null = null): string => {
    const millisecondsInMonth = millisecondsInDay * 30.44;
    const diffInMonths = diffInMilliseconds / millisecondsInMonth;
    if (diffInMonths < 0 || (maxMonths !== null && diffInMonths > maxMonths)) return null;
    return diffInMonths.toFixed(2);
  };

  const datasetMap: DatasetMap = {
    [DataSetLabels.w_0_13]: () => {
      const millisecondsInWeek = millisecondsInDay * 7;
      const diffInWeeks = diffInMilliseconds / millisecondsInWeek;
      if (diffInWeeks < 0 || diffInWeeks > 13) return null;
      return diffInWeeks.toFixed(2);
    },
    [DataSetLabels.y_0_2]: () => calculateDiffInMonths(24),
    [DataSetLabels.y_0_5]: () => calculateDiffInMonths(60),
    [DataSetLabels.y_2_5]: () => calculateDiffInMonths(60),
  };

  return datasetMap[dataset]?.() ?? null;
};

export function useCalculateMinMaxValues(datasetValues: Array<Record<string, unknown>>) {
  // Verificar si no hay datos o el array está vacío
  if (!datasetValues || datasetValues.length === 0) {
    return { min: 0, max: 0 };
  }

  // Aplanar y filtrar valores numéricos válidos
  const flatValues: number[] = datasetValues.flatMap((entry) =>
    Object.values(entry).filter((value): value is number => {
      return typeof value === 'number' && Number.isFinite(value);
    }),
  );

  // Verificar si no quedaron valores válidos después del filtrado
  if (flatValues.length === 0) {
    return { min: 0, max: 0 };
  }

  // Calcular min y max de manera segura para grandes datasets
  const min = flatValues.reduce((acc, val) => Math.min(acc, val), Infinity);
  const max = flatValues.reduce((acc, val) => Math.max(acc, val), -Infinity);

  return { min, max };
}
