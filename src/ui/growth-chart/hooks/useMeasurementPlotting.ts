import { DataSetLabels, CategoryCodes } from '../types';
import type { DataSetLabelValues, MeasurementData } from '../types';

export function useMeasurementPlotting(
  measurementData: MeasurementData[] | undefined,
  fieldName: string,
  category: string,
  dataset: string,
  dateOfBirth: Date,
  startIndex: number,
) {
  const measurementDataValues: { x: Date | number | string; y: number; eventDate?: Date }[] = [];

  if (!measurementData) return [];

  const processEntry = (entry: MeasurementData) => {
    let xValue: Date | number | string;
    let yValue: number;

    if (category === CategoryCodes.wflh_b || category === CategoryCodes.wflh_g) {
      xValue = parseFloat(entry.dataValues.height);
      yValue = parseFloat(entry.dataValues.weight);
    } else {
      const xValueDecimalDate = calculateDecimalDate(entry.eventDate.toISOString(), dataset, dateOfBirth);
      xValue = xValueDecimalDate;
      yValue = parseFloat(entry.dataValues[fieldName]);
    }

    measurementDataValues.push({ x: xValue, y: yValue, eventDate: entry.eventDate });
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

function calculateDecimalDate(date: Date | string, dataset: string, dateOfBirth: Date): string | null {
  const observationDate = typeof date === 'string' ? new Date(date) : date;
  const diffInMs = observationDate.getTime() - dateOfBirth.getTime();
  const msPerDay = 1000 * 60 * 60 * 24;

  if (isNaN(diffInMs)) return null;

  const weeks = diffInMs / (msPerDay * 7);
  const months = diffInMs / (msPerDay * 30.44); // promedio exacto de mes

  switch (dataset) {
    case DataSetLabels.w_0_13:
      return weeks >= 0 && weeks <= 13 ? weeks.toFixed(2) : null;

    case DataSetLabels.y_0_2:
      return months >= 0 && months <= 24 ? months.toFixed(2) : null;

    case DataSetLabels.y_0_5:
    case DataSetLabels.y_2_5:
      return months >= 0 && months <= 60 ? months.toFixed(2) : null;

    default:
      return null;
  }
}
