import { useMemo, useEffect, useState } from 'react';
import { differenceInMonths, differenceInWeeks } from 'date-fns';
import { usePatientBirthdateAndGender } from './usePatientBirthdateAndGender';
import { useChartDataForGender } from './useChartDataForGender';
import { useVitalsAndBiometrics } from './useVitalsAndBiometrics';
import { useAppropriateChartData } from './useAppropriateChartData';
import { calculateMinMaxValues } from '../utils/calculateMinMaxValues';
import { type ChartData, type MeasurementData } from '../config-schema';

export const useGrowthChartLogic = (patientUuid: string, chartData: ChartData) => {
  const { gender: rawGender, birthdate, isLoading, error } = usePatientBirthdateAndGender(patientUuid);
  const [gender, setGender] = useState('');

  useEffect(() => {
    if (typeof rawGender === 'string') {
      setGender(rawGender.toUpperCase());
    }
  }, [rawGender]);

  const { chartDataForGender } = useChartDataForGender({ gender, chartData });
  const defaultIndicator = useMemo(() => Object.keys(chartDataForGender)[0] ?? '', [chartDataForGender]);

  const { data: rawObservations = [], isLoading: isValidating } = useVitalsAndBiometrics(patientUuid, 'both');
  const observations: MeasurementData[] = useMemo(
    () => rawObservations.map(obs => ({ ...obs, eventDate: new Date(obs.eventDate) })),
    [rawObservations],
  );

  const dateOfBirth = useMemo(() => new Date(birthdate ?? new Date()), [birthdate]);
  const weeks = useMemo(() => differenceInWeeks(new Date(), dateOfBirth), [dateOfBirth]);
  const months = useMemo(() => differenceInMonths(new Date(), dateOfBirth), [dateOfBirth]);

  const {
    selectedCategory,
    selectedDataset,
    setSelectedCategory,
    setSelectedDataset,
  } = useAppropriateChartData(chartDataForGender, defaultIndicator, gender, weeks, months);

  const dataSetEntry = chartDataForGender[selectedCategory]?.datasets?.[selectedDataset];
  const dataSetValues = useMemo(
    () => dataSetEntry ? (dataSetEntry.percentileDatasetValues ?? []) : [],
    [dataSetEntry]
  );

  const { min = 0, max = 100 } = calculateMinMaxValues(dataSetValues);

  return {
    gender,
    setGender,
    isLoading,
    error,
    isValidating,
    observations,
    dateOfBirth,
    selectedCategory,
    selectedDataset,
    setSelectedCategory,
    setSelectedDataset,
    dataSetEntry,
    dataSetValues,
    yAxisRange: {
      minDataValue: Math.max(0, Math.floor(min)),
      maxDataValue: Math.ceil(max),
    },
  };
};
