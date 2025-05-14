import { restBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { GenderCodes } from '../data-sets';

export interface PatientInfo {
  uuid: string;
  gender: string;
  birthdate: string;
  birthdateEstimated?: boolean;
}

export function usePatientBirthdateAndGender(patientUuid) {
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
