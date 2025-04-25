import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { deleteCondition, useConditions } from './conditions.resource';
import styles from './delete-condition.scss';

interface DeleteConditionModalProps {
  closeDeleteModal: () => void;
  conditionId: string;
  patientUuid?: string;
  onDeleteSuccess?: () => void; // Callback opcional para notificar al componente padre
}

const DeleteConditionModal: React.FC<DeleteConditionModalProps> = ({
  closeDeleteModal,
  conditionId,
  patientUuid,
  onDeleteSuccess,
}) => {
  const { t } = useTranslation();
  const { mutate } = useConditions(patientUuid); // Para refrescar las condiciones
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      const response = await deleteCondition(conditionId);
      if (response.status === 200) {
        await mutate(); // Refresca el caché de condiciones
        closeDeleteModal();
        if (onDeleteSuccess) onDeleteSuccess(); // Notifica al componente padre si hay callback

        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          title: t('conditionDeleted', 'Condition deleted'),
          subtitle: t('conditionDeletedSuccessfully', 'The condition has been deleted successfully'),
        });
      }
    } catch (error) {
      console.error('Error deleting condition: ', error);
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorDeletingCondition', 'Error deleting condition'),
        subtitle: error?.message || t('unknownError', 'An unknown error occurred'),
      });
    } finally {
      setIsDeleting(false); // Aseguramos que el estado se restablezca incluso en caso de error
    }
  }, [closeDeleteModal, conditionId, mutate, onDeleteSuccess, t]);

  return (
    <div>
      <ModalHeader closeModal={closeDeleteModal} title={t('deleteCondition', 'Delete condition')} />
      <ModalBody>
        <p>{t('deleteModalConfirmationText', 'Are you sure you want to delete this condition?')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeDeleteModal} disabled={isDeleting}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.deleteButton} kind="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? (
            <InlineLoading description={t('deleting', 'Deleting') + '...'} />
          ) : (
            <span>{t('delete', 'Delete')}</span>
          )}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteConditionModal;
