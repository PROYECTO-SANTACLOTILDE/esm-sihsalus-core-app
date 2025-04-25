export const antenatalDashboardMeta = {
  icon: 'omrs-icon-baby',
  slot: 'patient-chart-antenatal-dashboard-slot',
  columns: 1,
  title: 'Cuidados Prenatales',
  path: 'antenatal-care-dashboard',
  config: {},
};

export const labourAndDeliveryDashboardMeta = {
  icon: 'omrs-icon-hospital-bed',
  slot: 'patient-chart-labour-and-delivery-dashboard-slot',
  columns: 1,
  title: 'Atención del Parto',
  path: 'labour-and-delivery-dashboard',
  config: {},
};

export const postnatalDashboardMeta = {
  icon: 'omrs-icon-mother',
  slot: 'patient-chart-postnatal-dashboard-slot',
  columns: 1,
  title: 'Puerperio',
  path: 'postnatal-care-dashboard',
  config: {},
};

export const maternalAndChildHealthNavGroup = {
  title: 'Madre Gestante',
  slotName: 'maternal-and-child-health-slot',
  isExpanded: true,
  showWhenExpression:
    'patient.gender === "female" && (enrollment.includes("Madre Gestante") || enrollment.includes("Otras Estrategias Obstetricas"))',
};
