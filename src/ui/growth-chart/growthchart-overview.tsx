import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton, InlineLoading } from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { CardHeader, EmptyState, ErrorState, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import { launchWorkspace } from '@openmrs/esm-framework';

import { ChartSelector } from './growth-chart-builder/chartSelector';
import { GrowthChartBuilder } from './growth-chart-builder/growthChartBuilder';
import { useGrowthChartLogic } from './hooks/useGrowthChartLogic';
import styles from './growthchart-overview.scss';
import type { ChartData } from './config-schema';

interface GrowthChartProps {
  patientUuid: string;
  config: ChartData;
}

const GrowthChartOverview: React.FC<GrowthChartProps> = ({ patientUuid, config }) => {
  const { t } = useTranslation();
  const headerTitle = t('growthChart', 'Growth Chart');
  const displayText = t('noChartDataAvailable', 'No chart data available');

  const {
    gender,
    setGender,
    isLoading,
    error,
    isValidating,
    observations,
    dateOfBirth,
    selectedCategory,
    selectedDataset,
    setSelectedCategory,
    setSelectedDataset,
    dataSetEntry,
    dataSetValues,
    yAxisRange,
  } = useGrowthChartLogic(patientUuid, config);

  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchForm = useCallback(() => {
    if (!currentVisit) launchStartVisitPrompt();
    else launchWorkspace('newborn-anthropometric-form', { patientUuid });
  }, [currentVisit, patientUuid]);

  if (isLoading) return <DataTableSkeleton role="progressbar" zebra={false} />;
  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;
  if (!selectedDataset || !dataSetEntry || !dataSetValues.length)
    return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchForm} />;

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
            chartData={config}
            isDisabled={!!gender}
            gender={gender}
            setGender={setGender}
          />
          <GrowthChartBuilder
            measurementData={observations}
            datasetValues={dataSetValues}
            datasetMetadata={dataSetEntry?.metadata}
            yAxisValues={yAxisRange}
            keysDataSet={Object.keys(dataSetValues[0] ?? {})}
            dateOfBirth={dateOfBirth}
            category={selectedCategory}
            dataset={selectedDataset}
            isPercentiles={true}
          />
        </div>
      </div>
    </div>
  );
};

export default GrowthChartOverview;
