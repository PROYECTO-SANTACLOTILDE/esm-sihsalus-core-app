import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import type { ProgramWorkflowState, PatientProgram, Program, ProgramsFetchResponse } from '../types';
import uniqBy from 'lodash-es/uniqBy';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import type { ConfigObject } from '../config-schema';

export const customRepresentation = `custom:(uuid,display,program,dateEnrolled,dateCompleted,location:(uuid,display),states:(startDate,endDate,voided,state:(uuid,concept:(display))))`;

type Encounter = {
  uuid: string;
  display: string;
  links: { uri: string }[];
};

type EncounterResponse = {
  results: Encounter[];
};

type Obs = {
  uuid: string;
  display: string;
  groupMembers?: Obs[];
};

type ObsEncounter = {
  encounterDatetime: string;
  form: {
    uuid: string;
    display: string;
  };
  obs: Obs[];
};

type ObsEncounterGroup = {
  encounterDatetime: string;
  form: {
    uuid: string;
    display: string;
  };
  obs: Obs[];
};

export const useSummaryOfLaborAndPostpartum = (
  patientUuid: string,
): { prenatalEncounter: ObsEncounter; error: any; isValidating: boolean; mutate: () => void } => {
  const config = useConfig() as ConfigObject;
  const formName = config.formsList.SummaryOfLaborAndPostpartum;

  const atencionPrenatal = 'Hospitalización';
  const attentionssUrl = useMemo(() => {
    return `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${atencionPrenatal}`;
  }, [patientUuid]);

  const { data, error, isValidating, mutate } = useSWR<EncounterResponse>(
    patientUuid ? attentionssUrl : null,
    async (url) => {
      const response = await openmrsFetch(url);
      return response?.data;
    },
  );

  const encounterUuids = useMemo(() => {
    if (!data || !data.results) return [];
    return data.results.map((encounter: Encounter) => encounter.uuid);
  }, [data]);

  const { data: detailedEncounters, error: detailedError } = useSWRImmutable(
    encounterUuids.length > 0
      ? encounterUuids.map(
          (uuid) =>
            `${restBaseUrl}/encounter/${uuid}?v=custom:(encounterDatetime,form:(uuid,display),obs:(uuid,display))`,
        )
      : null,
    async (urls) => {
      const responses = await Promise.all(urls.map((url) => openmrsFetch(url)));
      return responses.map((res) => res?.data);
    },
  );

  // Get the most recent prenatal encounter
  const mostRecentPrenatalEncounter = useMemo(() => {
    if (!detailedEncounters) return null;

    // Filter encounters with the specific form
    const filteredEncounters = detailedEncounters.filter((encounter) => encounter?.form?.display === formName);

    // Sort encounters by date in descending order (most recent first)
    const sortedEncounters = filteredEncounters.sort((a, b) => {
      const dateA = new Date(a.encounterDatetime);
      const dateB = new Date(b.encounterDatetime);
      return dateB.getTime() - dateA.getTime();
    });

    // Return only the most recent encounter, or null if none exists
    return sortedEncounters.length > 0 ? sortedEncounters[0] : null;
  }, [detailedEncounters, formName]);

  // Extract observation UUIDs from the most recent encounter
  const obsUuids = useMemo(() => {
    if (!mostRecentPrenatalEncounter || !mostRecentPrenatalEncounter.obs) return [];
    return mostRecentPrenatalEncounter.obs.map((obs) => obs.uuid);
  }, [mostRecentPrenatalEncounter]);

  // Fetch group members for each observation
  const { data: obsDetails, error: obsError } = useSWRImmutable(
    obsUuids.length > 0
      ? obsUuids.map((uuid) => `${restBaseUrl}/obs/${uuid}?v=custom:(uuid,display,groupMembers:(uuid,display))`)
      : null,
    async (urls) => {
      const responses = await Promise.all(urls.map((url) => openmrsFetch(url)));
      return responses.map((res) => res?.data);
    },
  );

  // Combine the encounter with detailed observations
  const prenatalEncounter = useMemo(() => {
    if (!mostRecentPrenatalEncounter) return null;
    if (!obsDetails) return mostRecentPrenatalEncounter;

    // Create a copy of the encounter
    const enhancedEncounter = { ...mostRecentPrenatalEncounter };

    // Replace each observation with its detailed version including group members
    enhancedEncounter.obs = enhancedEncounter.obs.map((obs) => {
      const detailedObs = obsDetails.find((detail) => detail.uuid === obs.uuid);
      return detailedObs || obs;
    });

    return enhancedEncounter;
  }, [mostRecentPrenatalEncounter, obsDetails]);

  return {
    prenatalEncounter,
    error: error || detailedError || obsError,
    isValidating,
    mutate,
  };
};
