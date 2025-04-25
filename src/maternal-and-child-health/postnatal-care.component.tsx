import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { EncounterListColumn } from '../ui/encounter-list/encounter-list.component';
import { EncounterList } from '../ui/encounter-list/encounter-list.component';
import { getObsFromEncounter } from '../ui/encounter-list/encounter-list-utils';
import {
  hivTestResultConcept,
  MotherNextVisitDate,
  motherGeneralConditionConcept,
  pphConditionConcept,
} from './concepts/mch-concepts';
import { useConfig, formatDate, parseDate } from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';
import { pncConceptMap } from './concept-maps/postnatal-care-concepts-map';
import styles from './maternal-health-component.scss';
import { Tabs } from '@carbon/react';
import { TabList } from '@carbon/react';
import { Tab } from '@carbon/react';
import { TabPanels } from '@carbon/react';
import { TabPanel } from '@carbon/react';
import { Layer } from '@carbon/react';
import InmmediatePostpartumPeriodTable from './tables/InmmediatePostpartumPeriod.component';
import PostpartumControlTable from './tables/postpartumControl.component';

interface PostnatalCareProps {
  patientUuid: string;
}

const PostnatalCare: React.FC<PostnatalCareProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('postnatalCare', 'Postnatal Care');

  const {
    encounterTypes: { postnatalControl },
    formsList: { postnatal },
  } = useConfig<ConfigObject>();

  const MotherPNCEncounterTypeUUID = postnatalControl;
  const MotherPNCEncounterFormUUID = postnatal;

  const columns: EncounterListColumn[] = useMemo(
    () => [
      {
        key: 'visitDate',
        header: t('visitDate', 'Visit Date'),
        getValue: (encounter) => {
          return formatDate(parseDate(encounter.encounterDatetime));
        },
      },
      {
        key: 'hivTestResults',
        header: t('hivTestResults', 'HIV Status'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, hivTestResultConcept);
        },
      },
      {
        key: 'motherGeneralCondition',
        header: t('motherGeneralCondition', 'General condition'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, motherGeneralConditionConcept, true);
        },
      },
      {
        key: 'pphCondition',
        header: t('pphCondition', 'PPH present'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, pphConditionConcept);
        },
      },
      {
        key: 'uterusCondition',
        header: t('uterusCondition', 'PPH Condition of uterus'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, pphConditionConcept);
        },
      },
      {
        key: 'nextVisitDate',
        header: t('nextVisitDate', 'Next visit date'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, MotherNextVisitDate, true);
        },
      },
      {
        key: 'actions',
        header: t('actions', 'Actions'),
        getValue: (encounter) => [
          {
            form: { name: 'Mother - Postnatal Form', package: 'maternal_health' },
            encounterUuid: encounter.uuid,
            intent: '*',
            label: t('editForm', 'Edit Form'),
            mode: 'edit',
          },
        ],
      },
    ],
    [t],
  );

  const tabPanels = [
    {
      name: t('PuerperioInmediato', 'Puerperio Inmediato'),
      component: <InmmediatePostpartumPeriodTable patientUuid={patientUuid} />,
    },
    {
      name: t('Controles', 'Controles'),
      component: <PostpartumControlTable patientUuid={patientUuid} />,
    },
  ];

  return (
    <div className={styles.referralsList} data-testid="referralsList-list">
      <Tabs selected={0} role="navigation">
        <div className={styles.tabsContainer}>
          <TabList aria-label="Content Switcher as Tabs" contained>
            {tabPanels.map((tab, index) => (
              <Tab key={index}>{tab.name}</Tab>
            ))}
          </TabList>
        </div>

        <TabPanels>
          {tabPanels.map((tab, index) => (
            <TabPanel key={index}>
              <Layer>{tab.component}</Layer>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default PostnatalCare;
