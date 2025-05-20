import React from 'react';
import { UserFollow, Task, ChartLineData } from '@carbon/react/icons';
import TabbedDashboard from '../ui/tabbed-dashboard/tabbed-dashboard.component';
import type { TabConfig } from '../ui/tabbed-dashboard/tabbed-dashboard.component';

interface AntenatalCareProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const AntenatalCare: React.FC<AntenatalCareProps> = ({ patient, patientUuid }) => {
  const tabs: TabConfig[] = [
    {
      labelKey: 'maternalHistory',
      icon: UserFollow,
      slotName: 'antenatal-maternal-history-slot',
    },
    {
      labelKey: 'currentPregnancy',
      icon: Task,
      slotName: 'antenatal-current-pregnancy-slot',
    },
    {
      labelKey: 'prenatalCareChart',
      icon: ChartLineData,
      slotName: 'antenatal-prenatal-care-chart-slot',
    },
  ];

  return (
    <TabbedDashboard
      patient={patient}
      patientUuid={patientUuid}
      titleKey="antenatalCare"
      tabs={tabs}
      ariaLabelKey="antenatalCareTabs"
    />
  );
};

export default AntenatalCare;
