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