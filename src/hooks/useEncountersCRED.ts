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
    uuid: 'enc-rn-000',
    encounterDatetime: new Date().toISOString(),
    obs: [
      {
        concept: { display: 'Número de control' },
        value: '0',
      },
      {
        concept: { display: 'Es control complementario' },
        value: false,
      },
      {
        concept: { display: 'Edad del niño en días' },
        value: 15,
      },
      {
        concept: { display: 'Peso (kg)' },
        value: 3.2,
      },
      {
        concept: { display: 'Talla (cm)' },
        value: 50,
      },
      {
        concept: { display: 'Apgar al minuto' },
        value: 8,
      },
      {
        concept: { display: 'Apgar a los 5 minutos' },
        value: 9,
      },
    ],
    creator: { uuid: 'user-rn' },
    provider: { uuid: 'user-rn' },
  },
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
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // Simulate async loading
    const timeout = setTimeout(() => {
      try {
        setEncounters(dummyData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [patientUuid]);

  return { encounters, isLoading, error };
};

export default useEncountersCRED;
