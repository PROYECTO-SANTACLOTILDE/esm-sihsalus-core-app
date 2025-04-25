import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, TabList, TabPanel, TabPanels, Layer, Tile } from '@carbon/react';
import { useConfig, ExtensionSlot } from '@openmrs/esm-framework';
import styles from './maternal-health-component.scss';

import Partograph from './partography/partograph.component';
import DeliberyOrAbortionTable from './tables/deliveryOrAbortion.component';
import SummaryOfLaborAndPostpartum from './tables/summaryOfLaborAndPostpartum.component';

interface LabourDeliveryProps {
  patientUuid: string;
}

const LabourDelivery: React.FC<LabourDeliveryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('antenatalCare', 'Prenatal Care');
  const {
    encounterTypes: { prenatalControl },
    formsList: { antenatal },
  } = useConfig();

  const pageSize = 10;

  const tabPanels = [
    {
      name: t('parto', 'Parto'),
      component: <DeliberyOrAbortionTable patientUuid={patientUuid} />,
    },
    {
      name: t('historiaClinicaObstetricaParto', 'Historia Clínica Obstétrica de Parto'),
      //component: <PostpartumControlTable patientUuid={patientUuid} />,
    },

    {
      name: t('evolucionYMonitorizacion', 'Evolución Y Monitorización'),
      //component: <PostpartumControlTable patientUuid={patientUuid} />,
    },
    {
      name: t('resumenPartoPostparto', 'Resumen de Parto y Postparto'),
      component: <SummaryOfLaborAndPostpartum patientUuid={patientUuid} />,
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

export default LabourDelivery;
