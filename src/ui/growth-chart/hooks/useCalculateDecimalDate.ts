import { DataSetLabels } from '../config-schema';
import { useMemo, useEffect, useRef, useState } from 'react';
import { restBaseUrl, fhirBaseUrl, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { ChartLineColorPicker } from '../grow-chart-options';
import { GenderCodes, CategoryCodes, MeasurementTypeCodesLabel, TimeUnitCodes } from '../config-schema';
import type { ChartData } from '../config-schema';

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

export interface MeasurementData {
  eventDate: Date;
  dataValues: {
    weight: string;
    height: string;
    headCircumference: string;
  };
}

export function useVitalsAndBiometrics(patientUuid: string | null, mode: 'vitals' | 'biometrics' | 'both' = 'vitals') {
  const { concepts } = useConfig();

  const conceptUuids = useMemo(() => {
    if (!concepts) return '';

    return (
      mode === 'both'
        ? Object.values(concepts)
        : Object.values(concepts).filter((uuid) =>
            mode === 'vitals'
              ? !['heightUuid', 'weightUuid', 'headCircumferenceUuid'].includes(uuid as string)
              : ['heightUuid', 'weightUuid', 'headCircumferenceUuid'].includes(uuid as string),
          )
    ).join(',');
  }, [concepts, mode]);

  const { data, isLoading, error } = useSWR<{ data: { entry: Array<{ resource: any }> } }>(
    patientUuid
      ? `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=${conceptUuids}&_sort=-date&_count=100`
      : null,
    openmrsFetch,
  );

  const formattedObs: MeasurementData[] = useMemo(() => {
    if (!data?.data?.entry) return [];

    const measurementsMap = new Map<string, MeasurementData>();

    data.data.entry.forEach((entry) => {
      const resource = entry.resource;
      const date = resource?.effectiveDateTime;
      const conceptUuid = resource?.code?.coding?.[0]?.code;
      const value = resource?.valueQuantity?.value;

      if (!date || !conceptUuid || !value) return;

      if (!measurementsMap.has(date)) {
        measurementsMap.set(date, {
          eventDate: new Date(date),
          dataValues: {
            weight: '',
            height: '',
            headCircumference: '',
          },
        });
      }

      const measurement = measurementsMap.get(date)!;

      switch (conceptUuid) {
        case concepts.heightUuid:
          measurement.dataValues.height = value.toString();
          break;
        case concepts.weightUuid:
          measurement.dataValues.weight = value.toString();
          break;
        case concepts.headCircumferenceUuid:
          measurement.dataValues.headCircumference = value.toString();
          break;
      }
    });

    return Array.from(measurementsMap.values());
  }, [data, concepts]);

  return { data: formattedObs, isLoading, error };
}

export interface PatientInfo {
  uuid: string;
  gender: string;
  birthdate: string;
  birthdateEstimated?: boolean;
}

const customRepresentation = 'custom:(uuid,gender,birthdate,birthdateEstimated)';

/**
 * Hook para obtener la edad y género del paciente.
 * @param patientUuid Identificador único del paciente
 * @returns { gender, birthdate, birthdateEstimated, isLoading, error }
 */
export const usePatientBirthdateAndGender = (patientUuid) => {
  const { data, isLoading, error } = useSWRImmutable<{ data: PatientInfo }>(
    `${restBaseUrl}/person/${patientUuid}?v=${customRepresentation}`,
    openmrsFetch,
  );

  const rawGender = data?.data.gender ?? GenderCodes.CGC_Female;

  return {
    gender: rawGender?.toUpperCase(),
    birthdate: data?.data.birthdate ?? '',
    birthdateEstimated: data?.data.birthdateEstimated ?? false,
    isLoading,
    error,
  };
};

type Observation = {
  id: string;
  effectiveDateTime: string;
  valueQuantity: {
    value: number;
    unit: string;
  };
  code: {
    coding: Array<{
      code: string;
      display: string;
    }>;
  };
};

type ObservationResponse = {
  resourceType: string;
  entry: Array<{
    resource: Observation;
  }>;
};
export function usePatientObservations(patientUuid: string, codes: string[]) {
  const fetchUrl = useMemo(() => {
    const codeParams = codes.join(',');
    return `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=${codeParams}&_summary=data&_sort=-date&_count=100`;
  }, [patientUuid, codes]);

  const { data, error, isLoading } = useSWR<ObservationResponse>(patientUuid ? fetchUrl : null, async (url) => {
    const response = await openmrsFetch(url);
    return response?.data;
  });

  const observations = useMemo(() => {
    if (!data?.entry) return [];

    return data.entry.map((entry) => ({
      id: entry.resource.id,
      date: entry.resource.effectiveDateTime,
      value: entry.resource.valueQuantity.value,
      unit: entry.resource.valueQuantity.unit,
      type: entry.resource.code.coding[0].display,
    }));
  }, [data]);

  return {
    observations,
    isLoading,
    error,
  };
}

interface ChartDataForGenderProps {
  gender: string;
  chartData: ChartData;
}

export const useChartDataForGender = ({ gender, chartData = {} }: ChartDataForGenderProps) => {
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
};

export interface MeasurementDataEntry {
  eventDate: string | Date;
  dataValues: {
    [key: string]: number | string;
  };
}
type DataSetLabelValues = (typeof DataSetLabels)[keyof typeof DataSetLabels];

export const useMeasurementPlotting = (
  measurementData: MeasurementDataEntry[] | undefined,
  fieldName: string,
  category: string,
  dataset: string,
  dateOfBirth: Date,
  startIndex: number,
) => {
  const measurementDataValues: { x: Date | number | string; y: number; eventDate?: Date }[] = [];

  if (!measurementData) {
    return [];
  }

  const processEntry = (entry: MeasurementDataEntry) => {
    let xValue: Date | number | string;
    let yValue: number;

    if (category === CategoryCodes.wflh_b || category === CategoryCodes.wflh_g) {
      xValue = parseFloat(String(entry.dataValues.height));
      yValue = parseFloat(String(entry.dataValues.weight));
    } else {
      const dateString: string = typeof entry.eventDate === 'string' ? entry.eventDate : entry.eventDate.toISOString();
      const xValueDecimalDate: string = calculateDecimalDate(dateString, dataset, dateOfBirth);
      xValue = xValueDecimalDate;
      yValue = parseFloat(String(entry.dataValues[fieldName]));
    }

    const eventDateValue = new Date(entry.eventDate);
    measurementDataValues.push({
      x: xValue,
      y: yValue,
      eventDate: eventDateValue,
    });
  };

  const validDatasets = Object.values(DataSetLabels) as DataSetLabelValues[];
  if (validDatasets.includes(dataset as DataSetLabelValues)) {
    measurementData.forEach(processEntry);

    if (dataset !== DataSetLabels.y_2_5) {
      measurementDataValues.filter((data) => typeof data.x === 'number' && data.x >= startIndex);
    }
  }

  return [
    {
      id: 'measurementData',
      data: measurementDataValues,
      borderWidth: 1.5,
      borderColor: 'rgba(43,102,147,255)',
      pointRadius: 3,
      pointBackgroundColor: 'rgba(43,102,147,255)',
      fill: false,
      borderDash: [5, 5],
    },
  ];
};

interface DatasetValues {
  [key: string]: number;
}

export const useChartLines = (
  datasetValues: DatasetValues[],
  keysDataSet: string[],
  datasetMetadata: any,
  category: string,
  dataset: string | number,
  startIndex: number,
  isPercentiles: boolean,
) => {
  const [ChartLines, setChartLines] = useState<any[]>([]);

  useEffect(() => {
    const newChartLines = keysDataSet.map((key) => ({
      data: datasetValues.map((entry, index) => ({
        x: startIndex + index,
        y: entry[key],
      })),
      borderWidth: 0.9,
      borderColor: ChartLineColorPicker(key, isPercentiles),
      label: key,
    }));

    setChartLines(newChartLines);
  }, [datasetValues, keysDataSet, datasetMetadata, category, dataset, startIndex, isPercentiles]);

  return ChartLines;
};
