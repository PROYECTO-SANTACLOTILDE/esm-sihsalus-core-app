import React, { useEffect } from 'react';
import styles from './clinical-view-section.scss';
import { useTranslation } from 'react-i18next';
import { Information } from '@carbon/react/icons';

import { Tooltip } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import type { DashboardGroupExtensionProps } from './dashboard-group.component';
import { registerNavGroup } from '@openmrs/esm-patient-common-lib';

export const ClinicalViewSection: React.FC<DashboardGroupExtensionProps> = ({ title, basePath }) => {
  const slotName = 'clinical-view-section';
  const { t } = useTranslation();
  useEffect(() => {
    registerNavGroup(slotName);
  }, [slotName]);
  return (
    <>
      <div className={styles.container}>
        <span className={styles.span}>{t('clinicalViews', 'Clinical views')}</span>
        <Tooltip
          align="top"
          label={t(
            'customViews',
            "In this section, you'll find custom clinical views tailored to patients' conditions and enrolled care programs.",
          )}
        >
          <button className={styles.tooltipButton} type="button">
            <Information className={styles.icon} size={20} />
          </button>
        </Tooltip>
      </div>
      <ExtensionSlot style={{ width: '100%', minWidth: '15rem' }} name={slotName ?? title} state={{ basePath }} />
    </>
  );
};

export default ClinicalViewSection;
