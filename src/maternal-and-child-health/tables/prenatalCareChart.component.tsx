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
import { usePrenatalCare } from '../../hooks/usePrenatalCare';
import styles from './prenatalCareChart.scss';
import dayjs from 'dayjs';
import type { ConfigObject } from '../../config-schema';

interface ProgramsDetailedSummaryProps {
  patientUuid: string;
}

// Define the structure for our row data
interface RowData {
  id: string;
  rowHeader: string;
  [key: string]: any; // For dynamic column keys like atencion1, atencion2, etc.
}

const PrenatalCareChart: React.FC<ProgramsDetailedSummaryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const headerTitle = t('Cuidado prenatal', 'Cuidado prenatal');
  const config = useConfig() as ConfigObject;
  const { prenatalEncounters, error, isValidating, mutate } = usePrenatalCare(patientUuid);

  const formAntenatalUuid = config.formsList.prenatalCare;

  const handleAddPrenatalAttention = () => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: t('Nueva Atención Prenatal', 'Nueva Atención Prenatal'),
      formInfo: {
        encounterUuid: '',
        formUuid: formAntenatalUuid,
        additionalProps: {},
      },
    });
  };

  // Define all possible row types based on the group members we've seen
  const allPossibleRows = useMemo(
    () => [
      { id: 'fecha', rowHeader: t('fechaYHoraAtencion', 'Fecha y hora atención'), prefix: 'encounterDatetime' },
      {
        id: 'edadGestacional',
        rowHeader: t('edadGestacional', 'Edad Gestacional (semanas)'),
        prefix: 'Duración de la gestación',
      },
      { id: 'pesoMadre', rowHeader: t('pesoMadre', 'Peso Madre(kg)'), prefix: 'Peso Corporal' },
      { id: 'alturaUterina', rowHeader: t('alturaUterina', 'Altura Uterina (cm)'), prefix: 'Altura del fondo uterino' },
      { id: 'situacion', rowHeader: t('situación', 'Situación (L,T,NA)'), prefix: 'Situación fetal' },
      { id: 'presentacion', rowHeader: t('presentación', 'Presentación (C/P/NA)'), prefix: 'Presentación Fetal' },
      { id: 'posicion', rowHeader: t('posición', 'Posición (O/I/NA)'), prefix: 'Posición fetal' },
      {
        id: 'frecuenciaCardiacaFetal',
        rowHeader: t('frecuenciaCardiacaFetal', 'Frecuencia cardiaca fetal (por min.)'),
        prefix: 'Frecuencia Cardíaca fetal',
      },
      { id: 'movimientoFetal', rowHeader: t('movimientoFetal', 'Movimiento fetal'), prefix: 'Movimiento fetal' },
      { id: 'imc', rowHeader: t('imc', 'IMC - índice de masa corporal'), prefix: 'IMC - índice de masa corporal' },
      { id: 'planParto', rowHeader: t('planParto', 'Plan de Parto'), prefix: 'Plan de Parto' },
      { id: 'presionSistolica', rowHeader: t('presionSistolica', 'Presión sistólica'), prefix: 'Presión sistólica' },
      {
        id: 'presionDiastolica',
        rowHeader: t('presionDiastolica', 'Presión diastólica'),
        prefix: 'Presión diastólica',
      },
      {
        id: 'proteinuriaGestacional',
        rowHeader: t('proteinuriaGestacional', 'Proteinuria gestacional'),
        prefix: 'proteinuria gestacional',
      },
      {
        id: 'frecuenciaCardiaca',
        rowHeader: t('frecuenciaCardiaca', 'Frecuencia Cardíaca'),
        prefix: 'Frecuencia Cardíaca',
      },
      { id: 'edemaGestacional', rowHeader: t('edemaGestacional', 'Edema gestacional'), prefix: 'edema gestacional' },
      {
        id: 'indicacionFierro',
        rowHeader: t('indicacionFierro', 'Indicación Fierro/Acido Fólico'),
        prefix: 'Indicación Fierro/Acido Fólico',
      },
      { id: 'temperatura', rowHeader: t('temperatura', 'Temperatura (C°)'), prefix: 'Temperatura (C°)' },
      {
        id: 'orientacion',
        rowHeader: t('orientacion', 'Orientación y consejería'),
        prefix: 'Orientación y consejería',
      },
      { id: 'proximaCita', rowHeader: t('proximaCita', 'Próxima cita'), prefix: 'Próxima cita' },
      { id: 'ecografia', rowHeader: t('ecografia', 'Ecografía de obstetricia'), prefix: 'Ecografía de obstetricia' },
      {
        id: 'indicacionAcidoFolico',
        rowHeader: t('indicacionAcidoFolico', 'Indicación Acido Fólico'),
        prefix: 'Indicación Acido Fólico',
      },
      {
        id: 'visitaDomiciliaria',
        rowHeader: t('visitaDomiciliaria', 'Visita domiciliaria'),
        prefix: 'Visita domiciliaria',
      },
      {
        id: 'edadGestacionalEcografia',
        rowHeader: t('edadGestacionalEcografia', 'Edad gestacional en semanas según ecografía'),
        prefix: 'Edad gestacional en semanas según ecografía',
      },
      { id: 'perfilBiofisico', rowHeader: t('perfilBiofisico', 'Perfil Biofísico'), prefix: 'Perfil Biofísico' },
      { id: 'gananciaPeso', rowHeader: t('gananciaPeso', 'Ganancia de peso'), prefix: 'Ganancia de peso' },
      { id: 'indicacionCalcio', rowHeader: t('indicacionCalcio', 'Indicación Calcio'), prefix: 'Indicación Calcio' },
      { id: 'examenPezon', rowHeader: t('examenPezon', 'Examen de pezón'), prefix: 'Examen de pezón' },
      {
        id: 'reflejoOsteotendinoso',
        rowHeader: t('reflejoOsteotendinoso', 'Reflejo osteotendinoso'),
        prefix: 'Reflejo osteotendinoso',
      },
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
    if (!prenatalEncounters || prenatalEncounters.length === 0) return 9;

    let maxNumber = 0;
    prenatalEncounters.forEach((encounter) => {
      encounter.obs.forEach((obs) => {
        if (obs.groupMembers) {
          obs.groupMembers.forEach((member) => {
            const match = member.display.match(/Número de atención prenatal: Atención prenatal (\d+)/);
            if (match) {
              const encounterNumber = Number.parseInt(match[1], 10);
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
          const match = obs.display.match(/Número de atención prenatal: Atención prenatal (\d+)/);
          if (match) {
            const encounterNumber = Number.parseInt(match[1], 10);
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
    return Math.max(maxNumber + 1, 9);
  }, [prenatalEncounters]);

  // Generate table headers dynamically
  const tableHeaders = useMemo(() => {
    return [
      { key: 'rowHeader', header: t('AtencionesPrenatales', 'Atenciones Prenatales') },
      ...Array.from({ length: maxEncounters }, (_, i) => ({
        key: `atencion${i + 1}`,
        header: t(`atencion${i + 1}`, `Atención ${i + 1}`),
      })),
    ];
  }, [t, maxEncounters]);

  // Generate table rows with data from encounters
  const tableRows = useMemo(() => {
    // Start with the active rows and initialize all cells with "--"
    const rowDataTemplate: RowData[] = activeRows.map((row) => ({
      id: row.id,
      rowHeader: row.rowHeader,
      ...Array.from({ length: maxEncounters }, (_, i) => ({ [`atencion${i + 1}`]: '--' })).reduce(
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
            displayText={t('noDataAvailableDescription', 'No data available')}
            launchForm={handleAddPrenatalAttention}
          />
        )}
      </div>
    </div>
  );
};

export default PrenatalCareChart;
