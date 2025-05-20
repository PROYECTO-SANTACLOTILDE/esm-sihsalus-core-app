import React from 'react';
import { Friendship, ReminderMedical } from '@carbon/react/icons';
import type { TabConfig } from '../ui/tabbed-dashboard/tabbed-dashboard.component';
import TabbedDashboard from '../ui/tabbed-dashboard/tabbed-dashboard.component';

interface WellChildControlProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const WellChildControl: React.FC<WellChildControlProps> = ({ patient, patientUuid }) => {
  const tabs: TabConfig[] = [
    {
      labelKey: 'Seguimiento',
      icon: Friendship,
      slotName: 'cred-following-slot',
    },
    {
      labelKey: 'Controles CRED',
      icon: Friendship,
      slotName: 'cred-schedule-slot',
    },
    {
      labelKey: 'Controles NO CRED',
      icon: ReminderMedical,
      slotName: 'non-cred-control-slot',
    },
    {
      labelKey: 'Pediatría y Servicios Adicionales',
      icon: ReminderMedical,
      slotName: 'additional-health-services-slot',
    },
  ];

  return (
    <TabbedDashboard
      patient={patient}
      patientUuid={patientUuid}
      titleKey="postnatalCare"
      tabs={tabs}
      ariaLabelKey="wellChildCareTabs"
    />
  );
};

export default WellChildControl;
