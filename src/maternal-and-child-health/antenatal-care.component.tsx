import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, TabList, TabPanel, TabPanels, Layer, Tile } from '@carbon/react';
import { useConfig, ExtensionSlot } from '@openmrs/esm-framework';
import styles from './maternal-health-component.scss';

interface AntenatalCareProps {
  patientUuid: string;
}

const AntenatalCare: React.FC<AntenatalCareProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('antenatalCare', 'Prenatal Care');
  const {
    encounterTypes: { prenatalControl },
    formsList: { antenatal },
  } = useConfig();

  const pageSize = 10;

  const tabPanels = useMemo(
    () => [
      {
        label: t('Antecedentes', 'Antecedentes'),
        slotName: 'maternal-history-slot',
      },
      {
        label: t('EmbarazoActual', 'Embarazo Actual'),
        slotName: 'current-pregnancy-slot',
      },
      {
        label: t('AtencionesPrenatales', 'Atenciones Prenatales'),
        slotName: 'prenatal-care-chart-slot',
      },
      /*{
        label: t('CronogramaPrenatal', 'Cronograma Prenatal'),
        slotName: <PatientAppointmentsBase patientUuid={patientUuid} />,
      },
      {
        label: t('GraficasObstétricas', 'Graficas Obstétricas'),
        slotName: <div>Graficas Obstétricas Content</div>,
      },*/
    ],
    [t],
  );

  return (
    <div className={styles.referralsList} data-testid="referralsList-list">
      <Layer>
        <Tile>
          <div className={styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
        </Tile>
      </Layer>

      <Layer>
        <Tabs selected={0}>
          <TabList aria-label="Content Switcher as Tabs">
            {tabPanels.map((tab, index) => (
              <Tab key={index}>{tab.label}</Tab>
            ))}
          </TabList>

          <TabPanels>
            {tabPanels.map((tab, index) => (
              <TabPanel key={index}>
                <ExtensionSlot name={tab.slotName} state={{ patientUuid, pageSize }} className={styles.extensionSlot} />
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Layer>
    </div>
  );
};

export default AntenatalCare;
