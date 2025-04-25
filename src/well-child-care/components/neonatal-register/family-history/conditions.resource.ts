import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { useMemo, useState } from 'react';

export interface FHIRConditionResponse {
  entry: Array<{
    resource: FHIRCondition;
  }>;
  id: string;
  meta: {
    lastUpdated: string;
  };
  resourceType: string;
  total: number;
  type: string;
}

export interface FHIRCondition {
  clinicalStatus: {
    coding: Array<CodingData>;
    display: string;
  };
  code: {
    coding: Array<CodingData>;
  };
  id: string;
  onsetDateTime: string;
  recordedDate: string;
  recorder: {
    display: string;
    reference: string;
    type: string;
  };
  resourceType: string;
  subject: {
    display: string;
    reference: string;
    type: string;
  };
  text: {
    div: string;
    status: string;
  };
  abatementDateTime?: string;
}

export interface CodingData {
  code: string;
  display: string;
  extension?: Array<ExtensionData>;
  system?: string;
}

export interface ExtensionData {
  extension: [];
  url: string;
}

export interface DataCaptureComponentProps {
  entryStarted: () => void;
  entrySubmitted: () => void;
  entryCancelled: () => void;
  closeComponent: () => void;
}

export type Condition = {
  clinicalStatus: string;
  conceptId: string;
  display: string;
  onsetDateTime: string;
  recordedDate: string;
  id: string;
  abatementDateTime?: string;
};

export interface ConditionDataTableRow {
  cells: Array<{
    id: string;
    value: string;
    info: {
      header: string;
    };
  }>;
  id: string;
}

export type CodedCondition = {
  display: string;
  uuid: string;
};

type CreatePayload = {
  clinicalStatus: {
    coding: [
      {
        system: string;
        code: string;
      },
    ];
  };
  code: {
    coding: [
      {
        code: string;
        display: string;
      },
    ];
  };
  onsetDateTime: string;
  recorder: {
    reference: string;
  };
  recordedDate: string;
  resourceType: string;
  subject: {
    reference: string;
  };
  abatementDateTime?: string;
};

type EditPayload = CreatePayload & {
  id: string;
};

export type FormFields = {
  clinicalStatus: string;
  conceptId: string;
  display: string;
  abatementDateTime: string;
  onsetDateTime: string;
  patientId: string;
  userId: string;
};

export function useConditions(patientUuid: string) {
  const conditionsUrl = `${fhirBaseUrl}/Condition?patient=${patientUuid}&_count=100`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: FHIRConditionResponse }, Error>(
    patientUuid ? conditionsUrl : null,
    openmrsFetch,
    {
      revalidateOnFocus: false, // Evita revalidaciones innecesarias al enfocar la ventana
      errorRetryCount: 2, // Reintenta 2 veces en caso de error
    },
  );

  const formattedConditions = useMemo(() => {
    if (!data?.data?.total) return null;
    return data.data.entry
      .map((entry) => entry.resource ?? [])
      .map(mapConditionProperties)
      .sort((a, b) => new Date(b.onsetDateTime).getTime() - new Date(a.onsetDateTime).getTime()); // Orden más preciso con Date
  }, [data]);

  return {
    conditions: formattedConditions,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export function useConditionsSearch(conditionToLookup: string) {
  const config = useConfig();
  const conditionConceptClassUuid = config?.conditionConceptClassUuid;
  const conditionsSearchUrl = `${restBaseUrl}/concept?name=${conditionToLookup}&searchType=fuzzy&class=${conditionConceptClassUuid}&v=custom:(uuid,display)`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<CodedCondition> } }, Error>(
    conditionToLookup ? conditionsSearchUrl : null,
    openmrsFetch,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
    },
  );

  return {
    searchResults: data?.data?.results ?? [],
    error,
    isSearching: isLoading,
  };
}

function mapConditionProperties(condition: FHIRCondition): Condition {
  const status = condition?.clinicalStatus?.coding[0]?.code;
  return {
    clinicalStatus: status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '',
    conceptId: condition?.code?.coding[0]?.code ?? '',
    display: condition?.code?.coding[0]?.display ?? '',
    abatementDateTime: condition?.abatementDateTime,
    onsetDateTime: condition?.onsetDateTime ?? '',
    recordedDate: condition?.recordedDate ?? '',
    id: condition?.id ?? '',
  };
}

export async function createCondition(payload: FormFields): Promise<any> {
  const controller = new AbortController();
  const url = `${fhirBaseUrl}/Condition`;

  const completePayload: CreatePayload = {
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: payload.clinicalStatus.toLowerCase(), // Normalizamos a minúsculas para consistencia con FHIR
        },
      ],
    },
    code: {
      coding: [
        {
          code: payload.conceptId,
          display: payload.display,
        },
      ],
    },
    abatementDateTime: payload.abatementDateTime || undefined,
    onsetDateTime: payload.onsetDateTime || new Date().toISOString(), // Valor por defecto si no se proporciona
    recorder: {
      reference: `Practitioner/${payload.userId}`,
    },
    recordedDate: new Date().toISOString(),
    resourceType: 'Condition',
    subject: {
      reference: `Patient/${payload.patientId}`,
    },
  };

  try {
    const res = await openmrsFetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(completePayload),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Failed to create condition: ${res.statusText}`);
    return res;
  } catch (error) {
    throw new Error(`Error creating condition: ${error.message}`);
  } finally {
    controller.abort(); // Cancelamos la solicitud si aún está pendiente
  }
}

export async function updateCondition(conditionId: string, payload: FormFields): Promise<any> {
  const controller = new AbortController();
  const url = `${fhirBaseUrl}/Condition/${conditionId}`;

  const completePayload: EditPayload = {
    id: conditionId,
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: payload.clinicalStatus.toLowerCase(), // Normalizamos a minúsculas
        },
      ],
    },
    code: {
      coding: [
        {
          code: payload.conceptId,
          display: payload.display,
        },
      ],
    },
    abatementDateTime: payload.abatementDateTime || undefined,
    onsetDateTime: payload.onsetDateTime || new Date().toISOString(),
    recorder: {
      reference: `Practitioner/${payload.userId}`,
    },
    recordedDate: new Date().toISOString(),
    resourceType: 'Condition',
    subject: {
      reference: `Patient/${payload.patientId}`,
    },
  };

  try {
    const res = await openmrsFetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(completePayload),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Failed to update condition: ${res.statusText}`);
    return res;
  } catch (error) {
    throw new Error(`Error updating condition: ${error.message}`);
  } finally {
    controller.abort();
  }
}

export async function deleteCondition(conditionId: string): Promise<any> {
  const controller = new AbortController();
  const url = `${fhirBaseUrl}/Condition/${conditionId}`;

  try {
    const res = await openmrsFetch(url, {
      method: 'DELETE',
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Failed to delete condition: ${res.statusText}`);
    return res;
  } catch (error) {
    throw new Error(`Error deleting condition: ${error.message}`);
  } finally {
    controller.abort();
  }
}

export interface ConditionTableRow extends Condition {
  id: string;
  condition: string;
  abatementDateTime: string;
  onsetDateTimeRender: string;
}

export interface ConditionTableHeader {
  key: 'display' | 'onsetDateTimeRender' | 'status';
  header: string;
  isSortable: true;
  sortFunc: (valueA: ConditionTableRow, valueB: ConditionTableRow) => number;
}

export function useConditionsSorting(tableHeaders: Array<ConditionTableHeader>, tableRows: Array<ConditionTableRow>) {
  const [sortParams, setSortParams] = useState<{
    key: ConditionTableHeader['key'] | '';
    sortDirection: 'ASC' | 'DESC' | 'NONE';
  }>({ key: '', sortDirection: 'NONE' });

  const sortRow = (
    cellA: any,
    cellB: any,
    { key, sortDirection }: { key: string; sortDirection: 'ASC' | 'DESC' | 'NONE' },
  ) => {
    setSortParams({ key: key as ConditionTableHeader['key'], sortDirection });
  };

  const sortedRows = useMemo(() => {
    if (sortParams.sortDirection === 'NONE' || !tableRows) return tableRows;

    const { key, sortDirection } = sortParams;
    const tableHeader = tableHeaders.find((h) => h.key === key);

    return [...tableRows].sort((a, b) => {
      const sortingNum = tableHeader?.sortFunc(a, b) || 0;
      return sortDirection === 'DESC' ? sortingNum : -sortingNum;
    });
  }, [sortParams, tableRows, tableHeaders]);

  return {
    sortedRows,
    sortRow,
  };
}
