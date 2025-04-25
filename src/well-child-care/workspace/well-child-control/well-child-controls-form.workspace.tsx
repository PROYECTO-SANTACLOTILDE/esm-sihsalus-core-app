import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSet,
  Checkbox,
  Column,
  DatePicker,
  DatePickerInput,
  Form,
  InlineNotification,
  NumberInput,
  Row,
  Stack,
  TextArea,
  TextInput,
} from '@carbon/react';
import {
  createErrorHandler,
  showSnackbar,
  useConfig,
  useLayoutType,
  usePatient,
  useSession,
  useVisit,
} from '@openmrs/esm-framework';
import type { DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../../../config-schema'; // Adjust path as needed
import styles from './well-child-controls-form.scss'; // Create this file for styles

// Validation schema with zod
const WellChildControlsSchema = z
  .object({
    consultationDate: z.date().optional(),
    consultationTime: z.string().optional(),
    dangerSigns: z.array(z.string()).optional(),
    riskFactors: z.array(z.string()).optional(),
    caregiver: z.string().optional(),
    fatherInvolvement: z.boolean().optional(),
    affection: z.boolean().optional(),
    consultationReason: z.string().min(1, 'Reason for consultation is required'),
    illnessDuration: z.string().optional(),
    temperature: z.number().min(34).max(43).optional(),
    bloodPressure: z.string().optional(),
    heartRate: z.number().min(20).max(200).optional(),
    respiratoryRate: z.number().min(10).max(100).optional(),
    weight: z.number().min(0).max(50).optional(),
    height: z.number().min(0).max(150).optional(),
    headCircumference: z.number().min(25).max(50).optional(),
    physicalExam: z.string().optional(),
    nosologicalDiagnosis: z.array(z.string()).optional(),
    growthCondition: z.string().optional(),
    nutritionalStatus: z.string().optional(),
    psychomotorDevelopment: z.string().optional(),
    treatment: z.string().optional(),
    agreements: z.string().optional(),
    referral: z.string().optional(),
    nextAppointment: z.date().optional(),
    observations: z.string().optional(),
    attendedBy: z.string().optional(),
  })
  .refine((data) => Object.values(data).some((value) => Boolean(value)), {
    message: 'Please complete at least one field',
    path: ['oneFieldRequired'],
  });

export type WellChildControlsFormType = z.infer<typeof WellChildControlsSchema>;

const WellChildControlsForm: React.FC<DefaultPatientWorkspaceProps> = ({
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig<ConfigObject>();
  const session = useSession();
  const { patient, isLoading: isPatientLoading } = usePatient(patientUuid);
  const { currentVisit } = useVisit(patientUuid);
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isDirty, isSubmitting },
    register,
  } = useForm<WellChildControlsFormType>({
    mode: 'all',
    resolver: zodResolver(WellChildControlsSchema),
    defaultValues: {
      dangerSigns: [],
      riskFactors: [],
    },
  });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  // Calculate patient age in months
  const patientAgeInMonths = useMemo(() => {
    if (!patient?.birthDate) return 0;
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    return (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
  }, [patient]);

  // Save data to OpenMRS
  const saveWellChildControls = useCallback(
    async (data: WellChildControlsFormType) => {
      setShowErrorNotification(false);
      const abortController = new AbortController();

      try {
        const encounterData = {
          encounterType: config.vitals.encounterTypeUuid, // Adjust as per your config
          form: config.vitals.formUuid, // Adjust as per your config
          patient: patientUuid,
          location: session?.sessionLocation?.uuid,
          observations: [
            ...(data.dangerSigns?.length ? [{ concept: 'DANGER_SIGNS_UUID', value: data.dangerSigns.join(', ') }] : []),
            ...(data.riskFactors?.length ? [{ concept: 'RISK_FACTORS_UUID', value: data.riskFactors.join(', ') }] : []),
            data.consultationReason && {
              concept: 'CONSULTATION_REASON_UUID',
              value: data.consultationReason,
            },
            data.temperature && { concept: 'TEMPERATURE_UUID', value: data.temperature },
            // Add more observations as needed
          ].filter(Boolean),
        };

        const response = await fetch('/openmrs/ws/rest/v1/encounter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(encounterData),
          signal: abortController.signal,
        });

        if (response.ok) {
          closeWorkspaceWithSavedChanges();
          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            title: t('consultationSaved', 'Consultation Saved'),
            subtitle: t('dataSaved', 'Data has been saved successfully.'),
          });
        } else {
          throw new Error('Failed to save consultation');
        }
      } catch (error) {
        createErrorHandler();
        showSnackbar({
          title: t('saveError', 'Error saving consultation'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error.message,
        });
      } finally {
        abortController.abort();
      }
    },
    [
      patientUuid,
      session?.sessionLocation?.uuid,
      config.vitals.encounterTypeUuid,
      config.vitals.formUuid,
      closeWorkspaceWithSavedChanges,
      t,
    ],
  );

  const onError = (err) => {
    if (err?.oneFieldRequired || Object.keys(err).length > 0) {
      setShowErrorNotification(true);
    }
  };

  if (isPatientLoading) {
    return <div>{t('loading', 'Loading...')}</div>;
  }

  return (
    <Form className={styles.form} onSubmit={handleSubmit(saveWellChildControls, onError)}>
      <div className={styles.grid}>
        <Stack gap={4}>
          <Column>
            <p className={styles.title}>{t('wellChildControls', 'Well Child Controls')}</p>
          </Column>

          {/* Consultation Date and Time */}
          <Row className={styles.row}>
            <Column>
              <DatePicker datePickerType="single" {...register('consultationDate')}>
                <DatePickerInput
                  id="consultationDate"
                  placeholder="dd/mm/yyyy"
                  labelText={t('consultationDate', 'Consultation Date')}
                  {...register('consultationDate')}
                />
              </DatePicker>
            </Column>
            <Column>
              <TextInput
                id="consultationTime"
                labelText={t('consultationTime', 'Consultation Time')}
                type="time"
                {...register('consultationTime')}
              />
            </Column>
          </Row>

          {/* Danger Signs */}
          <Column>
            <p className={styles.subtitle}>{t('dangerSigns', 'Danger Signs')}</p>
          </Column>
          <Row className={styles.row}>
            {patientAgeInMonths < 2 ? (
              <>
                <Checkbox
                  id="noBreastfeeding"
                  labelText={t('noBreastfeeding', 'Does not want to breastfeed or suck')}
                  {...register('dangerSigns')}
                  value="Does not want to breastfeed or suck"
                />
                <Checkbox
                  id="seizures"
                  labelText={t('seizures', 'Seizures')}
                  {...register('dangerSigns')}
                  value="Seizures"
                />
                <Checkbox
                  id="lethargy"
                  labelText={t('lethargy', 'Lethargy or coma')}
                  {...register('dangerSigns')}
                  value="Lethargy or coma"
                />
              </>
            ) : (
              <>
                <Checkbox
                  id="cannotDrink"
                  labelText={t('cannotDrink', 'Cannot drink or breastfeed')}
                  {...register('dangerSigns')}
                  value="Cannot drink or breastfeed"
                />
                <Checkbox
                  id="vomiting"
                  labelText={t('vomiting', 'Vomits everything')}
                  {...register('dangerSigns')}
                  value="Vomits everything"
                />
                <Checkbox
                  id="paleness"
                  labelText={t('paleness', 'Severe palmar paleness')}
                  {...register('dangerSigns')}
                  value="Severe palmar paleness"
                />
              </>
            )}
          </Row>

          {/* Risk Factors */}
          <Column>
            <p className={styles.subtitle}>{t('riskFactors', 'Risk Factors')}</p>
          </Column>
          <Row className={styles.row}>
            <Checkbox
              id="malnutrition"
              labelText={t('malnutrition', 'Severe visible malnutrition')}
              {...register('riskFactors')}
              value="Severe visible malnutrition"
            />
            <Checkbox
              id="trauma"
              labelText={t('trauma', 'Trauma / Burns')}
              {...register('riskFactors')}
              value="Trauma / Burns"
            />
            <TextInput
              id="caregiver"
              labelText={t('caregiver', 'Who takes care of the child?')}
              {...register('caregiver')}
            />
            <Checkbox
              id="fatherInvolvement"
              labelText={t('fatherInvolvement', 'Does the father participate in care?')}
              {...register('fatherInvolvement')}
            />
            <Checkbox
              id="affection"
              labelText={t('affection', 'Does the child receive affection?')}
              {...register('affection')}
            />
          </Row>

          {/* Consultation Details */}
          <Column>
            <p className={styles.subtitle}>{t('consultationDetails', 'Consultation Details')}</p>
          </Column>
          <Row className={styles.row}>
            <TextArea
              id="consultationReason"
              labelText={t('consultationReason', 'Reason for Consultation')}
              {...register('consultationReason')}
            />
            <TextInput
              id="illnessDuration"
              labelText={t('illnessDuration', 'Duration of Illness')}
              {...register('illnessDuration')}
            />
          </Row>

          {/* Vital Signs */}
          <Column>
            <p className={styles.subtitle}>{t('vitalSigns', 'Vital Signs')}</p>
          </Column>
          <Row className={styles.row}>
            <NumberInput
              id="temperature"
              label={t('temperature', 'Temperature (°C)')}
              min={34}
              max={43}
              step={0.1}
              {...register('temperature', { valueAsNumber: true })}
            />
            <TextInput
              id="bloodPressure"
              labelText={t('bloodPressure', 'Blood Pressure (mmHg)')}
              placeholder="systolic/diastolic"
              {...register('bloodPressure')}
            />
            <NumberInput
              id="heartRate"
              label={t('heartRate', 'Heart Rate (bpm)')}
              min={20}
              max={200}
              {...register('heartRate', { valueAsNumber: true })}
            />
            <NumberInput
              id="respiratoryRate"
              label={t('respiratoryRate', 'Respiratory Rate (rpm)')}
              min={10}
              max={100}
              {...register('respiratoryRate', { valueAsNumber: true })}
            />
            <NumberInput
              id="weight"
              label={t('weight', 'Weight (kg)')}
              min={0}
              max={50}
              step={0.1}
              {...register('weight', { valueAsNumber: true })}
            />
            <NumberInput
              id="height"
              label={t('height', 'Height (cm)')}
              min={0}
              max={150}
              {...register('height', { valueAsNumber: true })}
            />
            <NumberInput
              id="headCircumference"
              label={t('headCircumference', 'Head Circumference (cm)')}
              min={25}
              max={50}
              {...register('headCircumference', { valueAsNumber: true })}
            />
          </Row>

          {/* Physical Examination */}
          <Column>
            <p className={styles.subtitle}>{t('physicalExam', 'Physical Examination')}</p>
          </Column>
          <Row className={styles.row}>
            <TextArea id="physicalExam" {...register('physicalExam')} />
          </Row>

          {/* Diagnoses */}
          <Column>
            <p className={styles.subtitle}>{t('diagnoses', 'Diagnoses')}</p>
          </Column>
          <Row className={styles.row}>
            <TextArea
              id="nosologicalDiagnosis"
              labelText={t('nosologicalDiagnosis', 'Nosological or Syndromic Diagnosis')}
              {...register('nosologicalDiagnosis.0')}
            />
            <TextInput
              id="growthCondition"
              labelText={t('growthCondition', 'Growth Condition')}
              {...register('growthCondition')}
            />
            <TextInput
              id="nutritionalStatus"
              labelText={t('nutritionalStatus', 'Nutritional Status')}
              {...register('nutritionalStatus')}
            />
            <TextInput
              id="psychomotorDevelopment"
              labelText={t('psychomotorDevelopment', 'Psychomotor Development')}
              {...register('psychomotorDevelopment')}
            />
          </Row>

          {/* Treatment */}
          <Column>
            <p className={styles.subtitle}>{t('treatment', 'Treatment')}</p>
          </Column>
          <Row className={styles.row}>
            <TextArea id="treatment" {...register('treatment')} />
          </Row>

          {/* Agreements */}
          <Column>
            <p className={styles.subtitle}>{t('agreements', 'Agreements and Commitments')}</p>
          </Column>
          <Row className={styles.row}>
            <TextArea id="agreements" {...register('agreements')} />
          </Row>

          {/* Referral */}
          <Column>
            <p className={styles.subtitle}>{t('referral', 'Referral')}</p>
          </Column>
          <Row className={styles.row}>
            <TextInput id="referral" {...register('referral')} />
          </Row>

          {/* Next Appointment */}
          <Column>
            <p className={styles.subtitle}>{t('nextAppointment', 'Next Appointment')}</p>
          </Column>
          <Row className={styles.row}>
            <DatePicker datePickerType="single" {...register('nextAppointment')}>
              <DatePickerInput
                id="nextAppointment"
                placeholder="dd/mm/yyyy"
                labelText=""
                {...register('nextAppointment')}
              />
            </DatePicker>
          </Row>

          {/* Observations */}
          <Column>
            <p className={styles.subtitle}>{t('observations', 'Observations')}</p>
          </Column>
          <Row className={styles.row}>
            <TextArea id="observations" {...register('observations')} />
          </Row>

          {/* Attended By */}
          <Column>
            <p className={styles.subtitle}>{t('attendedBy', 'Attended By')}</p>
          </Column>
          <Row className={styles.row}>
            <TextInput id="attendedBy" {...register('attendedBy')} />
          </Row>
        </Stack>
      </div>

      {showErrorNotification && (
        <Column className={styles.errorContainer}>
          <InlineNotification
            className={styles.errorNotification}
            lowContrast={false}
            onClose={() => setShowErrorNotification(false)}
            title={t('error', 'Error')}
            subtitle={t('pleaseFillField', 'Please complete the required fields') + '.'}
          />
        </Column>
      )}

      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" disabled={isSubmitting} type="submit">
          {t('submit', 'Save and Close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default WellChildControlsForm;
