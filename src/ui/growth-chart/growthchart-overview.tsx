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
import { Printer } from '@carbon/react/icons';

import { chartData } from './data-sets/WhoStandardDataSets/ChartData';
import { useAppropriateChartData } from './hooks/useAppropriateChartData';
import { useChartDataForGender } from './hooks/useChartDataForGender';
import { usePatientBirthdateAndGender } from './hooks/usePatientBirthdateAndGender';
import { useVitalsAndBiometrics } from './hooks/useVitalsAndBiometrics';
import { calculateMinMaxValues } from './utils/calculateMinMaxValues';

import { ChartSelector } from './growth-chart-builder/chartSelector';
import { GrowthChartBuilder } from './growth-chart-builder/growthChartBuilder';

import type { ChartData, MeasurementData } from './config-schema';
import styles from './growthchart-overview.scss';

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

const GrowthChartOverview: React.FC<GrowthChartProps> = ({ patientUuid, config }) => {
  const { t } = useTranslation();
  const headerTitle = t('growthChart', 'Growth Chart');
  const displayText = t('noChartDataAvailable', 'No chart data available');

  // --- Datos del paciente ---
  const { gender: rawGender, birthdate, isLoading, error } = usePatientBirthdateAndGender(patientUuid);
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
  const { data: rawObservations = [], isLoading: isValidating } = useVitalsAndBiometrics(patientUuid, 'both');
  const observations: MeasurementData[] = useMemo(
    () => rawObservations.map((obs) => ({ ...obs, eventDate: new Date(obs.eventDate) })),
    [rawObservations],
  );

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
      launchWorkspace('newborn-anthropometric-form', { patientUuid });
    }
  }, [currentVisit, patientUuid]);

  // --- Estados de carga/error/datos vacíos ---
  if (isLoading) return <DataTableSkeleton role="progressbar" zebra={false} />;
  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;
  if (!selectedDataset || !dataSetEntry || !dataSetValues.length) {
    return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchForm} />;
  }

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        {isValidating && (
          <div className={styles.backgroundDataFetchingIndicator}>
            <InlineLoading description={t('updating', 'Updating...')} />
          </div>
        )}
        <div className={styles.chartHeaderActionItems}>
          <Button
            kind="ghost"
            renderIcon={Printer}
            iconDescription={t('print', 'Print')}
            className={styles.printButton}
            onClick={() => window.print()}
          >
            {t('print', 'Print')}
          </Button>
        </div>
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
          <GrowthChartBuilder
            measurementData={observations}
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
};

export default GrowthChartOverview;
