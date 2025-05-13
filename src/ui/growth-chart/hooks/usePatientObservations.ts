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