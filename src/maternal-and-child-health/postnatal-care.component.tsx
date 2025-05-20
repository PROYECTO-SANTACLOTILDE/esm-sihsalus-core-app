import React from 'react';
import { Activity, Stethoscope } from '@carbon/react/icons';
import TabbedDashboard from '../ui/tabbed-dashboard/tabbed-dashboard.component';
import type { TabConfig } from '../ui/tabbed-dashboard/tabbed-dashboard.component';

interface PostnatalCareProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const PostnatalCare: React.FC<PostnatalCareProps> = ({ patient, patientUuid }) => {
  const tabs: TabConfig[] = [
    {
      labelKey: 'immediatePostpartum',
      icon: Activity,
      slotName: 'postnatal-care-immediate-slot',
    },
    {
      labelKey: 'postnatalControls',
      icon: Stethoscope,
      slotName: 'postnatal-care-controls-slot',
    },
  ];

  return (
    <TabbedDashboard
      patient={patient}
      patientUuid={patientUuid}
      titleKey="postnatalCare"
      tabs={tabs}
      ariaLabelKey="postnatalCareTabs"
    />
  );
};

export default PostnatalCare;
