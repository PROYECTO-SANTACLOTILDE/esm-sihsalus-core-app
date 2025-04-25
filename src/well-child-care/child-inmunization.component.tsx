import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eyedropper, Pills } from '@carbon/react/icons';
import { usePatient, useVisit } from '@openmrs/esm-framework';
import type { TabConfig } from '../ui/tabbed-dashboard/tabbed-dashboard.component';
import TabbedDashboard from '../ui/tabbed-dashboard/tabbed-dashboard.component';

const ChildImmunizationSchedule: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit, isLoading: isVisitLoading } = useVisit(patientUuid);
  const { patient, isLoading: isPatientLoading } = usePatient(patientUuid);
  const pageSize = 10;

  // Memoize patient age in months
  const patientAgeInMonths = useMemo(() => {
    if (!patient?.birthDate) return null;
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    return years * 12 + months;
  }, [patient?.birthDate]);

  const tabs: TabConfig[] = useMemo(
    () => [
      {
        labelKey: 'Calendario de Vacunación',
        icon: Eyedropper,
        slotName: 'vaccination-schedule-slot',
      },
      {
        labelKey: 'Reacciones Adversas',
        icon: Pills,
        slotName: 'vaccination-appointment-slot',
      },
    ],
    [t],
  );

  if (isVisitLoading || isPatientLoading) {
    return (
      <div>
        <p>{t('loading', 'Cargando datos...')}</p>
      </div>
    );
  }

  return (
    <TabbedDashboard
      patientUuid={patientUuid}
      titleKey="childImmunizationSchedule"
      tabs={tabs}
      ariaLabelKey="immunizationTabs"
      pageSize={pageSize}
      state={{ patientUuid, currentVisit, patientAgeInMonths }} // Pass additional state
    />
  );
};

export default ChildImmunizationSchedule;
