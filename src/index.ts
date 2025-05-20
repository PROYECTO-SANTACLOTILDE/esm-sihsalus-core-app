// 1. IMPORTS
import { defineConfigSchema, getSyncLifecycle, getAsyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { createLeftPanelLink } from './left-panel-link.component';
import { createDashboardGroup } from './clinical-view-group/createDashboardGroup';

import { configSchema } from './config-schema';
import { inPatientClinicalEncounterDashboardMeta } from './clinical-encounter/clinical-encounter-dashboard-meta';
import ClinicalEncounterDashboard from './clinical-encounter/dashboard/clinical-encounter-dashboard.component';
import ClinicalViewSection from './clinical-view-group/clinical-view-section.component';

import {
  caseEncounterDashboardMeta,
  caseManagementDashboardMeta,
  contactListDashboardMeta,
  familyHistoryDashboardMeta,
  otherRelationshipsDashboardMeta,
  relationshipsDashboardMeta,
} from './dashboard.meta';

import FamilyHistory from './family-partner-history/family-history.component';
import FamilyRelationshipForm from './family-partner-history/family-relationship.workspace';

import GenericDashboard from './specialized-clinics/generic-nav-links/generic-dashboard.component';
import GenericNavLinks from './specialized-clinics/generic-nav-links/generic-nav-links.component';
import DefaulterTracing from './specialized-clinics/hiv-care-and-treatment-services/defaulter-tracing/defaulter-tracing.component';
import {
  defaulterTracingDashboardMeta,
  hivCareAndTreatmentNavGroup,
  htsDashboardMeta,
} from './specialized-clinics/hiv-care-and-treatment-services/hiv-care-and-treatment-dashboard.meta';
import HivTestingEncountersList from './specialized-clinics/hiv-care-and-treatment-services/hiv-testing-services/views/hiv-testing/hiv-testing-services.component';
import { specialClinicsNavGroup } from './specialized-clinics/special-clinic-dashboard.meta';

import WrapComponent from './case-management/wrap/wrap.component';
import CaseEncounterOverviewComponent from './case-management/encounters/case-encounter-overview.component';
import CaseManagementForm from './case-management/workspace/case-management.workspace';
import EndRelationshipWorkspace from './case-management/workspace/case-management-workspace.component';

import ContactList from './contact-list/contact-list.component';
import ContactListForm from './contact-list/contact-list.workspace';

import Relationships from './relationships/relationships.component';
import RelationshipUpdateForm from './relationships/forms/relationships-update-form.workspace';
import DeleteRelationshipConfirmDialog from './relationships/modals/delete-relationship-dialog.modal';
import BirthDateCalculator from './relationships/modals/birthdate-calculator.modal';
import { OtherRelationships } from './other-relationships/other-relationships.component';
import { OtherRelationshipsForm } from './other-relationships/other-relationships.workspace';

import PrenatalCare from './maternal-and-child-health/prenatal-care.component';
import PostnatalCare from './maternal-and-child-health/postnatal-care.component';
import LabourDelivery from './maternal-and-child-health/labour-delivery.component';
import {
  prenatalDashboardMeta,
  labourAndDeliveryDashboardMeta,
  postnatalDashboardMeta,
  maternalAndChildHealthNavGroup,
} from './maternal-and-child-health/dashboard.meta';

import PrenatalCareChart from './maternal-and-child-health/components/prenatal-care/prenatalCareChart.component';
import MaternalHistoryTable from './maternal-and-child-health/components/prenatal-care/maternalHistory.component';
import CurrentPregnancyTable from './maternal-and-child-health/components/prenatal-care/currentPregnancy.component';

import SummaryOfLaborAndPostpartumTable from './maternal-and-child-health/components/labour-delivery/summaryOfLaborAndPostpartum.component';
import Partograph from './maternal-and-child-health/components/labour-delivery/partography/partograph.component';
import DeliberyOrAbortionTable from './maternal-and-child-health/components/labour-delivery/deliveryOrAbortion.component';

import PostpartumControlTable from './maternal-and-child-health/components/postnatal-care/postpartumControl.component';
import ImmediatePostpartumTable from './maternal-and-child-health/components/postnatal-care/immediatePostpartumTable';

import NeonatalCare from './well-child-care/neonatal-care.component';
import WellChildControl from './well-child-care/well-child-control.component';
import ChildInmunizationSchedule from './well-child-care/child-inmunization.component';
import {
  neonatalCareDashboardMeta,
  wellChildControlDashboardMeta,
  childImmunizationScheduleDashboardMeta,
  wellChildCareNavGroup,
} from './well-child-care/dashboard.meta';

// Neonatal Components
import NewbornBiometricsBase from './well-child-care/components/newborn-monitoring/newborn biometrics/biometrics-base.component';
import NewbornBalanceOverview from './well-child-care/components/newborn-monitoring/newborn balance/balance-overview.component';
import NeonatalEvaluation from './well-child-care/components/neonatal-evaluation/neonatal-evaluation.component';
import NeonatalCounseling from './well-child-care/components/neonatal-counseling/neonatal-consuling.component';
import NeonatalAttention from './well-child-care/components/neonatal-attention/neonatal-attention.component';
import LabourHistory from './well-child-care/components/neonatal-register/labour-history/labour-history.component';
import PrenatalAntecedents from './well-child-care/components/neonatal-register/prenatal-history/prenatal-history.component';
import ChildMedicalHistory from './well-child-care/components/neonatal-register/family-history/child-medical-history.component';
import CredControlsTimeline from './well-child-care/components/cred-controls-timeline/cred-controls-timeline.component';
import CredControlsCheckout from './well-child-care/components/cred-controls-timeline/cred-checkups.component';
import CredControlsMatrix from './well-child-care/components/cred-controls-timeline/cred-matrix.component';

import VaccinationSchedule from './well-child-care/components/vaccination-schema-widget/vaccinationSchedule.component';
import { AdverseReactionForm } from './well-child-care/workspace/adverse-reaction/adverseReaction.component';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@pucp-gidis-hiisc/esm-sihsalus-app';
const options = {
  featureName: 'patient-clinical-view-app',
  moduleName,
};

// 2. CONFIGURATION
export function startupApp(): void {
  defineConfigSchema(moduleName, configSchema);
}

// 3. SPECIAL CLINICS NAVIGATION GROUP
export const specialClinicsSideNavGroup = getSyncLifecycle(createDashboardGroup(specialClinicsNavGroup), options);

// 4. CLINICAL ENCOUNTERS
export const inPatientClinicalEncounterLink = getSyncLifecycle(
  createDashboardLink({ ...inPatientClinicalEncounterDashboardMeta, moduleName }),
  options,
);
export const inPatientClinicalEncounter = getSyncLifecycle(ClinicalEncounterDashboard, options);
export const clinicalViewPatientDashboard = getSyncLifecycle(ClinicalViewSection, options);

// 5. HIV CARE & TREATMENT
export const hivCareAndTreatMentSideNavGroup = getSyncLifecycle(
  createDashboardGroup(hivCareAndTreatmentNavGroup),
  options,
);
export const defaulterTracingLink = getSyncLifecycle(
  createDashboardLink({ ...defaulterTracingDashboardMeta, moduleName }),
  options,
);
export const htsDashboardLink = getSyncLifecycle(createDashboardLink({ ...htsDashboardMeta, moduleName }), options);
export const htsClinicalView = getSyncLifecycle(HivTestingEncountersList, options);
export const defaulterTracing = getSyncLifecycle(DefaulterTracing, options);

// 6. FAMILY HISTORY
export const familyHistory = getSyncLifecycle(FamilyHistory, options);
export const familyHistoryLink = getSyncLifecycle(
  createDashboardLink({ ...familyHistoryDashboardMeta, moduleName }),
  options,
);
export const familyRelationshipForm = getSyncLifecycle(FamilyRelationshipForm, options);

// 7. OTHER RELATIONSHIPS
export const otherRelationships = getSyncLifecycle(OtherRelationships, options);
export const otherRelationshipsLink = getSyncLifecycle(
  createDashboardLink({ ...otherRelationshipsDashboardMeta, moduleName }),
  options,
);
export const otherRelationshipsForm = getSyncLifecycle(OtherRelationshipsForm, options);

// 8. RELATIONSHIPS
export const relationshipsLink = getSyncLifecycle(
  createDashboardLink({ ...relationshipsDashboardMeta, moduleName }),
  options,
);

export const relationships = getSyncLifecycle(Relationships, options);
export const relationshipUpdateForm = getSyncLifecycle(RelationshipUpdateForm, options);
export const relationshipDeleteConfirmialog = getSyncLifecycle(DeleteRelationshipConfirmDialog, options);

// 9. CONTACTS
export const contactList = getSyncLifecycle(ContactList, options);
export const contactListLink = getSyncLifecycle(
  createDashboardLink({ ...contactListDashboardMeta, moduleName }),
  options,
);
export const contactListForm = getSyncLifecycle(ContactListForm, options);
export const birthDateCalculator = getSyncLifecycle(BirthDateCalculator, options);

// 10. CASE MANAGEMENT
export const caseManagementDashboardLink = getSyncLifecycle(createLeftPanelLink(caseManagementDashboardMeta), options);
export const wrapComponent = getSyncLifecycle(WrapComponent, options);
export const caseManagementForm = getSyncLifecycle(CaseManagementForm, options);
export const caseEncounterDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...caseEncounterDashboardMeta, moduleName }),
  options,
);
export const caseEncounterTable = getSyncLifecycle(CaseEncounterOverviewComponent, options);
export const endRelationshipWorkspace = getSyncLifecycle(EndRelationshipWorkspace, options);

// 11. MATERNAL AND CHILD HEALTH
export const maternalAndChildHealthSideNavGroup = getSyncLifecycle(
  createDashboardGroup(maternalAndChildHealthNavGroup),
  options,
);
export const prenatalCare = getSyncLifecycle(PrenatalCare, options);
export const postnatalCare = getSyncLifecycle(PostnatalCare, options);
export const labourAndDelivery = getSyncLifecycle(LabourDelivery, options);
export const prenatalCareLink = getSyncLifecycle(
  createDashboardLink({ ...prenatalDashboardMeta, moduleName }),
  options,
);
export const postnatalCareLink = getSyncLifecycle(
  createDashboardLink({ ...postnatalDashboardMeta, moduleName }),
  options,
);
export const labourAndDeliveryLink = getSyncLifecycle(
  createDashboardLink({ ...labourAndDeliveryDashboardMeta, moduleName }),
  options,
);

export const prenatalCareChart = getSyncLifecycle(PrenatalCareChart, options);
export const maternalHistoryTable = getSyncLifecycle(MaternalHistoryTable, options);
export const currentPregnancyTable = getSyncLifecycle(CurrentPregnancyTable, options);

export const summaryOfLaborAndPostpartumTable = getSyncLifecycle(SummaryOfLaborAndPostpartumTable, options);
export const deliberyOrAbortionTable = getSyncLifecycle(DeliberyOrAbortionTable, options);
export const partograph = getSyncLifecycle(Partograph, options);

export const immediatePostpartumTable = getSyncLifecycle(ImmediatePostpartumTable, options);
export const postpartumControlTable = getSyncLifecycle(PostpartumControlTable, options);


// 12. WELL CHILD CARE
export const wellChildCareSideNavGroup = getSyncLifecycle(createDashboardGroup(wellChildCareNavGroup), options);
export const neonatalCareLink = getSyncLifecycle(
  createDashboardLink({ ...neonatalCareDashboardMeta, moduleName }),
  options,
);
export const wellChildCareLink = getSyncLifecycle(
  createDashboardLink({ ...wellChildControlDashboardMeta, moduleName }),
  options,
);
export const childImmunizationScheduleLink = getSyncLifecycle(
  createDashboardLink({ ...childImmunizationScheduleDashboardMeta, moduleName }),
  options,
);
export const neonatalCare = getSyncLifecycle(NeonatalCare, options);
export const wellChildCare = getSyncLifecycle(WellChildControl, options);
export const childImmunizationSchedule = getSyncLifecycle(ChildInmunizationSchedule, options);

export const neonatalEvaluationChart = getSyncLifecycle(NeonatalEvaluation, options);
export const neonatalCounselingChart = getSyncLifecycle(NeonatalCounseling, options);
export const neonatalAttentionChart = getSyncLifecycle(NeonatalAttention, options);
export const neonatalRegisterChart = getSyncLifecycle(LabourHistory, options);
export const prenatalHistoryChart = getSyncLifecycle(PrenatalAntecedents, options);
export const childMedicalHistory = getSyncLifecycle(ChildMedicalHistory, options);

export const newbornBiometricsBaseChart = getSyncLifecycle(NewbornBiometricsBase, options);
export const newbornBalanceOverviewChart = getSyncLifecycle(NewbornBalanceOverview, options);

export const credControls = getSyncLifecycle(CredControlsTimeline, options);
export const credCheckouts = getSyncLifecycle(CredControlsCheckout, options);
export const credControlsMatrix = getSyncLifecycle(CredControlsMatrix, options);

export const vaccinationSchedule = getSyncLifecycle(VaccinationSchedule, options);
export const vaccinationAppointment = getSyncLifecycle(AdverseReactionForm, options);

// 13. SPECIALIZED CLINICS - GENERIC
export const genericNavLinks = getSyncLifecycle(GenericNavLinks, options);
export const genericDashboard = getSyncLifecycle(GenericDashboard, options);

// 14. ASYNC COMPONENTS
export const schedulingAdminPageCardLink = getAsyncLifecycle(
  () => import('./immunization-plan/scheduling-admin-link.component'),
  options,
);
export const monthlyAppointmentFilterCalendar = getAsyncLifecycle(
  () => import('./ui/appointment-filter-calendar/appointment-filter-calendar'),
  options,
);
export const schedulingBuilder = getAsyncLifecycle(
  () => import('./immunization-plan/immunization-plan-builder.component'),
  options,
);
export const newbornAnthropometricsworkspace = getAsyncLifecycle(
  () => import('./well-child-care/workspace/newborn-triage/newborn-anthropometrics.workspace'),
  options,
);
export const newbornFluidBalanceworkspace = getAsyncLifecycle(
  () => import('./well-child-care/workspace/newborn-triage/newborn-fluid-balance.workspace'),
  options,
);
export const perinatalRegisterworkspace = getAsyncLifecycle(
  () => import('./well-child-care/workspace/perinatal-register/perinatal-register-form.workspace'),
  options,
);
export const wellchildControlsworkspace = getAsyncLifecycle(
  () => import('./well-child-care/workspace/well-child-control/well-child-controls-form.workspace'),
  options,
);
export const growthChart = getAsyncLifecycle(() => import('./ui/growth-chart/growth-chart-overview'), options);
