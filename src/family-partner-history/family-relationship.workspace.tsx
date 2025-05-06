import { Button, ButtonSet, Column, ComboBox, Form, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useConfig, useSession, showSnackbar } from '@openmrs/esm-framework';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';
import type { ConfigObject } from '../config-schema';
import PatientSearchCreate from '../relationships/forms/patient-search-create-form';
import { relationshipFormSchema, saveRelationship } from '../relationships/relationship.resources';
import { uppercaseText } from '../utils/expression-helper';
import styles from './family-relationship.scss';
import { useMappedRelationshipTypes } from './relationships.resource';

const schema = relationshipFormSchema
  .refine((data) => !(data.mode === 'search' && !data.personB), { message: 'Required', path: ['personB'] })
  .refine((data) => !(data.mode === 'create' && !data.personBInfo), {
    path: ['personBInfo'],
    message: 'Please provide patient information',
  })
  .refine(
    (data) => {
      if (!data.startDate) {
        return true;
      }
      const now = new Date();
      const start = new Date(data.startDate);
      return start <= now;
    },
    {
      message: 'No puede ser una fecha en el futuro',
      path: ['startDate'],
    },
  )
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: 'No se puede colocar una fecha final más antigua que la fecha inicial',
      path: ['endDate'],
    },
  );

type FormData = z.infer<typeof schema>;

type RelationshipFormProps = {
  closeWorkspace: () => void;
  patientUuid: string;
};

const FamilyRelationshipForm: React.FC<RelationshipFormProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const { data: mappedRelationshipTypes } = useMappedRelationshipTypes();
  const config = useConfig<ConfigObject>();
  const { familyRelationshipsTypeList } = config;
  const familyRelationshipTypesUUIDs = new Set(familyRelationshipsTypeList.map((r) => r.uuid));
  const familyRelationshipTypes = mappedRelationshipTypes.filter((type) => familyRelationshipTypesUUIDs.has(type.uuid));
  const session = useSession();
  const relationshipTypes = familyRelationshipTypes.map((relationship) => ({
    id: relationship.uuid,
    text: relationship.display,
  }));

  const form = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      personA: patientUuid,
      mode: 'search',
    },
    resolver: zodResolver(schema),
  });

  const { control, handleSubmit } = form;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await saveRelationship(data, config, session, []);
      closeWorkspace();
    } catch (error) {
      console.error('Failed to save relationship:', error);

      showSnackbar({
        isLowContrast: false,
        title: t('error', 'Error'),
        subtitle: `${t('failedSavingRelationship', 'Relationship could not be saved')}`,
        kind: 'error',
      });
    }
  };

  return (
    <FormProvider {...form}>
      <Form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        onInvalid={(event) => {
          event.preventDefault();
          const fieldsWithError = Object.keys(form.formState.errors).join(', ');
          console.warn('Validation errors:', form.formState.errors);

          showSnackbar({
            title: t('error', 'Error'),
            subtitle: t('formInvalidFields', 'Please review the following fields:') + ` ${fieldsWithError}`,
            kind: 'error',
          });
        }}
      >
        <Stack gap={5} className={styles.grid}>
          <PatientSearchCreate />
          <span className={styles.sectionHeader}>{t('relationship', 'Relationship')}</span>

          <Column>
            <Controller
              name="relationshipType"
              control={control}
              render={({ field, fieldState }) => (
                <ComboBox
                  id="relationship_name"
                  titleText={t('relationship', 'Relationship')}
                  placeholder="Relationship to patient"
                  items={relationshipTypes}
                  itemToString={(item) => (item ? uppercaseText(item.text) : '')}
                  onChange={(e) => field.onChange(e.selectedItem?.id)}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  selectedItem={relationshipTypes.find((item) => item.id === field.value)}
                />
              )}
            />
          </Column>

          <Column>
            <div style={{ color: 'red', fontSize: '0.9em' }}>
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <div key={field}>
                  {field}: {(error as any)?.message}
                </div>
              ))}
            </div>
          </Column>
        </Stack>

        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
            {t('save', 'Save')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

export default FamilyRelationshipForm;
