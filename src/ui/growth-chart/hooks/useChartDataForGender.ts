import { useMemo } from 'react';
import { fhirBaseUrl, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';

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

import { useEffect, useState } from 'react';
import type { ChartData } from '../chartDataTypes';
import useSWRImmutable from 'swr/immutable';
import { restBaseUrl } from '@openmrs/esm-framework';
import { GenderCodes } from '../chartDataTypes';

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
