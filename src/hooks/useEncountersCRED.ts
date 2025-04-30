import { useEffect, useState } from 'react';

export interface DummyEncounter {
  uuid: string;
  encounterDatetime: string;
  obs: Array<{
    concept: {
      display: string;
    };
    value: string | number | boolean;
  }>;
  creator?: {
    uuid: string;
  };
  provider?: {
    uuid: string;
  };
}

const dummyData: DummyEncounter[] = [
  {
    uuid: 'enc-001',
    encounterDatetime: new Date().toISOString(),
    obs: [
      {
        concept: { display: 'Número de control' },
        value: '1',
      },
      {
        concept: { display: 'Es control complementario' },
        value: false,
      },
    ],
    creator: { uuid: 'user-123' },
    provider: { uuid: 'user-123' },
  },
  {
    uuid: 'enc-002',
    encounterDatetime: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(),
    obs: [
      {
        concept: { display: 'Número de control' },
        value: '2',
      },
      {
        concept: { display: 'Es control complementario' },
        value: true,
      },
    ],
    creator: { uuid: 'user-456' },
    provider: { uuid: 'user-456' },
  },
];

const useEncountersCRED = (patientUuid: string) => {
  const [encounters, setEncounters] = useState<DummyEncounter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate async loading
    setTimeout(() => {
      setEncounters(dummyData);
      setIsLoading(false);
    }, 500);
  }, [patientUuid]);

  return { encounters, isLoading };
};

export default useEncountersCRED;