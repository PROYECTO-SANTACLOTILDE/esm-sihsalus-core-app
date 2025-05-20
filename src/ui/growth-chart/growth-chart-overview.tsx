import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  useVisitOrOfflineVisit,
  launchStartVisitPrompt,
} from '@openmrs/esm-patient-common-lib';
import { getPatientName, launchWorkspace } from '@openmrs/esm-framework';
import { Button, DataTableSkeleton, InlineLoading } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useBiometrics } from './hooks/useBiometrics';
import GrowthChart from './growth-chart';
import styles from './growth-chart-overview.scss';

interface GrowthChartProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const GrowthChartOverview: React.FC<GrowthChartProps> = ({ patient, patientUuid }) => {
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

  const patientName = getPatientName(patient);

  const gender = useMemo(() => {
    const raw = patient?.gender?.toUpperCase?.();
    return raw === 'FEMALE' || raw === 'MALE' ? raw.charAt(0) : 'M';
  }, [patient]);

  const dateOfBirth = useMemo(() => new Date(patient?.birthDate ?? new Date()), [patient?.birthDate]);
  const { data, isLoading: isLoading, error } = useBiometrics(patientUuid);

  if (isLoading && !data) {
    return <DataTableSkeleton role="progressbar" aria-label={t('loadingData', 'Loading data')} />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (data?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          {isLoading && <InlineLoading description={t('refreshing', 'Refreshing...')} status="active" />}
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

        <GrowthChart measurementData={data} patientName={patientName} gender={gender} dateOfBirth={dateOfBirth} />
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
