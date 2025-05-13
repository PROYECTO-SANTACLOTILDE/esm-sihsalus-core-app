import { useMemo, useEffect, useState } from 'react';
import { restBaseUrl, fhirBaseUrl, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { DataSetLabels, GenderCodes, CategoryCodes } from '../config-schema';
import { calculateDecimalDate } from '../utils/calculateDecimalDate';
import type {
  ChartData,
  MeasurementData,
  PatientInfo,
  ChartDataForGenderProps,
  ObservationResponse,
  DataSetLabelValues,
  MeasurementDataEntry,
} from '../config-schema';

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
