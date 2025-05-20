import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  InlineLoading,
} from '@carbon/react';
import { launchPatientWorkspace, CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import styles from './postnatalCareChart.scss';
import dayjs from 'dayjs';
import { useInmmediatePostpartumPeriod } from '../../../hooks/useInmmediatePostpartum';
import type { ConfigObject } from '../../../config-schema';

interface ProgramsDetailedSummaryProps {
  patientUuid: string;
}
interface RowData {
  id: string;
  rowHeader: string;
  [key: string]: any; // For dynamic column keys like atencion1, atencion2, etc.
}

const ImmediatePostpartumTable: React.FC<ProgramsDetailedSummaryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const headerTitle = t('puerperioInmediato', 'Puerperio Inmediato');
  const config = useConfig() as ConfigObject;
  const { prenatalEncounters, error, isValidating, mutate } = useInmmediatePostpartumPeriod(patientUuid);

  const formPrenatalUuid = config.formsList.immediatePostpartumPeriod;

  const handleAddPrenatalAttention = () => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: t('Nueva Atención Postnatal', 'Nueva Atención Postnatal'),
      formInfo: {
        encounterUuid: '',
        formUuid: formPrenatalUuid,
        additionalProps: {},
      },
    });
  };

  // Define all possible row types based on the group members we've seen
  const allPossibleRows = useMemo(
    () => [
      { id: 'fecha', rowHeader: t('fechaYHoraAtencion', 'Fecha y hora atención'), prefix: 'encounterDatetime' },
      {
        id: 'temperatura',
        rowHeader: t('temperatura', 'Temperatura (C°)'),
        prefix: 'Temperatura (C°)',
      },
      {
        id: 'frecuenciaCardíaca',
        rowHeader: t('frecuenciaCardíaca', 'Frecuencia Cardíaca'),
        prefix: 'Frecuencia Cardíaca',
      },
      { id: 'presiónSistólica', rowHeader: t('presionSistolica', 'Presión sistólica'), prefix: 'Presión sistólica' },
      {
        id: 'presionDiastólica',
        rowHeader: t('presionDiastolica', 'Presión diastólica'),
        prefix: 'Presión diastólica',
      },
      {
        id: 'involuciónUterina',
        rowHeader: t('involuciónUterina', 'Involución Uterina'),
        prefix: 'Involución Uterina',
      },
      {
        id: 'característicaLoquios',
        rowHeader: t('característicaLoquios', 'Característica Loquios'),
        prefix: 'Característica Loquios',
      },
      {
        id: 'heridaOperatoria',
        rowHeader: t('heridaOperatoria', 'Herida Operatoria'),
        prefix: 'Herida Operatoria',
      },
      { id: 'observación', rowHeader: t('observation', 'Observación'), prefix: 'Observación' },
    ],
    [t],
  );

  // Determine which rows to display based on the data we have
  const activeRows = useMemo(() => {
    if (!prenatalEncounters || prenatalEncounters.length === 0) {
      // If no data, return a subset of important rows
      return allPossibleRows.slice(0, 9);
    }

    // Track which row types we've seen in the data
    const seenPrefixes = new Set<string>();

    // Add the date row which is always present
    seenPrefixes.add('encounterDatetime');

    // Check all encounters and their observations
    prenatalEncounters.forEach((encounter) => {
      encounter.obs.forEach((obs) => {
        if (obs.groupMembers && obs.groupMembers.length > 0) {
          obs.groupMembers.forEach((member) => {
            // For each group member, check if it matches any of our row prefixes
            allPossibleRows.forEach((row) => {
              if (member.display.startsWith(row.prefix)) {
                seenPrefixes.add(row.prefix);
              }
            });
          });
        }
      });
    });

    // Return only the rows that have data
    return allPossibleRows.filter((row) => seenPrefixes.has(row.prefix));
  }, [prenatalEncounters, allPossibleRows]);

  // Determine the number of columns based on the number of encounters
  const maxEncounters = useMemo(() => {
    // Get the maximum encounter number or default to 9 if not found
    if (!prenatalEncounters || prenatalEncounters.length === 0) return 8;

    let maxNumber = 0;
    prenatalEncounters.forEach((encounter) => {
      encounter.obs.forEach((obs) => {
        if (obs.groupMembers) {
          obs.groupMembers.forEach((member) => {
            const match = member.display.match(/Número de atención puerperio: Atención puerperio (\d+)/);
            if (match) {
              const encounterNumber = Number.parseInt(match[1], 9);
              if (encounterNumber > maxNumber) {
                maxNumber = encounterNumber;
              }
            }
          });
        }
      });
    });

    // If we still haven't found a number, check the obs display
    if (maxNumber === 0) {
      prenatalEncounters.forEach((encounter) => {
        encounter.obs.forEach((obs) => {
          const match = obs.display.match(/Número de atención puerperio: Atención puerperio (\d+)/);
          if (match) {
            const encounterNumber = Number.parseInt(match[1], 9);
            if (encounterNumber > maxNumber) {
              maxNumber = encounterNumber;
            }
          }
        });
      });
    }

    // If we still haven't found a number, use the length of encounters
    if (maxNumber === 0) {
      maxNumber = prenatalEncounters.length;
    }

    // Return at least 9 columns or more if needed
    return Math.max(maxNumber + 1, 8);
  }, [prenatalEncounters]);

  // Generate table headers dynamically
  const tableHeaders = useMemo(() => {
    const attentionIntervals = [15, 30, 45, 60, 75, 90, 105, 120];
    const formatTime = (minutes: number) =>
      minutes < 60 ? `${minutes}'` : `${Math.floor(minutes / 60)}h ${minutes % 60 ? `${minutes % 60}'` : ''}`;
    return [
      { key: 'rowHeader', header: t('AtencionesPuerperio', 'Atenciones Puerperio') },
      ...Array.from({ length: maxEncounters }, (_, i) => ({
        key: `atencion${i + 1}`,
        header: (
          <>
            <div>{t(`atencion${i + 1}`, `Atención ${i + 1}`)}</div>
            <div style={{ fontSize: '0.8em', color: 'gray', textAlign: 'center' }}>
              {formatTime(attentionIntervals[i])}
            </div>
          </>
        ),
      })),
    ];
  }, [t, maxEncounters]);

  // Generate table rows with data from encounters
  const tableRows = useMemo(() => {
    // Start with the active rows and initialize all cells with "--"
    const rowDataTemplate: RowData[] = activeRows.map((row) => ({
      id: row.id,
      rowHeader: row.rowHeader,
      ...Array.from({ length: maxEncounters }, (_, i) => ({ [`atencion${i + 1} `]: '--' })).reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {},
      ),
    }));

    // Helper function to extract value after colon
    const extractValue = (display: string): string => {
      const parts = display.split(': ');
      return parts.length > 1 ? parts[1] : display;
    };

    // Process each encounter
    if (prenatalEncounters && prenatalEncounters.length > 0) {
      prenatalEncounters.forEach((encounter, index) => {
        let encounterNumber: number | null = null;

        // Find the encounter number from group members
        encounter.obs.forEach((obs) => {
          if (obs.groupMembers) {
            obs.groupMembers.forEach((member) => {
              if (member.display.includes('Número de atención prenatal')) {
                const match = member.display.match(/Atención prenatal (\d+)/);
                if (match) {
                  encounterNumber = Number.parseInt(match[1], 10);
                }
              }
            });
          }
        });

        // If no encounter number found in group members, try the obs display
        if (!encounterNumber) {
          encounter.obs.forEach((obs) => {
            const match = obs.display.match(/Número de atención prenatal: Atención prenatal (\d+)/);
            if (match) {
              encounterNumber = Number.parseInt(match[1], 10);
            }
          });
        }

        // If still no encounter number, use the index+1
        if (!encounterNumber) {
          encounterNumber = index + 1;
        }

        // If encounter number is found and within range
        if (encounterNumber && encounterNumber <= maxEncounters) {
          // Set date and time
          const fechaRow = rowDataTemplate.find((row) => row.id === 'fecha');
          if (fechaRow) {
            fechaRow[`atencion${encounterNumber}`] = dayjs(encounter.encounterDatetime).format('DD/MM/YYYY HH:mm:ss');
          }

          // Process each observation and its group members
          encounter.obs.forEach((obs) => {
            if (obs.groupMembers && obs.groupMembers.length > 0) {
              // Process each group member
              obs.groupMembers.forEach((member) => {
                // Find which row this group member belongs to
                activeRows.forEach((row) => {
                  if (member.display.startsWith(row.prefix)) {
                    const tableRow = rowDataTemplate.find((r) => r.id === row.id);
                    if (tableRow) {
                      tableRow[`atencion${encounterNumber}`] = extractValue(member.display);
                    }
                  }
                });
              });
            }
          });
        }
      });
    }

    return rowDataTemplate;
  }, [prenatalEncounters, activeRows, maxEncounters]);

  return (
    <div>
      <div className={styles.widgetCard}>
        {prenatalEncounters?.length > 0 ? (
          <>
            <CardHeader title={headerTitle}>
              {isValidating && <InlineLoading />}
              <Button onClick={handleAddPrenatalAttention} kind="ghost">
                {t('add', 'Añadir')}
              </Button>
            </CardHeader>
            <DataTable rows={tableRows} headers={tableHeaders} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
              {({ rows, headers, getHeaderProps, getTableProps }) => (
                <TableContainer style={{ width: '100%' }}>
                  <Table aria-label="Tabla de cuidado prenatal" {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader
                            key={header.key}
                            className={classNames(styles.productiveHeading01, styles.text02)}
                            {...getHeaderProps({ header, isSortable: header.isSortable })}
                          >
                            {header.header?.content ?? header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          </>
        ) : (
          <EmptyState
            headerTitle={headerTitle}
            displayText={t('puerperioInmediato', 'Puerperio Inmediato')}
            launchForm={handleAddPrenatalAttention}
          />
        )}
      </div>
    </div>
  );
};

export default ImmediatePostpartumTable;
