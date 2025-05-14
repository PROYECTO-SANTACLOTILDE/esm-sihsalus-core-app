import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eyedropper, Pills } from '@carbon/react/icons';
import { useVisit } from '@openmrs/esm-framework';
import type { TabConfig } from '../ui/tabbed-dashboard/tabbed-dashboard.component';
import TabbedDashboard from '../ui/tabbed-dashboard/tabbed-dashboard.component';

interface ChildImmunizationProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const ChildImmunizationSchedule: React.FC<ChildImmunizationProps> = ({ patient, patientUuid }) => {
  const tabs: TabConfig[] = [
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
  ];

  return (
    <TabbedDashboard
      patient={patient}
      patientUuid={patientUuid}
      titleKey="childImmunizationSchedule"
      tabs={tabs}
      ariaLabelKey="immunizationTabs"
    />
  );
};

export default ChildImmunizationSchedule;
