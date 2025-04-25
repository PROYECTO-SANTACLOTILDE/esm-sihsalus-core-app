import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, ButtonSet, Form, InlineLoading, InlineNotification } from '@carbon/react';
import { useLayoutType, useSession } from '@openmrs/esm-framework'; // Agregamos useSession para obtener el userId
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  type ConditionDataTableRow,
  useConditions,
  createCondition,
  updateCondition,
} from '../../components/neonatal-register/family-history/conditions.resource';
import ConditionsWidget from './conditions-widget.component';
import styles from './conditions-form.scss';

interface ConditionFormProps extends DefaultPatientWorkspaceProps {
  condition?: ConditionDataTableRow;
  formContext: 'creating' | 'editing';
}

const createSchema = (formContext: 'creating' | 'editing', t: Function) => {
  const isCreating = formContext === 'creating';
  const clinicalStatusValidation = z.string().refine((clinicalStatus) => !isCreating || !!clinicalStatus, {
    message: t('clinicalStatusRequired', 'A clinical status is required'),
  });
  const conditionNameValidation = z.string().refine((conditionName) => !isCreating || !!conditionName, {
    message: t('conditionRequired', 'A condition is required'),
  });

  return z.object({
    abatementDateTime: z.date().optional().nullable(),
    clinicalStatus: clinicalStatusValidation,
    conditionName: conditionNameValidation,
    onsetDateTime: z.date().nullable(),
  });
};

export type ConditionsFormSchema = z.infer<ReturnType<typeof createSchema>>;

const ConditionsForm: React.FC<ConditionFormProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  condition,
  formContext,
  patientUuid,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { conditions, mutate } = useConditions(patientUuid); // Agregamos mutate
  const { user } = useSession(); // Para obtener el userId
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [errorCreating, setErrorCreating] = useState(null);
  const [errorUpdating, setErrorUpdating] = useState(null);
  const isEditing = formContext === 'editing';

  const matchingCondition = conditions?.find((c) => c?.id === condition?.id);

  const schema = createSchema(formContext, t);

  const defaultValues = {
    abatementDateTime:
      isEditing && matchingCondition?.abatementDateTime ? new Date(matchingCondition?.abatementDateTime) : null,
    conditionName: isEditing ? (matchingCondition?.display ?? '') : '',
    clinicalStatus: isEditing ? (matchingCondition?.clinicalStatus?.toLowerCase() ?? '') : '',
    onsetDateTime: isEditing && matchingCondition?.onsetDateTime ? new Date(matchingCondition?.onsetDateTime) : null,
  };

  const methods = useForm<ConditionsFormSchema>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const onSubmit: SubmitHandler<ConditionsFormSchema> = async (data) => {
    setIsSubmittingForm(true);
    const userId = user?.uuid;

    const payload = {
      clinicalStatus: data.clinicalStatus,
      conceptId: isEditing ? matchingCondition?.conceptId : condition?.id, // Asumimos que conceptId viene del condition o widget
      display: data.conditionName,
      abatementDateTime: data.abatementDateTime?.toISOString() ?? undefined,
      onsetDateTime: data.onsetDateTime?.toISOString() ?? new Date().toISOString(),
      patientId: patientUuid,
      userId: userId,
    };

    try {
      if (isEditing && condition?.id) {
        // Actualizar condición existente
        const response = await updateCondition(condition.id, payload);
        if (response.status === 200) {
          mutate(); // Invalidar y refrescar el caché de condiciones
          closeWorkspaceWithSavedChanges();
        }
      } else {
        // Crear nueva condición
        const response = await createCondition(payload);
        if (response.status === 201) {
          mutate(); // Invalidar y refrescar el caché de condiciones
          closeWorkspaceWithSavedChanges();
        }
      }
    } catch (error) {
      if (isEditing) {
        setErrorUpdating(error);
      } else {
        setErrorCreating(error);
      }
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const onError = () => setIsSubmittingForm(false);

  return (
    <FormProvider {...methods}>
      <Form className={styles.form} onSubmit={methods.handleSubmit(onSubmit, onError)}>
        <ConditionsWidget
          closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges}
          conditionToEdit={condition}
          isEditing={isEditing}
          isSubmittingForm={isSubmittingForm}
          patientUuid={patientUuid}
          setErrorCreating={setErrorCreating}
          setErrorUpdating={setErrorUpdating}
          setIsSubmittingForm={setIsSubmittingForm}
        />
        <div>
          {errorCreating ? (
            <div className={styles.errorContainer}>
              <InlineNotification
                className={styles.error}
                role="alert"
                kind="error"
                lowContrast
                title={t('errorCreatingCondition', 'Error creating condition')}
                subtitle={errorCreating?.message}
              />
            </div>
          ) : null}
          {errorUpdating ? (
            <div className={styles.errorContainer}>
              <InlineNotification
                className={styles.error}
                role="alert"
                kind="error"
                lowContrast
                title={t('errorUpdatingCondition', 'Error updating condition')}
                subtitle={errorUpdating?.message}
              />
            </div>
          ) : null}
          <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
            <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button className={styles.button} disabled={isSubmittingForm} kind="primary" type="submit">
              {isSubmittingForm ? (
                <InlineLoading className={styles.spinner} description={t('saving', 'Saving') + '...'} />
              ) : (
                <span>{t('saveAndClose', 'Save & close')}</span>
              )}
            </Button>
          </ButtonSet>
        </div>
      </Form>
    </FormProvider>
  );
};

export default ConditionsForm;
