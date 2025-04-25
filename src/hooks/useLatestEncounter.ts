import useSWR, { type KeyedMutator } from 'swr';
import { openmrsFetch, restBaseUrl, type FetchResponse } from '@openmrs/esm-framework';
import pickBy from 'lodash/pickBy';
import type { OpenmrsEncounter } from '../types'; // Asegúrate de importar el tipo correcto

// Representación personalizada para incluir observaciones
const latestEncounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType:(uuid,display),location:(uuid,display),patient:(uuid,display),' +
  'obs:(uuid,obsDatetime,concept:(uuid,display),value:(uuid,display,name:(uuid,name)),groupMembers:(uuid,concept:(uuid,display),value:(uuid,display))),form:(uuid,name))';

interface UseLatestEncounterResponse {
  encounter: OpenmrsEncounter | undefined;
  isLoading: boolean;
  error: Error | null;
  mutate: KeyedMutator<FetchResponse<{ results: OpenmrsEncounter[] }>>;
}

export const useLatestValidEncounter = (patientUuid: string, encounterTypeUuid: string): UseLatestEncounterResponse => {
  if (!patientUuid || !encounterTypeUuid) {
    return {
      encounter: undefined,
      isLoading: false,
      error: new Error('patientUuid and encounterTypeUuid are required'),
      mutate: () => Promise.resolve(undefined),
    };
  }

  const params = new URLSearchParams(
    pickBy(
      {
        patient: patientUuid,
        encounterType: encounterTypeUuid,
        v: latestEncounterRepresentation,
        _sort: '-encounterDatetime', // Ordenar por fecha descendente
        _count: '1', // Limitar a 1 resultado
      },
      (value) => value,
    ),
  );

  const url = `${restBaseUrl}/encounter?${params.toString()}`;

  const { data, isLoading, error, mutate } = useSWR<FetchResponse<{ results: OpenmrsEncounter[] }>, Error>(
    url,
    async (url) => {
      const response = await openmrsFetch(url);
      return response;
    },
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    },
  );

  // Acceder al primer resultado
  const encounter = data?.data?.results?.[0];

  return {
    encounter,
    isLoading,
    error,
    mutate,
  };
};
