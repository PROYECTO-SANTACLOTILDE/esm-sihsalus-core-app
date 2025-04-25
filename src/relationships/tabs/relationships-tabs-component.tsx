import React from 'react';
import { TabPanels, TabPanel, TabList, Tabs, Tab } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './relationships-tabs.scss';
import ContactList from '../../contact-list/contact-list.component';
import FamilyHistory from '../../family-partner-history/family-history.component';
import { OtherRelationships } from '../../other-relationships/other-relationships.component';

interface RelationshipsTabProps {
  patientUuid: string;
}

export const RelationshipsTab: React.FC<RelationshipsTabProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  return (
    <main>
      <Tabs className={styles.relationshipTabs}>
        <TabList className={styles.relationshipTablist} aria-label="List tabs" contained>
          <Tab className={styles.relationshipTab}>{t('family', 'Familia')}</Tab>
          <Tab className={styles.relationshipTab}>{t('pnsContacts', 'Parejas')}</Tab>
          <Tab className={styles.relationshipTab}>{t('other', 'Otros')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <FamilyHistory patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <ContactList patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <OtherRelationships patientUuid={patientUuid} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
};
