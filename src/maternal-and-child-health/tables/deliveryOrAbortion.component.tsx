import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import styles from './prenatalCareChart.scss';
import { InlineNotification } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import type { ConfigObject } from '../../config-schema';
import { useDeliveryOrAbortion } from '../../hooks/useDeliveryOrAbortion';

interface FormDetailedSummaryProps {
  patientUuid: string;
}

const DeliberyOrAbortionTable: React.FC<FormDetailedSummaryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const { prenatalEncounter, error, isValidating, mutate } = useDeliveryOrAbortion(patientUuid);

  const config = useConfig() as ConfigObject;

  const formAntenatalUuid = config.formsList.deliveryOrAbortion;

  const handleAddPrenatalAttention = useCallback(() => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: t('deliveryOrAbortion', 'Parto o aborto'),
      formInfo: {
        encounterUuid: '',
        formUuid: formAntenatalUuid,
        additionalProps: {},
      },
    });
  }, [t, formAntenatalUuid]);

  // Define table headers
  const tableHeaders = useMemo(
    () => [
      {
        header: t('category', 'Categoría'),
        key: 'category',
      },
      {
        header: t('value', 'Valor'),
        key: 'value',
      },
    ],
    [t],
  );

  // Function to parse the display string and extract the value
  const parseDisplayString = useCallback((display: string) => {
    const parts = display.split(': ');
    if (parts.length > 1) {
      return {
        category: parts[0],
        value: parts.slice(1).join(': '),
      };
    }
    return {
      category: display,
      value: '',
    };
  }, []);

  // Transform observation group members into table rows
  const createRowsFromGroupMembers = useCallback(
    (groupMembers) => {
      if (!groupMembers || !groupMembers.length) return [];

      return groupMembers.map((member, index) => {
        const { category, value } = parseDisplayString(member.display);
        return {
          id: `row-${member.uuid || index}`,
          category: { content: category },
          value: { content: value },
        };
      });
    },
    [parseDisplayString],
  );

  // Create tables for each observation group
  const observationTables = useMemo(() => {
    if (!prenatalEncounter || !prenatalEncounter.obs) return [];

    return prenatalEncounter.obs.map((obs) => {
      const title = parseDisplayString(obs.display).category;
      const rows = createRowsFromGroupMembers(obs.groupMembers);
      return { title, rows };
    });
  }, [prenatalEncounter, parseDisplayString, createRowsFromGroupMembers]);

  const renderTable = useCallback(
    (title, rows) => {
      return (
        <div className={styles.widgetCard} style={{ marginBottom: '20px' }} key={`table-${title}`}>
          {rows?.length > 0 ? (
            <>
              <CardHeader title={title}>{isValidating && <InlineLoading />}</CardHeader>

              <DataTable rows={rows} headers={tableHeaders} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
                {({ rows, headers, getHeaderProps, getTableProps }) => (
                  <TableContainer style={{ width: '100%' }}>
                    <Table aria-label={`Tabla de ${title}`} {...getTableProps()}>
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
              headerTitle={title}
              displayText={t('noDataAvailableDescription', 'No data available')}
              launchForm={handleAddPrenatalAttention}
            />
          )}
        </div>
      );
    },
    [tableHeaders, isTablet, isValidating, t, handleAddPrenatalAttention],
  );

  if (error) {
    return <div>{t('error', 'Error loading maternal history data')}</div>;
  }

  if (isValidating && !prenatalEncounter) {
    return <InlineLoading description={t('loading', 'Loading...')} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <Button onClick={handleAddPrenatalAttention} kind="ghost">
          {t('edit', 'Editar')}
        </Button>
      </div>

      {prenatalEncounter ? (
        observationTables.map(({ title, rows }) => renderTable(title, rows))
      ) : (
        <EmptyState
          headerTitle={t('deliveryOrAbortion', 'Parto o aborto')}
          displayText={t('noDataAvailableDescription', 'No data available')}
          launchForm={handleAddPrenatalAttention}
        />
      )}
    </div>
  );
};

export default DeliberyOrAbortionTable;
