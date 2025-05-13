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

export function usePatientBirthdateAndGender (patientUuid) {
  const { data, isLoading, error } = useSWRImmutable<{ data: PatientInfo }>(
    `${restBaseUrl}/person/${patientUuid}?v=custom:(uuid,gender,birthdate,birthdateEstimated)`,
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
}

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

export function useChartDataForGender ({ gender, chartData = {} }: ChartDataForGenderProps) {
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

export function useMeasurementPlotting (
  measurementData: MeasurementDataEntry[] | undefined,
  fieldName: string,
  category: string,
  dataset: string,
  dateOfBirth: Date,
  startIndex: number,
) {
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
}

