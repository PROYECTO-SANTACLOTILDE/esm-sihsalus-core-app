import { useMemo, useEffect, useState } from 'react';
import { restBaseUrl, fhirBaseUrl, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { DataSetLabels, GenderCodes, CategoryCodes } from '../config-schema';
import { calculateDecimalDate } from '../utils/calculateDecimalDate';
import type {
  ChartData,
  MeasurementData,
  PatientInfo,
  ChartDataForGenderProps,
  ObservationResponse,
  DataSetLabelValues,
  MeasurementDataEntry,
} from '../config-schema';

export function useMeasurementPlotting (
  measurementData: MeasurementDataEntry[] | undefined,
  fieldName: string,
  category: string,
  dataset: string,
  dateOfBirth: Date,
  startIndex: number,
) {
  const measurementDataValues: { x: Date | number | string; y: number; eventDate?: Date }[] = [];

  if (!measurementData) {
    return [];
  }

  const processEntry = (entry: MeasurementDataEntry) => {
    let xValue: Date | number | string;
    let yValue: number;

    if (category === CategoryCodes.wflh_b || category === CategoryCodes.wflh_g) {
      xValue = parseFloat(String(entry.dataValues.height));
      yValue = parseFloat(String(entry.dataValues.weight));
    } else {
      const dateString: string = typeof entry.eventDate === 'string' ? entry.eventDate : entry.eventDate.toISOString();
      const xValueDecimalDate: string = calculateDecimalDate(dateString, dataset, dateOfBirth);
      xValue = xValueDecimalDate;
      yValue = parseFloat(String(entry.dataValues[fieldName]));
    }

    const eventDateValue = new Date(entry.eventDate);
    measurementDataValues.push({
      x: xValue,
      y: yValue,
      eventDate: eventDateValue,
    });
  };

  const validDatasets = Object.values(DataSetLabels) as DataSetLabelValues[];
  if (validDatasets.includes(dataset as DataSetLabelValues)) {
    measurementData.forEach(processEntry);

    if (dataset !== DataSetLabels.y_2_5) {
      measurementDataValues.filter((data) => typeof data.x === 'number' && data.x >= startIndex);
    }
  }

  return [
    {
      id: 'measurementData',
      data: measurementDataValues,
      borderWidth: 1.5,
      borderColor: 'rgba(43,102,147,255)',
      pointRadius: 3,
      pointBackgroundColor: 'rgba(43,102,147,255)',
      fill: false,
      borderDash: [5, 5],
    },
  ];
}

