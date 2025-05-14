import React from 'react';
import { Activity, CloudMonitoring, WatsonHealthCobbAngle, UserFollow, Stethoscope } from '@carbon/react/icons';
import TabbedDashboard from '../ui/tabbed-dashboard/tabbed-dashboard.component'; // Default import
import type { TabConfig } from '../ui/tabbed-dashboard/tabbed-dashboard.component'; // Named type import

interface NeonatalProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const NeonatalCare: React.FC<NeonatalProps> = ({ patient, patientUuid }) => {
  const tabs: TabConfig[] = [
    {
      labelKey: 'Signos Vitales del Recién Nacido',
      icon: Activity,
      slotName: 'neonatal-vitals-slot',
    },
    {
      labelKey: 'Registro Perinatal',
      icon: UserFollow,
      slotName: 'neonatal-perinatal-slot',
    },
    {
      labelKey: 'Atención Inmediata',
      icon: CloudMonitoring,
      slotName: 'neonatal-attention-slot',
    },
    {
      labelKey: 'Evaluación Cefalocaudal',
      icon: Stethoscope,
      slotName: 'neonatal-evaluation-slot',
    },
    {
      labelKey: 'Consejeria de Lactancia Materna',
      icon: WatsonHealthCobbAngle,
      slotName: 'neonatal-counseling-slot',
    },
  ];

  return (
    <TabbedDashboard
      patient={patient}
      patientUuid={patientUuid}
      titleKey="neonatalCare"
      tabs={tabs}
      ariaLabelKey="neonatalCareTabs"
    />
  );
};

export default NeonatalCare;
