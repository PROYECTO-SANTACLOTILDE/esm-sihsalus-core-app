import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  // 1. Tipos de Encuentro
  encounterTypes: {
    _type: Type.Object,
    _description: 'List of encounter type UUIDs',
    _default: {
      specializedConsultation: '2b3c4d5e-2234-5678-9101-abcdefghij02', // Consulta Especializada
      triage: '67a71486-1a54-468f-ac3e-7091a9a79584', // Triaje
      deliveryRoomCare: '7g8h9i0j-7234-5678-9101-abcdefghij07', // Atención en Sala de Partos
      hivTestingServices: '8h9i0j1k-8234-5678-9101-abcdefghij08', // Atención de Seguimiento de Enfermedades Crónicas (reemplaza hivTestingServices)
      prenatalControl: '58a87b85-cb6c-4a4c-bc5f-0a2d1e0ff8ba', // Control Prenatal (reemplaza mchMotherConsultation)
      postnatalControl: '2v3w4x5y-2234-5678-9101-abcdefghij22', // Control Postnatal
      healthyChildControl: '3w4x5y6z-3234-5678-9101-abcdefghij23', // Control de Niño Sano
      dentalCare: '4x5y6z7a-4234-5678-9101-abcdefghij24', // Atención de Odontología
      malnutritionAnemiaCare: '7a8b9c0d-7234-5678-9101-abcdefghij27', // Atención de Paciente con Desnutrición y Anemia
      obstetricUltrasound: '8b9c0d1e-8234-5678-9101-abcdefghij28', // Ecografía Obstétrica
      externalConsultation: '1a2b3c4d-1234-5678-9101-abcdefghij01', // Consulta Externa
      hospitalization: '4d5e6f7g-4234-5678-9101-abcdefghij04', // Hospitalización
      hospitalDischarge: '5e6f7g8h-5234-5678-9101-abcdefghij05', // Alta Hospitalaria
      emergencyCare: '6f7g8h9i-6234-5678-9101-abcdefghij06', // Atención en Emergencia
      chronicDiseaseFollowup: '8h9i0j1k-8234-5678-9101-abcdefghij08', // Atención de Seguimiento de Enfermedades Crónicas (already exists, but keeping for clarity)
      mentalHealthEvaluation: '9i0j1k2l-9234-5678-9101-abcdefghij09', // Evaluación de Salud Mental
      medicationPrescriptionDispensation: '0j1k2l3m-0234-5678-9101-abcdefghij10', // Prescripción y Dispensación de Medicamentos
      labResults: '1k2l3m4n-1234-5678-9101-abcdefghij11', // Resultados de Laboratorio
      vaccinationAdministration: '29c02aff-9a93-46c9-bf6f-48b552fcb1fa', // Administración de Vacunas
      healthEducationCounseling: '3m4n5o6p-3234-5678-9101-abcdefghij13', // Educación y Consejería en Salud
      consultation: '4n5o6p7q-4234-5678-9101-abcdefghij14', // Interconsulta
      referralCounterReferral: '5o6p7q8r-5234-5678-9101-abcdefghij15', // Referencia y Contrarreferencia
      intraHospitalTransfer: '6p7q8r9s-6234-5678-9101-abcdefghij16', // Traslado Intra-Hospitalario
      bedAssignment: '7q8r9s0t-7234-5678-9101-abcdefghij17', // Asignación de Cama
      hospitalizationProgressNote: '8r9s0t1u-8234-5678-9101-abcdefghij18', // Nota de Evolución de Hospitalización
      transferRequest: '9s0t1u2v-9234-5678-9101-abcdefghij19', // Solicitud de Traslado
      encounterCancellation: '0t1u2v3w-0234-5678-9101-abcdefghij20', // Anulación de Encuentro
      clinicalFileUpload: '5y6z7a8b-5234-5678-9101-abcdefghij25', // Carga de Archivos Clínicos
      tbTreatmentSupervision: '6z7a8b9c-6234-5678-9101-abcdefghij26', // Supervisión de Tratamiento DOT (Tuberculosis)
      covid19Management: '9c0d1e2f-9234-5678-9101-abcdefghij29', // Manejo de Personas Afectadas por COVID-19
      electiveAmbulatorySurgery: '0d1e2f3g-0234-5678-9101-abcdefghij30', // Atención de Salud Ambulatoria Quirúrgica Electiva
      order: '39da3525-afe4-45ff-8977-c53b7b359158', // Orden
      cefaloCaudal: 'e0a6cba3-fa9c-4bf0-90b7-9d4d48401d1c',
      consejeriaMaterna: 'f90ac51d-bc0b-4551-a6f2-358e1a47751f',
    },
  },

  // 2. Case Management Forms
  caseManagementForms: {
    _type: Type.Array,
    _description: 'List of form and encounter UUIDs',
    _default: [
      {
        id: 'high-iit-intervention',
        title: 'High IIT Intervention Form',
        formUuid: '6817d322-f938-4f38-8ccf-caa6fa7a499f',
        encounterTypeUuid: '7a8b9c0d-7234-5678-9101-abcdefghij27',
      },
      {
        id: 'home-visit-checklist',
        title: 'Home Visit Checklist Form',
        formUuid: 'ac3152de-1728-4786-828a-7fb4db0fc384',
        encounterTypeUuid: '5o6p7q8r-5234-5678-9101-abcdefghij15',
      },
    ],
  },

  // 3. Forms List
  formsList: {
    _type: Type.Object,
    _description: 'List of form UUIDs',
    _default: {
      antenatal: 'e8f98494-af35-4bb8-9fc7-c409c8fed843',
      postNatal: '72aa78e0-ee4b-47c3-9073-26f3b9ecc4a7',
      atencionImmediataNewborn: '(Página 5) ATENCIÓN INMEDIATA DEL RECIÉN NACIDO',
      maternalHistory: 'OBST-001-ANTECEDENTES',
      deliveryOrAbortion: 'OBST-005-PARTO O ABORTO',
      SummaryOfLaborAndPostpartum: 'HOSP-007-RESUMEN DE PARTO-POSTPARTO',
      currentPregnancy: 'OBST-002-EMBARAZO ACTUAL',
      prenatalCare: 'OBST-003-ATENCIÓN PRENATAL',
      immediatePostpartumPeriod: 'OBST-006-PUERPERIO INMEDIATO',
      postpartumControl: 'OBST-009-CONTROL DE PUERPERIO',
      //Pendientes
      labourAndDelivery: '496c7cc3-0eea-4e84-a04c-2292949e2f7f',
      defaulterTracingFormUuid: 'a1a62d1e-2def-11e9-b210-d663bd873d93',
      htsScreening: '04295648-7606-11e8-adc0-fa7ae01bbebc',
      htsInitialTest: '402dc5d7-46da-42d4-b2be-f43ea4ad87b0',
      htsRetest: 'b08471f6-0892-4bf7-ab2b-bf79797b8ea4',
      clinicalEncounterFormUuid: 'e958f902-64df-4819-afd4-7fb061f59308',

      // CRED
      breastfeedingObservation:
        '(Página 8) Ficha de Observación del Amamantamiento de la Consejería en Lactancia Materna',
      eedp12Months: 'Página (30, 31, 32 y 33) EEDP (12 meses)',
      tepsi: '(Página 34, 35 y 36) TEPSI',
      medicalProgressNote: '(Página 14) Nota de Evolución Médica',
      eedp5Months: 'Página (30, 31, 32 y 33) EEDP (5 meses)',
      eedp21Months: 'Página (30, 31, 32 y 33) EEDP (21 meses)',
      nursingAssessment: '(Página 11 y 12) Valoración de Enfermería',
      medicalOrders: '(Página 13) Órdenes Médicas',
      newbornNeuroEval: '(Página 6) EVALUACIÓN CÉFALO-CAUDAL Y NEUROLÓGICO DEL RECIÉN NACIDO',
      eedp15Months: 'Página (30, 31, 32 y 33) EEDP (15 meses)',
      riskInterview0to30: '(Página 19) PRIMERA ENTREVISTA EN BUSCA DE FACTORES DE RIESGO (0 - 30 meses)',
      eedp8Months: 'Página (30, 31, 32 y 33) EEDP (8 meses)',
      roomingIn: '(Página 10) Alojamiento Conjunto',
      eedp18Months: 'Página (30, 31, 32 y 33) EEDP (18 meses)',
      eedp2Months: 'Página (30, 31, 32 y 33) EEDP (2 meses)',
      childFeeding6to42: '(Página 20) Evaluación de la alimentación del niño/niña (6 - 42 meses)',
      childAbuseScreening: '(Página 37) Ficha de Tamizaje Violencia y maltrato infantil',
      epicrisis: '(Página 16) Epicrisis',
      childFeeding0to5: '(Página 20) Evaluación de la alimentación del niño/niña (0 - 5 meses)',
      // OTROS
      puerperiumLab: '(Página 4 y 5) Puerperio - Laboratorio',
      obstetricMonitor: 'HOSP-011-HOJA DE MONITORIZACIÓN OBSTÉTRICA',
      obstetricHistory: 'HOSP-002-HISTORIA CLÍNICA OBSTÉTRICA',
      obstetricProgress: 'HOSP-005-EVOLUCIÓN OBSTÉTRICA',
      obstetricAntecedents: 'OBST-001-ANTECEDENTES',
      medicalProgress: 'HOSP-004-EVOLUCIÓN MÉDICA',
      nursingNotes: 'HOSP-009-NOTAS DE ENFERMERÍA',
      therapeuticSheet: 'HOSP-008-HOJA TERAPÉUTICA',
      birthPlanForm: 'OBST-004-FICHA PLAN DE PARTO',
      vitalSignsControl: 'HOSP-001-CONTROL DE FUNCIONES VITALES',
      birthSummary: 'HOSP-007-RESUMEN DE PARTO',
      puerperiumEpicrisis: '(Página 12) Puerperio - Epicrisis',
      puerperiumDischarge: '(Página 14) Puerperio - Informe de Alta',
      clinicalHistory: 'HOSP-003-HISTORIA CLÍNICA OBSTÉTRICA',
    },
  },

  // 4. Defaulter Tracing Encounter
  defaulterTracingEncounterUuid: {
    _type: Type.String,
    _description: 'Encounter UUID for defaulter tracing',
    _default: '1495edf8-2df2-11e9-b210-d663bd873d93',
  },

  // 6. Clinical Encounter
  clinicalEncounterUuid: {
    _type: Type.String,
    _description: 'Clinical Encounter UUID',
    _default: '465a92f2-baf8-42e9-9612-53064be868e8',
  },

  // 7. Concepts (TO REVIEW)
  concepts: {
    probableCauseOfDeathConceptUuid: {
      _type: Type.ConceptUuid,
      _description:
        'Probable cause of death for a given patient determined from interviewing a family member or other non-medical personnel',
      _default: '1599AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    problemListConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'List of given problems for a given patient',
      _default: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },

    systolicBloodPressureUuid: {
      _type: Type.ConceptUuid,
      _default: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    temperatureUuid: {
      _type: Type.ConceptUuid,
      _default: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    oxygenSaturationUuid: {
      _type: Type.ConceptUuid,
      _default: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    weightUuid: {
      _type: Type.ConceptUuid,
      _default: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    respiratoryRateUuid: {
      _type: Type.ConceptUuid,
      _default: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    //liquidos
    stoolCountUuid: {
      _type: Type.ConceptUuid,
      _description: 'Number of stools per day',
      _default: 'f2f19bb7-e92f-4658-bfc9-0dbf63837cca',
    },
    stoolGramsUuid: {
      _type: Type.ConceptUuid,
      _description: 'Weight of stool output in grams',
      _default: 'e2365f75-d2d5-4950-925c-d87ad9e6c4d3',
    },
    urineCountUuid: {
      _type: Type.ConceptUuid,
      _description: 'Number of urinations per day',
      _default: 'c3dd9ed2-592e-43a7-a1e8-e010b12f1dd0',
    },
    urineGramsUuid: {
      _type: Type.ConceptUuid,
      _description: 'Urine output in grams/mL',
      _default: '4a275a66-ea18-4ee6-a967-c2bc4a2ff607',
    },
    vomitCountUuid: {
      _type: Type.ConceptUuid,
      _description: 'Number of vomiting episodes per day',
      _default: '4249ecea-d5b1-4541-ba42-48e9f2f968cd',
    },
    vomitGramsMLUuid: {
      _type: Type.ConceptUuid,
      _description: 'Vomit output in grams/mL',
      _default: 'db881ca6-26ff-46df-aac5-3f9a0efd67d4',
    },
    //antropometricos
    heightUuid: {
      _type: Type.ConceptUuid,
      _description: 'Height or length measurement of the patient',
      _default: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    headCircumferenceUuid: {
      _type: Type.ConceptUuid,
      _description: 'Head circumference measurement of the patient',
      _default: 'c4d39248-c896-433a-bc69-e24d04b7f0e5',
    },
    chestCircumferenceUuid: {
      _type: Type.ConceptUuid,
      _description: 'Chest circumference measurement of the patient',
      _default: '911eb398-e7de-4270-af63-e4c615ec22a9',
    },
    newbornVitalSignsConceptSetUuid: {
      _type: Type.ConceptUuid,
      _description: 'Datos Vitales Recien Nacido Vivo',
      _default: 'a855816a-8bc2-43c8-9cf7-80090dabc47d',
    },
  },

  madreGestante: {
    gravidezUuid: {
      _type: Type.ConceptUuid,
      _description: 'Número total de veces que una mujer ha estado embarazada (Gravidez)',
      _default: 'ae27daee-d2f3-4df3-8e07-eff75c81872e', // Concepto "Gestaciones"
    },
    //paridad
    partoAlTerminoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Número de partos a término (≥37 semanas de gestación)',
      _default: '8795c05b-f286-4d70-a1e6-69172e676f05', // Concepto "Partos a término"
    },
    partoPrematuroUuid: {
      _type: Type.ConceptUuid,
      _description: 'Número de partos prematuros (20-36 semanas de gestación)',
      _default: 'e08c2bfd-c3c9-4b46-afcf-e83e2a12c23f', // Concepto "Partos prematuros"
    },
    partoAbortoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Número de abortos (pérdidas antes de las 20 semanas de gestación)',
      _default: 'dbfad4ff-1b0c-4823-b80a-3864e1d81e94', // Concepto "Abortos"
    },
    partoNacidoVivoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Número de nacidos vivos',
      _default: 'b553ce85-94e2-4755-b106-3befef127133', // Concepto "Nacidos vivos"
    },
    partoNacidoMuertoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Número de nacidos muertos',
      _default: '4dc3ee54-ba0c-49e7-b907-02aa727372f4', // Concepto "Nacidos muertos"
    },

    gtpalConceptSetUuid: {
      _type: Type.ConceptUuid,
      _description: 'Concept set para el sistema GTPAL (Gravidez, Términos, Prematuros, Abortos, Vivos)',
      _default: '43244943-3df5-4640-a348-9131c8e47857', // UUID único para el concept set GTPAL
    },
    EGFechaUltimaRegla: {
      _type: Type.ConceptUuid,
      _description: 'Fecha de la última menstruación (FUR) para calcular la edad gestacional',
      _default: '57634c13-00a8-4764-93ec-dab90b6d20ce', // Concepto "Fecha de la última regla"
    },

    riskAntecedentsConceptSetUuid: {
      _type: Type.ConceptUuid,
      _description: 'Concept set para antecedentes de riesgo en el embarazo',
      _default: 'b20b322f-3d83-45aa-8169-a4a66afaf5f2', // UUID único para el concept set de antecedentes de riesgo
    },
  },

  // Niño sano
  CRED: {
    perinatalConceptSetUuid: {
      _type: Type.ConceptUuid,
      _description: 'Concept set para el seguimiento del niño sano',
      _default: 'ninio-sano-concept-set-uuid', // UUID único para el concept set de niño sano
    },
    profilaxisOcularUuid: {
      _type: Type.ConceptUuid,
      _description: 'Profilaxis ocular',
      _default: '10c23f60-3310-4674-9e2e-bc3aa9aecced',
    },

    kawaidaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Kawaida',
      _default: 'f35aa4ba-9d04-4283-a4c8-ec8f2ee29da5',
    },

    mamilasUuid: {
      _type: Type.ConceptUuid,
      _description: 'Mamilas',
      _default: '36094aaf-31f7-46e8-92f1-8e8f7b7181ec',
    },

    softAbdomenUuid: {
      _type: Type.ConceptUuid,
      _description: 'Soft abdomen',
      _default: '7160ba29-8f60-440e-aad5-8bec6ab862c1',
    },

    columnaVertebralUuid: {
      _type: Type.ConceptUuid,
      _description: 'Columna vertebral',
      _default: 'd5d244f7-911b-43ca-90a1-3001c167b342',
    },

    esFagoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Esófago',
      _default: 'e066680d-d825-45fe-a0ad-f3734dea6cb2',
    },

    informaciNDadaALosPadresUuid: {
      _type: Type.ConceptUuid,
      _description: 'Información dada a los padres',
      _default: '6e1bdd6a-1b1f-4490-a02f-39107088bc0c',
    },

    anoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Ano',
      _default: 'a6d87a4d-00a2-406e-8162-aaf9a4b4ebc8',
    },

    reflejoDeDegluciNUuid: {
      _type: Type.ConceptUuid,
      _description: 'Reflejo de Deglución',
      _default: '2e60bebc-8be0-4108-978e-fe11cff9dd04',
    },

    caracterSticasDelAbdomenUuid: {
      _type: Type.ConceptUuid,
      _description: 'Características del Abdomen',
      _default: '49d05fba-f1d0-4bb7-8b63-5084d78638e2',
    },

    vppVentilaciNConPresiNPositivaUuid: {
      _type: Type.ConceptUuid,
      _description: 'VPP (ventilación con presión positiva)',
      _default: '3c7a9bfd-b4bc-47a4-8130-68cc0dfe13aa',
    },

    muriAlNacerUuid: {
      _type: Type.ConceptUuid,
      _description: 'Murió al nacer',
      _default: '3bd60b8e-011e-41b7-b81a-dbd66d0f07c6',
    },

    temperaturaCUuid: {
      _type: Type.ConceptUuid,
      _description: 'Temperatura (C°)',
      _default: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },

    valoraciNNeurolGicaDelReciNNacidoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Valoración Neurológica del Recién Nacido',
      _default: '7378ae3c-4a25-4d09-adbc-b3fe6b739aa3',
    },

    vivoCuidadoEspecialUuid: {
      _type: Type.ConceptUuid,
      _description: 'Vivo-cuidado especial',
      _default: 'edba9007-4e4b-4a5f-806c-aa85cfcf8549',
    },

    eliminaciNUuid: {
      _type: Type.ConceptUuid,
      _description: 'Eliminación',
      _default: 'd79f07ac-bc26-4e3d-84d2-fb764da9409b',
    },

    posicionaVAAReaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Posiciona vía aérea',
      _default: '9735c0f0-62ac-4c28-8920-1d51ba64d847',
    },

    administraciNDeVitaminaKDe05MgUuid: {
      _type: Type.ConceptUuid,
      _description: 'Administración de Vitamina K de 0.5 mg',
      _default: '54da62f5-c6e0-4772-b1c4-d9fd58527d12',
    },

    tortColesUuid: {
      _type: Type.ConceptUuid,
      _description: 'Tortícoles',
      _default: '0e0a4502-23f2-4d89-a0d6-d419661b6bf7',
    },

    apgarScoreAt1MinuteUuid: {
      _type: Type.ConceptUuid,
      _description: 'APGAR score at 1 minute',
      _default: 'a2010a1f-d7ca-4d6f-9255-f53da4fa5c3f',
    },

    weightKgUuid: {
      _type: Type.ConceptUuid,
      _description: 'Weight',
      _default: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },

    pulseUuid: {
      _type: Type.ConceptUuid,
      _description: 'Pulse',
      _default: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },

    dBilUuid: {
      _type: Type.ConceptUuid,
      _description: 'Débil',
      _default: '5f39addc-6dda-4b51-ab8b-9a428af4b243',
    },

    cianTicoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Cianótico',
      _default: 'dacb38a4-3a5a-4943-8618-396bfb4f4a1f',
    },

    delayedCordClampingUuid: {
      _type: Type.ConceptUuid,
      _description: 'Delayed cord clamping',
      _default: 'c31a6261-a2ff-4a35-b920-23a20c2f5977',
    },

    fetalCephalhematomaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Fetal cephalhematoma',
      _default: '9f312c02-d88b-4c48-ac49-7ab4905688d0',
    },

    orinaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Orina',
      _default: 'b38ce428-7090-4a39-86e3-5761ce5aafc2',
    },

    contactoPielAPiel45A60MinutosUuid: {
      _type: Type.ConceptUuid,
      _description: 'Contacto piel a piel (45 a 60 minutos)',
      _default: 'c4fc217e-7e91-4094-90b1-1b33e657cb15',
    },

    aspiraciNDeSecrecionesBucoNasalUuid: {
      _type: Type.ConceptUuid,
      _description: 'Aspiración de secreciones buco nasal',
      _default: '6f5e5d13-4131-4cf5-9acd-c6b3621afeaa',
    },

    diagnSticoDeEnfermerAUuid: {
      _type: Type.ConceptUuid,
      _description: 'Diagnóstico de Enfermería',
      _default: '8e779adc-c463-434a-9113-a74c5e12399d',
    },

    descripciNUuid: {
      _type: Type.ConceptUuid,
      _description: 'Descripción',
      _default: 'd29ccdb7-b8ab-4d29-8a58-751300875df4',
    },

    bulgingFontenelleUuid: {
      _type: Type.ConceptUuid,
      _description: 'Bulging fontenelle',
      _default: 'cf2268ba-0ee6-4256-b692-8e5266abbeb4',
    },

    simetrADeVertebrasUuid: {
      _type: Type.ConceptUuid,
      _description: 'Simetría de vertebras',
      _default: '83a9132b-8a2f-4b7a-b5c6-1470d44ccdee',
    },

    fracturaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Fractura',
      _default: 'feeb3a1c-4aee-4562-8e50-0f6a02345f66',
    },

    clavCulaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Clavícula',
      _default: '3d81681d-081e-4c31-ad24-d5faea4c2833',
    },

    ortolaniUuid: {
      _type: Type.ConceptUuid,
      _description: 'Ortolani',
      _default: '0cc2a0e8-8339-42dd-9d43-ec313d602efb',
    },

    asimetrADeVertebrasUuid: {
      _type: Type.ConceptUuid,
      _description: 'Asimetría de vertebras',
      _default: '55137f18-e4ee-4fd9-9b12-c0f3026cce1d',
    },

    headCircumferenceUuid: {
      _type: Type.ConceptUuid,
      _description: 'Head circumference',
      _default: 'c4d39248-c896-433a-bc69-e24d04b7f0e5',
    },

    cuelloUuid: {
      _type: Type.ConceptUuid,
      _description: 'Cuello',
      _default: '7978016d-a854-427b-8451-9f6ca62b5186',
    },

    valoraciNDeLaEdadGestacionalUuid: {
      _type: Type.ConceptUuid,
      _description: 'Valoración de la edad gestacional',
      _default: '9995ef7b-df8c-422d-bce2-3d08ce994487',
    },

    arterialBloodOxygenSaturationPulseOximeterUuid: {
      _type: Type.ConceptUuid,
      _description: 'Arterial blood oxygen saturation (pulse oximeter)',
      _default: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },

    administraciNDeVitaminaKUuid: {
      _type: Type.ConceptUuid,
      _description: 'Administración de Vitamina k',
      _default: '5da8b9b1-f566-411f-b50b-f634ed6321c0',
    },

    reflejoDePresiNPlantarUuid: {
      _type: Type.ConceptUuid,
      _description: 'Reflejo de Presión Plantar',
      _default: '471bcb1a-088a-49b9-a896-e1a7f486e0c5',
    },

    administraciNDeVitaminaKDe1MgUuid: {
      _type: Type.ConceptUuid,
      _description: 'Administración de Vitamina K de 1 mg',
      _default: 'db504b68-1b34-4859-afdb-76377649c3de',
    },

    tonoMuscularUuid: {
      _type: Type.ConceptUuid,
      _description: 'Tono muscular',
      _default: '0d73ab1a-faee-4774-b570-609d98d8f6e0',
    },

    cantidadUuid: {
      _type: Type.ConceptUuid,
      _description: 'Cantidad',
      _default: '1c2e66e6-1a67-488c-a36b-e2f3536b72fe',
    },

    apgarScoreAt10MinutesUuid: {
      _type: Type.ConceptUuid,
      _description: 'APGAR score at 10 minutes',
      _default: 'f621e8d3-2c34-48fc-95c1-50ad0606ed68',
    },

    sindactiliaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Sindactilia',
      _default: '04c9718b-834f-45fd-8054-549da898PERU',
    },

    vigorosoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Vigoroso',
      _default: 'e1c79070-3bcf-471c-83b6-7467727a0a48',
    },

    respiraciNOLlantoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Respiración o llanto',
      _default: '153a8593-d56c-4165-a945-3706ab306aad',
    },

    examenFSicoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Examen físico',
      _default: '2d83b0ce-cd5e-4431-a235-de9674319037',
    },

    ubicaciNDeOrejasUuid: {
      _type: Type.ConceptUuid,
      _description: 'Ubicación de Orejas',
      _default: 'f1476edc-eb9f-4d1c-8812-8af0f6ecb831',
    },

    reflejoDeSucciNUuid: {
      _type: Type.ConceptUuid,
      _description: 'Reflejo de Succión',
      _default: 'b76fe27e-4ca3-426a-bfb2-e7a49569c713',
    },

    noseUuid: {
      _type: Type.ConceptUuid,
      _description: 'Nose',
      _default: '313226d7-d67d-4246-8d84-62f7208badf5',
    },

    clampadoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Clampado',
      _default: 'b7f5376f-b025-4da5-80e2-bb20065a1b30',
    },

    abdomenGlobulosoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Abdomen globuloso',
      _default: '9c7c7194-087b-43b0-b657-479fcef45b0d',
    },

    fontanelleLevelFindingUuid: {
      _type: Type.ConceptUuid,
      _description: 'Fontanelle level finding',
      _default: '52956c82-e8ad-4f85-8dd7-9b993f3d54df',
    },

    asimetrAUuid: {
      _type: Type.ConceptUuid,
      _description: 'Asimetría',
      _default: '474e8dc3-606e-4659-ab97-3bd10fb3ac37',
    },

    reflejoDeMarchaAutomTicaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Reflejo de Marcha Automática',
      _default: 'e6d349d2-fad5-4322-9c09-ec612cf1fdd9',
    },

    colorDePielUuid: {
      _type: Type.ConceptUuid,
      _description: 'Color de Piel',
      _default: 'c00971b1-029f-4160-9b68-55e101a512a8',
    },

    reflejoMoroUuid: {
      _type: Type.ConceptUuid,
      _description: 'Reflejo Moro',
      _default: 'dc1d326f-d116-4b35-ba56-f99a981097d9',
    },

    fenteLabialeUuid: {
      _type: Type.ConceptUuid,
      _description: 'Fente labiale',
      _default: '52ec163a-77a8-46f0-8bd7-c7c94f371171',
    },

    pLidoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Pálido',
      _default: 'f2eae333-7cbf-434c-a8e9-d4ec0126d161',
    },

    registroDeEliminaciNDeOrinaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Registro de eliminación de orina',
      _default: 'b442125b-88a2-41c0-ba9c-137c88d5003f',
    },

    perMetroTorCicoCmUuid: {
      _type: Type.ConceptUuid,
      _description: 'Perímetro Torácico (cm)',
      _default: '911eb398-e7de-4270-af63-e4c615ec22a9',
    },

    orejasUuid: {
      _type: Type.ConceptUuid,
      _description: 'Orejas',
      _default: '4b4f8ad4-a934-4ead-921a-266ca1d2102c',
    },

    reflejoDeBSquedaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Reflejo de Búsqueda',
      _default: 'd6838254-89e6-43db-a8ee-e4e49f36047e',
    },

    cbnCMaraBinivelDeOxGenoUuid: {
      _type: Type.ConceptUuid,
      _description: 'CBN (Cámara Binivel de Oxígeno)',
      _default: '8cbf99c1-e4f5-4af8-a955-c5afbf86e874',
    },

    irritableUuid: {
      _type: Type.ConceptUuid,
      _description: 'Irritable',
      _default: '6b34c163-30d6-4404-8ff2-c065a7e90402',
    },

    colocaciNEnBolsaPolietilenoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Colocación en bolsa polietileno',
      _default: '05105cf2-8111-4efc-88e4-17172e49311d',
    },

    polidactiliaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Polidactilia',
      _default: '33ceb6ce-b6b1-44ac-a4f4-b3cde588756a',
    },

    implantaciNUuid: {
      _type: Type.ConceptUuid,
      _description: 'Implantación',
      _default: '37b6676a-b4a8-4296-b17d-ebe8f194527d',
    },

    llantoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Llanto',
      _default: '3470c9be-e63b-4db6-8e2f-47103cd3bd65',
    },

    insertionOfCatheterIntoPeripheralVeinUuid: {
      _type: Type.ConceptUuid,
      _description: 'Insertion of catheter into peripheral vein',
      _default: '311bf842-f124-4f5e-ac6f-b18a621057f6',
    },

    moldeadasUuid: {
      _type: Type.ConceptUuid,
      _description: 'Moldeadas',
      _default: 'b7d3ad68-87fd-4829-9520-56746027255d',
    },

    buenTonoMuscularUuid: {
      _type: Type.ConceptUuid,
      _description: 'Buen tono muscular',
      _default: '7d3f083e-2de8-4e7b-b7e4-f81a97caa469',
    },

    secadoYEstimulaciNUuid: {
      _type: Type.ConceptUuid,
      _description: 'Secado y estimulación',
      _default: 'bd51a8e2-7333-4ae9-a346-ec20c4f2d9d4',
    },

    soporteDeOxGenoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Soporte de oxígeno',
      _default: '06e7e25f-23c5-4035-800a-d86f598d50cf',
    },

    paladarHendidoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Paladar hendido',
      _default: '20991ee5-a41a-4723-b19d-c18a2d74b887',
    },

    abducciNTotalUuid: {
      _type: Type.ConceptUuid,
      _description: 'Abducción Total',
      _default: '3c4e1af3-19d4-48d5-9751-08d46122bdb7',
    },

    observaciNUuid: {
      _type: Type.ConceptUuid,
      _description: 'Observación',
      _default: 'f947a4ad-3d8d-4516-8e6b-67b3dca4e227',
    },

    overlappingUuid: {
      _type: Type.ConceptUuid,
      _description: 'Overlapping',
      _default: '4bcc771a-a2f2-4b17-99a6-7b23fa03b693',
    },

    curaciNDelCordNUmbilicalUuid: {
      _type: Type.ConceptUuid,
      _description: 'Curación del cordón umbilical',
      _default: 'cf212131-3114-4aed-bf54-00bc3f5e6909',
    },

    cambioDeCampoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Cambio de campo',
      _default: '4eb2c9bd-597a-4da2-9ab2-4b09fca1d692',
    },

    registroDeEliminaciNDeDeposiciNUuid: {
      _type: Type.ConceptUuid,
      _description: 'Registro de eliminación de deposición',
      _default: 'e2c3e11a-1e9b-4fa0-9630-5cc6b6a120fb',
    },

    reciNNacidoATRminoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Recién Nacido a término',
      _default: 'fac78eca-7740-4715-bfb5-047f61e7e420',
    },

    amplioUuid: {
      _type: Type.ConceptUuid,
      _description: 'Amplio',
      _default: 'f8ebe482-9d6a-4c3a-a0c4-2d03ab52f4e3',
    },

    contactoPielAPielMenorDe45MinutosUuid: {
      _type: Type.ConceptUuid,
      _description: 'Contacto piel a piel (menor de 45 minutos)',
      _default: 'e652abb8-5ea9-4474-99e4-80fbeae39583',
    },

    secreciNUuid: {
      _type: Type.ConceptUuid,
      _description: 'Secreción',
      _default: 'e41d144b-98a6-405a-bc6b-a2c13174f623',
    },

    caderaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Cadera',
      _default: 'ca9f422f-f103-43c4-ae56-1b43bc2e7ec1',
    },

    permeabilidadUuid: {
      _type: Type.ConceptUuid,
      _description: 'Permeabilidad',
      _default: 'f49edae8-ea0c-4013-8452-4dde09d7f8a7',
    },

    valoraciNDeTestDeSilvermanUuid: {
      _type: Type.ConceptUuid,
      _description: 'Valoración de test de Silverman',
      _default: '21d6e05e-1aed-4b23-bdd0-70f41ff8ba59',
    },

    earlyUmbilicalCordClampingUuid: {
      _type: Type.ConceptUuid,
      _description: 'Early umbilical cord clamping',
      _default: '115f8a90-758e-4fd9-ba4a-73a3e9d53a03',
    },

    respiratoryRateUuid: {
      _type: Type.ConceptUuid,
      _description: 'Respiratory rate',
      _default: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },

    birthLengthUuid: {
      _type: Type.ConceptUuid,
      _description: 'Birth length',
      _default: '14e7654a-5448-40d8-a822-aa2438468d63',
    },

    cpapPresiNPositivaContinuaEnLasVAsRespiratoriasUuid: {
      _type: Type.ConceptUuid,
      _description: 'CPAP (presión positiva continua en las vías respiratorias)',
      _default: '7789ea2d-576f-4d65-ac1b-59c22017b26d',
    },

    cordNUmbilicalUuid: {
      _type: Type.ConceptUuid,
      _description: 'Cordón Umbilical',
      _default: '7f75f2a9-3531-4f9a-b2ac-eaf61d74f614',
    },

    valoraciNInmediataDelReciNNacidoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Valoración Inmediata del Recién Nacido',
      _default: '7dbb1546-3eef-4983-99ad-4c7f065cf093',
    },

    permeabilidadCoanasUuid: {
      _type: Type.ConceptUuid,
      _description: 'Permeabilidad coanas',
      _default: '7b6b8230-ab0e-4369-9336-be890f96f899',
    },

    bocaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Boca',
      _default: '1a512c73-916f-4df3-938d-6f2c3d705fc3',
    },

    tenseFontanelleUuid: {
      _type: Type.ConceptUuid,
      _description: 'Tense fontanelle',
      _default: 'ca25b8ee-2d8e-46d2-8530-cf43756bedbf',
    },

    pinkUuid: {
      _type: Type.ConceptUuid,
      _description: 'Pink',
      _default: 'bfef8539-e00b-4c81-b3c8-79af87562e24',
    },

    venaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Vena',
      _default: 'b4e6c2aa-0681-44b3-9c29-1cd8a97f482d',
    },

    barlowUuid: {
      _type: Type.ConceptUuid,
      _description: 'Barlow',
      _default: '7609af7a-e3c6-4343-9ebb-dd1d934f2fc4',
    },

    hipotNicoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Hipotónico',
      _default: '0bfab536-ae4d-45bf-929a-86d93d6a6821',
    },

    arteriaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Arteria',
      _default: '4e399345-d4b1-4be3-ba1a-848bb528e479',
    },

    suturasUuid: {
      _type: Type.ConceptUuid,
      _description: 'Suturas',
      _default: 'dde87a4f-cd8c-4fe7-b7ef-f0f43bb31637',
    },

    cuestionarioInmediatoParaNacimientoDelNiOUuid: {
      _type: Type.ConceptUuid,
      _description: 'Cuestionario inmediato para nacimiento del niño',
      _default: '517afc20-481d-4cdf-ba88-5641418aa762',
    },

    meconioUuid: {
      _type: Type.ConceptUuid,
      _description: 'Meconio',
      _default: '00d885b6-cef3-40d6-8872-f5f2614ca50a',
    },

    vivoCuidadoDeRutinaUuid: {
      _type: Type.ConceptUuid,
      _description: 'Vivo-cuidado de rutina',
      _default: '4c97f29b-c114-468f-887a-cd86447a6f10',
    },

    contactoPielAPielUuid: {
      _type: Type.ConceptUuid,
      _description: 'Contacto Piel a Piel',
      _default: '3bbebee4-ccc8-4a01-a5e8-14f9222a6827',
    },

    hipertNicoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Hipertónico',
      _default: '9c20bae5-2db2-466f-9edc-aba7c883c9f4',
    },

    lactanciaMaternaExclusivaEnLaPrimeraHoraUuid: {
      _type: Type.ConceptUuid,
      _description: 'Lactancia materna exclusiva en la primera hora',
      _default: 'bbd7e710-9774-4981-8a92-2e7c497a92cd',
    },

    abdomenDepresibleUuid: {
      _type: Type.ConceptUuid,
      _description: 'Abdomen depresible',
      _default: '432c2ab4-805f-4da5-80dd-9f477c55a140',
    },

    extremidadesUuid: {
      _type: Type.ConceptUuid,
      _description: 'Extremidades',
      _default: '46dc8706-c1af-4b04-b5d8-7432de862fef',
    },

    naciMuertoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Nació muerto',
      _default: '740f595f-8933-4ede-9151-bb1dfb07a4ea',
    },

    cilNdricoYMVilUuid: {
      _type: Type.ConceptUuid,
      _description: 'Cilíndrico y Móvil',
      _default: 'aa4f004b-4658-4245-9503-720f58c3e4ec',
    },

    apgarScoreAt5MinutesUuid: {
      _type: Type.ConceptUuid,
      _description: 'APGAR score at 5 minutes',
      _default: '0f3be2f6-986f-4928-8761-b531044c1f36',
    },

    evaluacionesDelReciNNacidoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Evaluaciones del recién nacido',
      _default: 'ebe4e1c4-7f4f-4779-a8b3-8b2e5a5cc9b6',
    },

    caputSuccedNeoUuid: {
      _type: Type.ConceptUuid,
      _description: 'Caput succedáneo',
      _default: '2aa0b1d8-8af5-4073-8319-d69810dfea6f',
    },

    genitoUrinarioUuid: {
      _type: Type.ConceptUuid,
      _description: 'Genito Urinario',
      _default: '57746a04-5f9e-4e42-9233-efeeeb3db0d0',
    },

    simetrAUuid: {
      _type: Type.ConceptUuid,
      _description: 'Simetría',
      _default: '2d5f4a09-5736-4855-8f10-84a2ad244cea',
    },

    gastricLavageUuid: {
      _type: Type.ConceptUuid,
      _description: 'Gastric lavage',
      _default: '0d17ad63-b1c0-46db-b8e7-c4c2d8343edf',
    },

    depressedFontanelleUuid: {
      _type: Type.ConceptUuid,
      _description: 'Depressed fontanelle',
      _default: '332ed3fb-9da3-46e1-8143-52faccb7bd68',
    },
  },

  vitals: {
    useFormEngine: {
      _type: Type.Boolean,
      _default: false,
      _description:
        'Whether to use an Ampath form as the vitals and biometrics form. If set to true, encounterUuid and formUuid must be set as well.',
    },
    encounterTypeUuid: {
      _type: Type.UUID,
      _default: '2v3w4x5y-2234-5678-9101-abcdefghij22',
    },
    logo: {
      src: {
        _type: Type.String,
        _default: null,
        _description: 'A path or URL to an image. Defaults to the OpenMRS SVG sprite.',
      },
      alt: {
        _type: Type.String,
        _default: 'Logo',
        _description: 'Alt text, shown on hover',
      },
      name: {
        _type: Type.String,
        _default: null,
        _description: 'The organization name displayed when image is absent',
      },
    },
    showPrintButton: {
      _type: Type.Boolean,
      _default: false,
      _description:
        'Determines whether or not to display the Print button in the vitals datatable header. If set to true, a Print button gets shown as the right-most item in the table header. When clicked, this button enables the user to print out the contents of the table',
    },
    formUuid: {
      _type: Type.UUID,
      _default: '9f26aad4-244a-46ca-be49-1196df1a8c9a',
    },
    formName: {
      _type: Type.String,
      _default: 'Vitals',
    },
    useMuacColors: {
      _type: Type.Boolean,
      _default: false,
      _description: 'Whether to show/use MUAC color codes. If set to true, the input will show status colors.',
    },
  },

  biometrics: {
    bmiUnit: {
      _type: Type.String,
      _default: 'kg / m²',
    },
  },

  // 8. Special Clinics
  specialClinics: {
    _type: Type.Array,
    _description: 'List of special clinics',
    _default: [
      {
        id: 'dental-clinic',
        title: 'Atención de Odontología',
        formUuid: '4x5y6z7a-4234-5678-9101-abcdefghij24',
        encounterTypeUuid: '4x5y6z7a-4234-5678-9101-abcdefghij24',
      },
      {
        id: 'psicologia-clinic',
        title: 'Psicologia',
        formUuid: '32e43fc9-6de3-48e3-aafe-3b92f167753d',
        encounterTypeUuid: '9i0j1k2l-9234-5678-9101-abcdefghij09',
      },
      {
        id: 'physiotherapy-clinic',
        title: 'Terapia Fisica',
        formUuid: 'fdada8da-75fe-44c6-93e1-782d41e5565b',
        encounterTypeUuid: '465a92f2-baf8-42e9-9612-53064be868e8',
      },
    ],
  },

  // 9. Registration Encounter
  registrationEncounterUuid: {
    _type: Type.String,
    _description: 'Registration encounter UUID',
    _default: 'de1f9d67-b73e-4e1b-90d0-036166fc6995',
  },

  // 10. Registration Obs
  registrationObs: {
    encounterTypeUuid: {
      _type: Type.UUID,
      _default: null,
      _description:
        'Obs created during registration will be associated with an encounter of this type. Required for fields of type `obs`.',
    },
    encounterProviderRoleUuid: {
      _type: Type.UUID,
      _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
      _description: "Provider role to use for the registration encounter. Default is 'Unknown'.",
    },
    registrationFormUuid: {
      _type: Type.UUID,
      _default: null,
      _description: 'Form UUID to associate with the registration encounter. By default, none.',
    },
  },

  // 11. OpenMRS ID
  defaultIDUuid: {
    _type: Type.String,
    _description: 'HSC Identifier UUID',
    _default: '05a29f94-c0ed-11e2-94be-8c13b969e334',
  },

  // 12. Marital Status
  maritalStatusUuid: {
    _type: Type.String,
    _description: 'Marital status concept UUID',
    _default: 'aa345a81-3811-4e9c-be18-d6be727623e0',
  },

  // 13. IDgEN Identifier Source
  defaultIdentifierSourceUuid: {
    _type: Type.String,
    _description: 'IdGen de Identificador HSC',
    _default: '8549f706-7e85-4c1d-9424-217d50a2988b',
  },

  // 14. HIV Program
  hivProgramUuid: {
    _type: Type.String,
    _description: 'HIV Program UUID',
    _default: 'dfdc6d40-2f2f-463d-ba90-cc97350441a8',
  },

  // 16. Contact Person Attributes (TO BE DEFINED)
  contactPersonAttributesUuid: {
    _type: Type.Object,
    _description: 'Contact created patient attributes UUID',
    _default: {
      telephone: 'b2c38640-2603-4629-aebd-3b54f33f1e3a',
      baselineHIVStatus: '3ca03c84-632d-4e53-95ad-91f1bd9d96d6',
      contactCreated: '7c94bd35-fba7-4ef7-96f5-29c89a318fcf',
      preferedPnsAproach: '59d1b886-90c8-4f7f-9212-08b20a9ee8cf',
      livingWithContact: '35a08d84-9f80-4991-92b4-c4ae5903536e',
      contactipvOutcome: '49c543c2-a72a-4b0a-8cca-39c375c0726f',
    },
  },

  // 17. Family Relationship Types
  familyRelationshipsTypeList: {
    _type: Type.Array,
    _description: 'Lista de relaciones familiares (used to list contacts)',
    _default: [
      { uuid: '8d91a210-c2cc-11de-8d13-0010c6dffdff', display: 'Madre' },
      { uuid: '8d91a210-c2cc-11de-8d13-0010c6dffd0f', display: 'Padre' },
      { uuid: '8d91a01c-c2cc-11de-8d13-0010c6dffd0f', display: 'Hermano' },
      { uuid: '5c2f978d-3b7d-493c-9e8f-cb3d1c0b6a55', display: 'Abuelo' },
      { uuid: '8d91a3dc-c2cc-11de-8d13-0010c6dffd0f', display: 'Tío' },
      { uuid: '8d91a3dc-c2cc-11de-8d13-0010c6dffd00', display: 'Sobrino' },
      { uuid: 'a2b5c9f8-0d2a-4bdf-8d9b-6f3b2d1e5a2f', display: 'Otro' },
    ],
  },

  // 13. Legend Configuration
  legend: {
    _type: Type.Object,
    _description: 'Configuration for legend display in UI components',
    colorDefinitions: {
      _type: Type.Array,
      _description: 'Array of concept UUIDs and their associated colors',
      _default: [
        {
          conceptUuid: 'example-uuid-1',
          colour: '#FF0000', // Red
        },
        {
          conceptUuid: 'example-uuid-2',
          colour: '#00FF00', // Green
        },
      ],
      _elements: {
        _type: Type.Object,
        conceptUuid: {
          _type: Type.ConceptUuid,
          _description: 'UUID of the concept to associate with a color',
        },
        colour: {
          _type: Type.String,
          _description: 'CSS color value (e.g., hex, RGB, color name)',
        },
      },
    },
    legendConceptSet: {
      _type: Type.ConceptUuid,
      _description: 'UUID of the concept set used for legend items',
      _default: 'example-concept-set-uuid',
    },
  },

  // 18. PNS Relationships
  pnsRelationships: {
    _type: Type.Array,
    _description: 'List of Partner relationships (PNS - Partner Notification Service)',
    _default: [
      { uuid: '6b1c5e8f-32f7-41b3-bc2a-8b3e97a6d937', display: 'Esposo', sexual: true },
      { uuid: '1e3f4a5b-6789-4cde-9101-abcdef123457', display: 'Pareja/Pareja', sexual: true },
      { uuid: 'a2b5c9f8-0d2a-4bdf-8d9b-6f3b2d1e5a2f', display: 'Otro' },
    ],
  },
};

// --------------- INTERFACES ---------------
export interface BiometricsConfigObject {
  bmiUnit: string;
  heightUnit: string;
  weightUnit: string;
}

export interface LegendConfigObject {
  legendConceptSet: string;
  colorDefinitions: Array<{
    conceptUuid: string;
    colour: string;
  }>;
}

export interface PartographyConfigObject {
  concepts: {
    obsDateUiid: string;
    timeRecordedUuid: string;
    fetalHeartRateUuid: string;
    cervicalDilationUiid: string;
    descentOfHead: string;
  };
}

export interface ConfigObject {
  encounterTypes: {
    specializedConsultation: string;
    triage: string;
    deliveryRoomCare: string;
    hivTestingServices: string;
    prenatalControl: string;
    postnatalControl: string;
    healthyChildControl: string;
    dentalCare: string;
    malnutritionAnemiaCare: string;
    obstetricUltrasound: string;
    externalConsultation: string;
    hospitalization: string;
    hospitalDischarge: string;
    emergencyCare: string;
    chronicDiseaseFollowup: string;
    mentalHealthEvaluation: string;
    medicationPrescriptionDispensation: string;
    labResults: string;
    vaccinationAdministration: string;
    healthEducationCounseling: string;
    consultation: string;
    referralCounterReferral: string;
    intraHospitalTransfer: string;
    bedAssignment: string;
    hospitalizationProgressNote: string;
    transferRequest: string;
    encounterCancellation: string;
    clinicalFileUpload: string;
    tbTreatmentSupervision: string;
    covid19Management: string;
    electiveAmbulatorySurgery: string;
    order: string;
    cefaloCaudal: string;
    consejeriaMaterna: string;
  };
  vitals: {
    useFormEngine: boolean;
    encounterTypeUuid: string;
    formUuid: string;
    formName: string;
    useMuacColors: boolean;
    showPrintButton: boolean;
  };
  biometrics: BiometricsConfigObject;
  madreGestante: Record<string, string>;
  CRED: Record<string, string>;
  caseManagementForms: Array<{
    id: string;
    title: string;
    formUuid: string;
    encounterTypeUuid: string;
  }>;
  formsList: {
    antenatal: string;
    postnatal: string;
    labourAndDelivery: string;
    atencionImmediataNewborn: string;
    maternalHistory: string;
    deliveryOrAbortion: string;
    SummaryOfLaborAndPostpartum: string;
    currentPregnancy: string;
    prenatalCare: string;
    immediatePostpartumPeriod: string;
    postpartumControl: string;
    defaulterTracingFormUuid: string;
    htsScreening: string;
    htsInitialTest: string;
    htsRetest: string;
    clinicalEncounterFormUuid: string;
    breastfeedingObservation: string;
    eedp12Months: string;
    tepsi: string;
    medicalProgressNote: string;
    eedp5Months: string;
    eedp21Months: string;
    nursingAssessment: string;
    medicalOrders: string;
    newbornNeuroEval: string;
    eedp15Months: string;
    riskInterview0to30: string;
    eedp8Months: string;
    roomingIn: string;
    eedp18Months: string;
    eedp2Months: string;
    childFeeding6to42: string;
    childAbuseScreening: string;
    epicrisis: string;
    childFeeding0to5: string;
    puerperiumLab: string;
    obstetricMonitor: string;
    obstetricHistory: string;
    obstetricProgress: string;
    obstetricAntecedents: string;
    medicalProgress: string;
    nursingNotes: string;
    therapeuticSheet: string;
    birthPlanForm: string;
    vitalSignsControl: string;
    birthSummary: string;
    puerperiumEpicrisis: string;
    puerperiumDischarge: string;
    clinicalHistory: string;
  };
  defaulterTracingEncounterUuid: string;
  clinicalEncounterUuid: string;
  concepts: Record<string, string>;
  specialClinics: Array<{
    id: string;
    formUuid: string;
    encounterTypeUuid: string;
    title: string;
  }>;
  registrationEncounterUuid: string;
  registrationObs: {
    encounterTypeUuid: string | null;
    encounterProviderRoleUuid: string;
    registrationFormUuid: string | null;
  };
  defaultIDUuid: string;
  maritalStatusUuid: string;
  defaultIdentifierSourceUuid: string;
  legend: LegendConfigObject;
  hivProgramUuid: string;
  partography: PartographyConfigObject;
  contactPersonAttributesUuid: {
    telephone: string;
    baselineHIVStatus: string;
    contactCreated: string;
    preferedPnsAproach: string;
    livingWithContact: string;
    contactipvOutcome: string;
  };
  familyRelationshipsTypeList: Array<{
    uuid: string;
    display: string;
  }>;
  pnsRelationships: Array<{
    uuid: string;
    display: string;
    sexual: boolean;
  }>;
}

export interface PartograpyComponents {
  id: string;
  date: string;
  fetalHeartRate: number;
  cervicalDilation: number;
  descentOfHead: string;
}
