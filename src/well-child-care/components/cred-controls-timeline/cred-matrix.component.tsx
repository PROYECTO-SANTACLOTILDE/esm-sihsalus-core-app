import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { Tile, Button, Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import { useConfig } from '@openmrs/esm-framework';
import useEncountersCRED from '../../../hooks/useEncountersCRED';
import styles from './cred-schedule.scss';
import type { ConfigObject } from '../../../config-schema';

interface CredEntry {
  id: string;
  number: number;
  date: string; // ISO date
  type: 'complementary' | 'regular';
  createdByCurrentUser: boolean;
}

interface CredControlsMatrixProps {
  patientUuid: string;
  onDelete: (id: string) => void;
}

const CredControlsMatrix: React.FC<CredControlsMatrixProps> = ({ patientUuid, onDelete }) => {
  const { ageGroupsCRED, encounterTypes } = useConfig<ConfigObject>();

  const { encounters, isLoading } = useEncountersCRED(patientUuid);

  const entries: CredEntry[] = useMemo(() => {
    return (encounters || []).map((encounter) => {
      const obs = encounter.obs || [];
      const numberObs = obs.find((o) => o.concept?.display?.includes('Número de control'));
      const typeObs = obs.find((o) => o.concept?.display?.includes('complementario'));

      return {
        id: encounter.uuid,
        number: parseInt(String(numberObs?.value ?? '0'), 10),
        date: encounter.encounterDatetime,
        type: typeObs?.value === true ? 'complementary' : 'regular',
        createdByCurrentUser: encounter?.creator?.uuid === encounter?.provider?.uuid, // crude check
      };
    });
  }, [encounters]);

  const getAgeInDays = (date: string) => dayjs().diff(dayjs(date), 'days');
  const getAgeInMonths = (date: string) => dayjs().diff(dayjs(date), 'months');

  const getGroupForEntry = (entry: CredEntry) => {
    const ageInDays = getAgeInDays(entry.date);
    const ageInMonths = getAgeInMonths(entry.date);

    return ageGroupsCRED.find((group) => {
      const inDayRange =
        group.minDays !== undefined &&
        group.maxDays !== undefined &&
        ageInDays >= group.minDays &&
        ageInDays <= group.maxDays;

      const inMonthRange =
        group.minMonths !== undefined &&
        group.maxMonths !== undefined &&
        ageInMonths >= group.minMonths &&
        ageInMonths <= group.maxMonths;

      return inDayRange || inMonthRange;
    });
  };

  const groupedEntries: Record<string, CredEntry[]> = {};

  ageGroupsCRED.forEach((group) => {
    const key = group.label + (group.sublabel || '');
    groupedEntries[key] = [];
  });

  entries.forEach((entry) => {
    const group = getGroupForEntry(entry);
    if (group) {
      const key = group.label + (group.sublabel || '');
      groupedEntries[key]?.push(entry);
    }
  });

  if (isLoading) return <div>Cargando controles CRED...</div>;

  return (
    <div className={styles.matrixWrapper}>
      <Table size="sm" useZebraStyles>
        <TableHead>
          <TableRow>
            {ageGroupsCRED.map((group) => (
              <TableHeader key={group.label + (group.sublabel || '')}>
                {group.label}
                {group.sublabel && <div className={styles.sublabel}>{group.sublabel}</div>}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {ageGroupsCRED.map((group) => {
              const key = group.label + (group.sublabel || '');
              return (
                <TableCell key={key} className={styles.cellContent}>
                  {groupedEntries[key].map((entry) => (
                    <Tile key={entry.id} className={styles.credTile}>
                      <div className={styles.entryInfo}>
                        <strong>{`CRED Nº ${entry.number}`}</strong>
                        <br />
                        {dayjs(entry.date).format('DD-MM-YYYY')}
                      </div>
                      {entry.createdByCurrentUser && (
                        <Button
                          kind="ghost"
                          size="sm"
                          hasIconOnly
                          iconDescription="Eliminar"
                          onClick={() => onDelete(entry.id)}
                          renderIcon={TrashCan}
                          tooltipAlignment="center"
                          tooltipPosition="bottom"
                        />
                      )}
                    </Tile>
                  ))}
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default CredControlsMatrix;
