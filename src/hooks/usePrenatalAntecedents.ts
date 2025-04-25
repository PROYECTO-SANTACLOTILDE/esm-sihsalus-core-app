import { useEffect, useCallback, useMemo } from 'react';
import { fhirBaseUrl, restBaseUrl, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import type { FHIRResource, FetchResponse } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite from 'swr/infinite';
import type { KeyedMutator } from 'swr';
import type {
  FHIRSearchBundleResponse,
  MappedInterpretation,
  PrenatalResponse,
  PatientPrenatalAntecedents,
} from '../types';
import { assessValue, getReferenceRangesForConcept } from '../utils';

import type { ConfigObject } from '../config-schema';
import type { ObsRecord } from '@openmrs/esm-patient-common-lib';

const pageSize = 100;

const swrKeyNeedle = Symbol('prenatalAntecedents');

type VitalsAndBiometricsSwrKey = {
  swrKeyNeedle: typeof swrKeyNeedle;
  patientUuid: string;
  conceptUuids: string;
  page: number;
  prevPageData: FHIRSearchBundleResponse;
};

type PrenatalFetchResponse = FetchResponse<PrenatalResponse>;

export interface ConceptMetadata {
  uuid: string;
  display: string;
  hiNormal: number | null;
  hiAbsolute: number | null;
  hiCritical: number | null;
  lowNormal: number | null;
  lowAbsolute: number | null;
  lowCritical: number | null;
  units: string | null;
}

interface ConceptMetadataResponse {
  setMembers: Array<ConceptMetadata>;
}

function getInterpretationKey(header: string) {
  // Reason for `Render` string is to match the column header in the table
  return `${header}RenderInterpretation`;
}

export function usePrenatalConceptMetadata() {
  const { madreGestante } = useConfig<ConfigObject>();
  const prenatalConceptSetUuid = madreGestante.gtpalConceptSetUuid;

  const customRepresentation =
    'custom:(setMembers:(uuid,display,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units))';

  const apiUrl = `${restBaseUrl}/concept/${prenatalConceptSetUuid}?v=${customRepresentation}`;
  const { data, error, isLoading } = useSWRImmutable<{ data: ConceptMetadataResponse }, Error>(apiUrl, openmrsFetch);

  const conceptMetadata = data?.data?.setMembers;

  const conceptUnits = conceptMetadata?.length
    ? new Map<string, string>(conceptMetadata.map((concept) => [concept.uuid, concept.units]))
    : new Map<string, string>([]);

  const conceptRanges = conceptMetadata?.length
    ? new Map<string, { lowAbsolute: number | null; highAbsolute: number | null }>(
        conceptMetadata.map((concept) => [
          concept.uuid,
          {
            lowAbsolute: concept.lowAbsolute ?? null,
            highAbsolute: concept.hiAbsolute ?? null,
          },
        ]),
      )
    : new Map<string, { lowAbsolute: number | null; highAbsolute: number | null }>([]);

  return {
    data: conceptUnits,
    error,
    isLoading,
    conceptMetadata,
    conceptRanges,
  };
}

export function usePrenatalAntecedents(patientUuid: string) {
  const { conceptMetadata } = usePrenatalConceptMetadata();
  const { madreGestante } = useConfig<ConfigObject>();
  const prenatalConcepts = useMemo(
    () => [
      madreGestante.gravidezUuid,
      madreGestante.partoAlTerminoUuid,
      madreGestante.partoPrematuroUuid,
      madreGestante.partoAbortoUuid,
      madreGestante.partoNacidoVivoUuid,
      madreGestante.partoNacidoMuertoUuid,
    ],
    [
      madreGestante.gravidezUuid,
      madreGestante.partoAlTerminoUuid,
      madreGestante.partoPrematuroUuid,
      madreGestante.partoAbortoUuid,
      madreGestante.partoNacidoVivoUuid,
      madreGestante.partoNacidoMuertoUuid,
    ],
  );

  const conceptUuids = useMemo(() => prenatalConcepts.join(','), [prenatalConcepts]);

  const getPage = useCallback(
    (page: number, prevPageData: FHIRSearchBundleResponse): VitalsAndBiometricsSwrKey => ({
      swrKeyNeedle,
      patientUuid,
      conceptUuids,
      page,
      prevPageData,
    }),
    [conceptUuids, patientUuid],
  );

  const { data, isLoading, isValidating, setSize, error, size, mutate } = useSWRInfinite<PrenatalFetchResponse, Error>(
    getPage,
    handleFetch,
  );

  useEffect(() => {
    prenatalAntecedentsMutates.set(patientUuid, mutate as KeyedMutator<any>);
    return () => {
      prenatalAntecedentsMutates.delete(patientUuid);
    };
  }, [mutate, patientUuid]);

  const getPrenatalMapKey = useCallback(
    (conceptUuid: string): string => {
      switch (conceptUuid) {
        case madreGestante.gravidezUuid:
          return 'gravidez';
        case madreGestante.partoAlTerminoUuid:
          return 'partoAlTermino';
        case madreGestante.partoPrematuroUuid:
          return 'partoPrematuro';
        case madreGestante.partoAbortoUuid:
          return 'partoAborto';
        case madreGestante.partoNacidoVivoUuid:
          return 'partoNacidoVivo';
        case madreGestante.partoNacidoMuertoUuid:
          return 'partoNacidoMuerto';
        default:
          return '';
      }
    },
    [
      madreGestante.gravidezUuid,
      madreGestante.partoAlTerminoUuid,
      madreGestante.partoPrematuroUuid,
      madreGestante.partoAbortoUuid,
      madreGestante.partoNacidoVivoUuid,
      madreGestante.partoNacidoMuertoUuid,
    ],
  );

  const formattedObs: Array<PatientPrenatalAntecedents> = useMemo(() => {
    const prenatalHashTable = data?.[0]?.data?.entry
      ?.map((entry) => entry.resource)
      .filter(Boolean)
      .map(mapPrenatalProperties(conceptMetadata))
      ?.reduce((prenatalHashTable, vitalSign) => {
        const recordedDate = new Date(new Date(vitalSign.recordedDate)).toISOString();

        if (prenatalHashTable.has(recordedDate) && prenatalHashTable.get(recordedDate)) {
          prenatalHashTable.set(recordedDate, {
            ...prenatalHashTable.get(recordedDate),
            [getPrenatalMapKey(vitalSign.code)]: vitalSign.value,
            [getInterpretationKey(getPrenatalMapKey(vitalSign.code))]: vitalSign.interpretation,
          });
        } else {
          if (vitalSign.value) {
            prenatalHashTable.set(recordedDate, {
              [getPrenatalMapKey(vitalSign.code)]: vitalSign.value,
              [getInterpretationKey(getPrenatalMapKey(vitalSign.code))]: vitalSign.interpretation,
            });
          }
        }

        return prenatalHashTable;
      }, new Map<string, Partial<PatientPrenatalAntecedents>>());

    return Array.from(prenatalHashTable ?? []).map(([date, vitalSigns], index) => {
      const result = {
        id: index.toString(),
        date: date,
        madreGestante,
        conceptMetadata,
        ...vitalSigns,
      };

      return result;
    });
  }, [data, conceptMetadata, getPrenatalMapKey, madreGestante]);

  return {
    data: data ? formattedObs : undefined,
    isLoading,
    error,
    hasMore: data?.length
      ? !!data[data.length - 1].data?.link?.some((link: { relation?: string }) => link.relation === 'next')
      : false,
    isValidating,
    loadingNewData: isValidating,
    setPage: setSize,
    currentPage: size,
    totalResults: data?.[0]?.data?.total ?? undefined,
    mutate,
  };
}

/**
 * Fetcher for the useVitalsAndBiometricsHook
 * @internal
 */
function handleFetch({ patientUuid, conceptUuids, page, prevPageData }: VitalsAndBiometricsSwrKey) {
  if (prevPageData && !prevPageData?.data?.link.some((link) => link.relation === 'next')) {
    return null;
  }

  let url = `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&`;
  let urlSearchParams = new URLSearchParams();

  urlSearchParams.append('code', conceptUuids);
  urlSearchParams.append('_summary', 'data');
  urlSearchParams.append('_sort', '-date');
  urlSearchParams.append('_count', pageSize.toString());

  if (page) {
    urlSearchParams.append('_getpagesoffset', (page * pageSize).toString());
  }

  return openmrsFetch<PrenatalResponse>(url + urlSearchParams.toString());
}

/**
 * Mapper that converts a FHIR Observation resource into a MappedInterpretation object.
 * @internal
 */
function mapPrenatalProperties(conceptMetadata: Array<ConceptMetadata> | undefined) {
  return (resource: FHIRResource['resource']): MappedInterpretation => ({
    code: resource?.code?.coding?.[0]?.code,
    interpretation: assessValue(
      resource?.valueQuantity?.value,
      getReferenceRangesForConcept(resource?.code?.coding?.[0]?.code, conceptMetadata),
    ),
    recordedDate: resource?.effectiveDateTime,
    value: resource?.valueQuantity?.value,
  });
}

export function savePrenatalAntecedents(
  encounterTypeUuid: string,
  formUuid: string,
  concepts: ConfigObject['madreGestante'],
  patientUuid: string,
  antecedents: Record<string, any>,
  abortController: AbortController,
  location: string,
) {
  return openmrsFetch<unknown>(`${restBaseUrl}/encounter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      patient: patientUuid,
      location,
      encounterType: encounterTypeUuid,
      form: formUuid,
      obs: createObsObject(antecedents, concepts),
    },
  });
}

export function updatePrenatalAntecedents(
  concepts: ConfigObject['madreGestante'],
  patientUuid: string,
  antecedents: Record<string, any>,
  encounterDatetime: Date,
  abortController: AbortController,
  encounterUuid: string,
  location: string,
) {
  return openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: JSON.stringify({
      encounterDatetime,
      location,
      patient: patientUuid,
      obs: createObsObject(antecedents, concepts),
      orders: [],
    }),
  });
}

function createObsObject(
  antecedents: Record<string, any>,
  madreGestante: ConfigObject['madreGestante'], // Ahora recibimos directamente el objeto madreGestante
): Array<{ concept: string; value: string }> {
  return Object.entries(antecedents)
    .filter(([_, value]) => Boolean(value))
    .map(([name, value]) => ({
      concept: madreGestante[`${name}Uuid`], // Acceso directo a las propiedades
      value: value.toString(),
    }));
}

const prenatalAntecedentsMutates = new Map<string, KeyedMutator<any>>();

export async function invalidateCachedPrenatalAntecedents(patientUuid: string) {
  const mutate = prenatalAntecedentsMutates.get(patientUuid);
  if (mutate) {
    await mutate();
  }
}
