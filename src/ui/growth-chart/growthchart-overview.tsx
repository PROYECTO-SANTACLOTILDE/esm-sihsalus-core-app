import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { differenceInMonths, differenceInWeeks } from 'date-fns';

import { Button, DataTableSkeleton, InlineLoading } from '@carbon/react';
import { Printer } from '@carbon/react/icons';

import { chartData } from './DataSets/WhoStandardDataSets/ChartData';
import type { ChartData, MeasurementData } from './chartDataTypes';
import { useAppropriateChartData, useCalculateMinMaxValues } from './hooks/Calculations';
import { useChartDataForGender, useVitalsAndBiometrics, usePatientBirthdateAndGender } from './hooks/DataFetching';
import { CardHeader, EmptyState, ErrorState, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import { launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import { ChartSelector } from './growth-chart-selector/chartSelector';
import { GrowthChartBuilder } from './growth-chart-builder/growthChartBuilder';

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

  const [genderParse, setGenderParser] = useState('');

  const { gender: rawGender, birthdate, isLoading, error } = usePatientBirthdateAndGender(patientUuid);

  useEffect(() => {
    if (typeof rawGender === 'string') {
      setGenderParser(rawGender.toUpperCase());
    }
  }, [rawGender]);

  const { chartDataForGender } = useChartDataForGender({
    gender: genderParse,
    chartData: chartData || {},
  });

  const { data: rawObservations = [], isLoading: isValidating } = useVitalsAndBiometrics(patientUuid, 'both');

  const observations: MeasurementData[] = useMemo(
    () =>
      rawObservations.map((obs) => ({
        ...obs,
        eventDate: new Date(obs.eventDate).toISOString(),
      })),
    [rawObservations],
  );

  const dateOfBirth = useMemo(() => new Date(birthdate ?? new Date()), [birthdate]);
  const childAgeInWeeks = useMemo(() => differenceInWeeks(new Date(), dateOfBirth), [dateOfBirth]);
  const childAgeInMonths = useMemo(() => differenceInMonths(new Date(), dateOfBirth), [dateOfBirth]);

  const defaultIndicator = Object.keys(chartDataForGender)[0] ?? '';
  const isPercentiles = true;

  const { selectedCategory, selectedDataset, setSelectedCategory, setSelectedDataset } = useAppropriateChartData(
    chartDataForGender,
    defaultIndicator,
    genderParse,
    childAgeInWeeks,
    childAgeInMonths,
  );

  const dataSetEntry = chartDataForGender[selectedCategory]?.datasets?.[selectedDataset];
  const dataSetValues = isPercentiles
    ? (dataSetEntry?.percentileDatasetValues ?? [])
    : (dataSetEntry?.zScoreDatasetValues ?? []);

  const { min = 0, max = 100 } = useCalculateMinMaxValues(dataSetValues);
  const minDataValue = Math.max(0, Math.floor(min));
  const maxDataValue = Math.ceil(max);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchForm = useCallback(() => {
    if (!currentVisit) {
      launchStartVisitPrompt();
    } else {
      launchWorkspace('newborn-anthropometric-form', { patientUuid });
    }
  }, [currentVisit, patientUuid]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" zebra={false} />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

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
            isDisabled={!!genderParse}
            gender={genderParse}
            setGender={setGenderParser}
          />

          <GrowthChartBuilder
            measurementData={observations}
            datasetValues={dataSetValues}
            datasetMetadata={dataSetEntry?.metadata ?? DEFAULT_METADATA}
            yAxisValues={{ minDataValue, maxDataValue }}
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
