import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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

import { usePatientBirthdateAndGender } from './hooks/usePatientBirthdateAndGender';
import { useBiometrics } from './hooks/useBiometrics';
import GrowthChart from './growth-chart';

import styles from './growth-chart-overview.scss';

interface GrowthChartProps {
  patientUuid: string;
}

const GrowthChartOverview: React.FC<GrowthChartProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('growthChart', 'Growth Chart');
  const displayText = t('noChartDataAvailable', 'No chart data available');
  const formWorkspace = 'newborn-anthropometric-form';
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchForm = useCallback(() => {
    if (!currentVisit) {
      launchStartVisitPrompt();
    } else {
      launchWorkspace(formWorkspace, { patientUuid });
    }
  }, [currentVisit, patientUuid]);

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

  const { data, isLoading: isLoadingBiometrics } = useBiometrics(patientUuid);

  if (isLoadingBirthdateAndGender || (isLoadingBiometrics && !data)) {
    return <DataTableSkeleton role="progressbar" aria-label={t('loadingData', 'Loading data')} />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (data.length > 0) {
    return (
      <div className={styles.widgetCard} role="region" aria-label={headerTitle}>
        <CardHeader title={headerTitle}>
          {(isLoadingBirthdateAndGender || isLoadingBiometrics) && (
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

        <GrowthChart measurementData={data} dateOfBirth={dateOfBirth} gender={gender} setGender={setGender} />
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
