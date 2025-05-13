import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { differenceInMonths, differenceInWeeks } from 'date-fns';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  useVisitOrOfflineVisit,
  launchStartVisitPrompt,
} from '@openmrs/esm-patient-common-lib';
import { launchWorkspace } from '@openmrs/esm-framework';

import { Button, DataTableSkeleton, InlineLoading } from '@carbon/react';
import { Add } from '@carbon/react/icons';

import { chartData } from './data-sets/WhoStandardDataSets/ChartData';
import { useAppropriateChartData } from './hooks/useAppropriateChartData';
import { useChartDataForGender } from './hooks/useChartDataForGender';
import { usePatientBirthdateAndGender } from './hooks/usePatientBirthdateAndGender';
import { useBiometrics } from './hooks/useBiometrics';

import { ChartSelector } from './growth-chart-builder/chart-selector';
import { GrowthChart } from './growth-chart-builder/growth-chart';

import type { ChartData } from './types';
import styles from './growth-chart-overview.scss';

interface GrowthChartProps {
  patientUuid: string;
  config: ChartData;
}

const DEFAULT_METADATA = {
  chartLabel: '',
  yAxisLabel: '',
  xAxisLabel: '',
  range: { start: 0, end: 0 },
};

export function calculateMinMaxValues(datasetValues: Array<Record<string, unknown>>) {
  // Verificar si no hay datos o el array está vacío
  if (!datasetValues || datasetValues.length === 0) {
    return { min: 0, max: 0 };
  }

  // Aplanar y filtrar valores numéricos válidos
  const flatValues: number[] = datasetValues.flatMap((entry) =>
    Object.values(entry).filter((value): value is number => {
      return typeof value === 'number' && Number.isFinite(value);
    }),
  );

  // Verificar si no quedaron valores válidos después del filtrado
  if (flatValues.length === 0) {
    return { min: 0, max: 0 };
  }

  // Calcular min y max de manera segura para grandes datasets
  const min = flatValues.reduce((acc, val) => Math.min(acc, val), Infinity);
  const max = flatValues.reduce((acc, val) => Math.max(acc, val), -Infinity);

  return { min, max };
}

const GrowthChartOverview: React.FC<GrowthChartProps> = ({ patientUuid, config }) => {
  const { t } = useTranslation();
  const headerTitle = t('growthChart', 'Growth Chart');
  const displayText = t('noChartDataAvailable', 'No chart data available');
  const formWorkspace = 'newborn-anthropometric-form';
  // --- Datos del paciente ---
  const {
    gender: rawGender,
    birthdate,
    isLoading: isLoadingBirthdateAndGender,
    error,
  } = usePatientBirthdateAndGender(patientUuid);
  const [gender, setGender] = useState('');
  useEffect(() => {
    if (typeof rawGender === 'string') {
      setGender(rawGender.toUpperCase());
    }
  }, [rawGender]);

  const dateOfBirth = useMemo(() => new Date(birthdate ?? new Date()), [birthdate]);
  const childAgeInWeeks = useMemo(() => differenceInWeeks(new Date(), dateOfBirth), [dateOfBirth]);
  const childAgeInMonths = useMemo(() => differenceInMonths(new Date(), dateOfBirth), [dateOfBirth]);

  // --- Datos base del gráfico según género ---
  const { chartDataForGender } = useChartDataForGender({ gender, chartData: chartData || {} });
  const defaultIndicator = useMemo(() => Object.keys(chartDataForGender)[0] ?? '', [chartDataForGender]);

  const { selectedCategory, selectedDataset, setSelectedCategory, setSelectedDataset } = useAppropriateChartData(
    chartDataForGender,
    defaultIndicator,
    gender,
    childAgeInWeeks,
    childAgeInMonths,
  );

  // --- Observaciones del paciente ---
  const { data, isLoading: isLoadingBiometrics } = useBiometrics(patientUuid);

  // --- Dataset y rangos ---
  const dataSetEntry = chartDataForGender[selectedCategory]?.datasets?.[selectedDataset];
  const isPercentiles = true;
  const dataSetValues = useMemo(
    () => (isPercentiles ? (dataSetEntry?.percentileDatasetValues ?? []) : (dataSetEntry?.zScoreDatasetValues ?? [])),
    [dataSetEntry, isPercentiles],
  );

  const { min = 0, max = 100 } = calculateMinMaxValues(dataSetValues);
  const yAxisRange = {
    minDataValue: Math.max(0, Math.floor(min)),
    maxDataValue: Math.ceil(max),
  };

  // --- Acciones y estado de visita ---
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchForm = useCallback(() => {
    if (!currentVisit) {
      launchStartVisitPrompt();
    } else {
      launchWorkspace(formWorkspace, { patientUuid });
    }
  }, [currentVisit, patientUuid]);

  // --- Estados de carga/error/datos vacíos ---
  if (isLoadingBirthdateAndGender && !data) {
    return <DataTableSkeleton role="progressbar" aria-label={t('loadingData', 'Loading data')} />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (data && data.length > 0) {
    return (
      <div className={styles.widgetCard} role="region" aria-label={headerTitle}>
        <CardHeader title={headerTitle}>
          {isLoadingBirthdateAndGender && (
            <InlineLoading description={t('refreshing', 'Refreshing...')} status="active" />
          )}
          {launchForm && (
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              onClick={launchForm}
              aria-label={t('add')}
            >
              {t('add')}
            </Button>
          )}
        </CardHeader>

        <div className="p-4">
          <div className="flex justify-between px-4">
            <ChartSelector
              category={selectedCategory}
              dataset={selectedDataset}
              setCategory={setSelectedCategory}
              setDataset={setSelectedDataset}
              chartData={chartDataForGender}
              isDisabled={!!gender}
              gender={gender}
              setGender={setGender}
            />
            <GrowthChart
              measurementData={data}
              datasetValues={dataSetValues}
              datasetMetadata={dataSetEntry?.metadata ?? DEFAULT_METADATA}
              yAxisValues={yAxisRange}
              keysDataSet={Object.keys(dataSetValues[0] ?? {})}
              dateOfBirth={dateOfBirth}
              category={selectedCategory}
              dataset={selectedDataset}
              isPercentiles={isPercentiles}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <EmptyState
      displayText={displayText}
      headerTitle={headerTitle}
      launchForm={formWorkspace || launchForm ? launchForm : undefined}
    />
  );
};

export default GrowthChartOverview;
