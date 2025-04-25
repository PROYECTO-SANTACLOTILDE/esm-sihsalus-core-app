import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import type { Condition } from './conditions.resource';
import styles from './conditions-action-menu.scss';

interface ConditionsActionMenuProps {
  condition: Condition;
  patientUuid?: string;
  mutate?: () => void; // Agregamos mutate como prop opcional
}

export const ConditionsActionMenu = ({ condition, patientUuid, mutate }: ConditionsActionMenuProps) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const launchEditConditionsForm = useCallback(
    () =>
      launchPatientWorkspace('conditions-form-workspace', {
        workspaceTitle: t('editCondition', 'Edit a Condition'),
        condition,
        formContext: 'editing',
        patientUuid, // Añadimos patientUuid para consistencia
      }),
    [condition, patientUuid, t],
  );

  const launchDeleteConditionDialog = useCallback(() => {
    const dispose = showModal('condition-delete-confirmation-dialog', {
      closeDeleteModal: () => dispose(),
      conditionId: condition.id,
      patientUuid,
      onDeleteSuccess: () => mutate && mutate(), // Callback para refrescar después de eliminar
    });
  }, [condition.id, patientUuid, mutate]);

  return (
    <Layer className={styles.layer}>
      <OverflowMenu aria-label="Edit or delete condition" size={isTablet ? 'lg' : 'sm'} flipped align="left">
        <OverflowMenuItem
          className={styles.menuItem}
          id="editCondition"
          onClick={launchEditConditionsForm}
          itemText={t('edit', 'Edit')}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="deleteCondition"
          itemText={t('delete', 'Delete')}
          onClick={launchDeleteConditionDialog}
          isDelete
          hasDivider
        />
      </OverflowMenu>
    </Layer>
  );
};
