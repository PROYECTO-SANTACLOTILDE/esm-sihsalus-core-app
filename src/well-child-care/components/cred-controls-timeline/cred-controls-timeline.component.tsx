import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { usePatient } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib/src/workspaces';
import styles from './cred-schedule.scss';

interface CredAgeGroupsProps {
  patientUuid: string;
}

const CredAgeGroups: React.FC<CredAgeGroupsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { patient, isLoading, error } = usePatient(patientUuid);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<(typeof ageGroups)[0] | null>(null);

  const patientAgeInMonths = useMemo(() => {
    if (!patient?.birthDate) return 0;
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    return (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
  }, [patient]);

  const ageGroups = [
    { min: 0, max: 1, label: '0 AÑOS', sublabel: '0 A 29 DÍAS' },
    { min: 1, max: 12, label: '1 AÑO', sublabel: '1 A 11 MESES' },
    { min: 12, max: 24, label: '2 AÑOS', sublabel: '12 A 23 MESES' },
    { min: 24, max: 36, label: '3 AÑOS', sublabel: '24 A 35 MESES' },
    { min: 36, max: 48, label: '4 AÑOS', sublabel: '36 A 47 MESES' },
    { min: 48, max: 60, label: '5 AÑOS', sublabel: '48 A 59 MESES' },
    { min: 60, max: 72, label: '6 AÑOS' },
    { min: 72, max: 84, label: '7 AÑOS' },
    { min: 84, max: 96, label: '8 AÑOS' },
  ];

  const currentAgeGroup = useMemo(
    () => ageGroups.find((group) => patientAgeInMonths >= group.min && patientAgeInMonths < group.max),
    [patientAgeInMonths, ageGroups],
  );

  const handleAgeGroupClick = (group) => {
    setSelectedAgeGroup(group);
    launchPatientWorkspace('wellchild-control-form', {
      workspaceTitle: `${t('ageGroupDetails', 'Detalles del grupo de edad')} - ${group.label}`,
      additionalProps: {
        patientUuid,
        ageGroup: group,
        patientAgeInMonths,
        type: 'ageGroup',
      },
    });
  };

  if (isLoading) return <div>{t('loadingPatient', 'Cargando paciente...')}</div>;
  if (error)
    return <p className={styles.error}>{t('errorLoadingPatient', 'Error cargando los datos del paciente.')}</p>;

  return (
    <div className={styles.widgetCard}>
      <div className={styles.desktopHeading}>
        <h4>{t('credAgeGroups', 'Control Según Edad')}</h4>
      </div>
      <div className={styles.ageGroups}>
        {ageGroups.map((group) => (
          <Tile
            key={group.label}
            className={`${styles.ageTile} ${selectedAgeGroup?.label === group.label ? styles.active : ''} ${
              currentAgeGroup?.label === group.label ? styles.current : ''
            }`}
            onClick={() => handleAgeGroupClick(group)}
          >
            <strong>{group.label}</strong>
            {group.sublabel && <div>{group.sublabel}</div>}
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default CredAgeGroups;
