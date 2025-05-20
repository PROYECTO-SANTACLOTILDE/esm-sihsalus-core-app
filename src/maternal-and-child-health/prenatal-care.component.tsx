import React from 'react';
import { UserFollow, Task, ChartLineData } from '@carbon/react/icons';
import TabbedDashboard from '../ui/tabbed-dashboard/tabbed-dashboard.component';
import type { TabConfig } from '../ui/tabbed-dashboard/tabbed-dashboard.component';

interface PrenatalCareProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const PrenatalCare: React.FC<PrenatalCareProps> = ({ patient, patientUuid }) => {
  const tabs: TabConfig[] = [
    {
      labelKey: 'maternalHistory',
      icon: UserFollow,
      slotName: 'prenatal-maternal-history-slot',
    },
    {
      labelKey: 'currentPregnancy',
      icon: Task,
      slotName: 'prenatal-current-pregnancy-slot',
    },
    {
      labelKey: 'prenatalCareChart',
      icon: ChartLineData,
      slotName: 'prenatal-care-chart-slot',
    },
  ];

  return (
    <TabbedDashboard
      patient={patient}
      patientUuid={patientUuid}
      titleKey="prenatalCare"
      tabs={tabs}
      ariaLabelKey="prenatalCareTabs"
    />
  );
};

export default PrenatalCare;
