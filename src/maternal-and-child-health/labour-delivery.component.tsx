import React from 'react';
import { Report, Document, Activity, ChartMultitype } from '@carbon/react/icons';
import { BabyIcon } from '@openmrs/esm-framework';
import TabbedDashboard from '../ui/tabbed-dashboard/tabbed-dashboard.component';
import type { TabConfig } from '../ui/tabbed-dashboard/tabbed-dashboard.component';

interface LabourDeliveryProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const LabourDelivery: React.FC<LabourDeliveryProps> = ({ patient, patientUuid }) => {
  const tabs: TabConfig[] = [
    {
      labelKey: 'summaryOfLaborAndPostpartum',
      icon: Report,
      slotName: 'labour-delivery-summary-slot',
    },
    {
      labelKey: 'deliveryOrAbortion',
      icon: BabyIcon,
      slotName: 'labour-delivery-delivery-abortion-slot',
    },
    {
      labelKey: 'partograph',
      icon: ChartMultitype,
      slotName: 'labour-delivery-partograph-slot',
    },
  ];

  return (
    <TabbedDashboard
      patient={patient}
      patientUuid={patientUuid}
      titleKey="labourAndDelivery"
      tabs={tabs}
      ariaLabelKey="labourAndDeliveryTabs"
    />
  );
};

export default LabourDelivery;
