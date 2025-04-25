import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, Tag } from '@carbon/react';
import { AddIcon, launchWorkspace, formatDate } from '@openmrs/esm-framework';
import styles from './cred-schedule.scss';

interface CredEncounter {
  id: string;
  title: string;
  date: string;
  type: 'CRED' | 'Complementaria';
}

interface CredCheckupsProps {
  patientUuid: string;
}

const CredCheckups: React.FC<CredCheckupsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const [encounters, setEncounters] = useState<CredEncounter[]>([]);
  const [isFetchingEncounters, setIsFetchingEncounters] = useState(true);

  useEffect(() => {
    const fetchEncounters = async () => {
      try {
        setIsFetchingEncounters(true);
        const response = await fetch(
          `/openmrs/ws/rest/v1/encounter?patient=${patientUuid}&v=custom:(uuid,encounterType,encounterDatetime)`,
        );
        if (!response.ok) throw new Error('Error fetching encounters');
        const data = await response.json();

        const formattedEncounters = data.results.map((encounter: any) => ({
          id: encounter.uuid,
          title: encounter.encounterType.display,
          date: formatDate(new Date(encounter.encounterDatetime)),
          type: encounter.encounterType.display.includes('CRED') ? 'CRED' : 'Complementaria',
        }));

        setEncounters(formattedEncounters);
      } catch (err) {
        console.error('Error fetching encounters:', err);
      } finally {
        setIsFetchingEncounters(false);
      }
    };

    fetchEncounters();
  }, [patientUuid]);

  const upcomingCheckups = [
    { month: 0, name: 'CRED Nº 1' },
    { month: 2, name: 'CRED Nº 2' },
    { month: 3, name: 'Complementaria' },
    { month: 4, name: 'CRED Nº 3' },
  ];

  const handleAddCredControl = (checkup) => {
    launchWorkspace('wellchild-control-form', {
      workspaceTitle: `${t('newCredEncounter', 'Nuevo Control CRED')} - ${checkup.name}`,
      additionalProps: {
        patientUuid,
        checkup,
        type: 'newControl',
      },
    });
  };

  return (
    <div className={styles.widgetCard}>
      <div className={styles.desktopHeading}>
        <h4>{t('credCheckups', 'Controles CRED')}</h4>
      </div>
      <div className={styles.checkups}>
        {isFetchingEncounters ? (
          <InlineLoading description={t('loadingEncounters', 'Cargando encuentros...')} />
        ) : (
          encounters.map((encounter) => (
            <div key={encounter.id} className={styles.checkupItem}>
              <span>{encounter.title}</span>
              <span>{encounter.date}</span>
              <Tag type={encounter.type === 'CRED' ? 'green' : 'purple'}>{encounter.type}</Tag>
            </div>
          ))
        )}

        <h5 className={styles.upcomingHeader}>{t('upcomingCheckups', 'Próximos controles')}</h5>
        {upcomingCheckups.map((checkup, index) => (
          <div key={index} className={styles.checkupItem}>
            <span>{checkup.name}</span>
            <span className={styles.dueDate}>
              {t('dueAt', 'A los')} {checkup.month} {t('months', 'meses')}
            </span>
            <Tag type="blue">{t('pending', 'Pendiente')}</Tag>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CredCheckups;
