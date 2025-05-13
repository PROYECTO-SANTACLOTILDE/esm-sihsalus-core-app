// Updated GrowthChartBuilder.tsx
import React, { useMemo } from 'react';
import { LineChart } from '@carbon/charts-react';
import { MeasurementTypeCodes, type CategoryCodes, DataSetLabels } from '../types';
import { useChartLines } from '../hooks/useChartLines';
import { useMeasurementPlotting } from '../hooks/useMeasurementPlotting';

interface GrowthChartBuilderProps {
  datasetValues: { [key: string]: number }[];
  datasetMetadata: {
    xAxisLabel: string;
    yAxisLabel: string;
    range: { start: number; end: number };
  };
  yAxisValues: { minDataValue: number; maxDataValue: number };
  keysDataSet: string[];
  measurementData: any[];
  category: keyof typeof CategoryCodes;
  dataset: string;
  dateOfBirth: Date;
  isPercentiles: boolean;
}

export const GrowthChart = ({
  datasetValues,
  datasetMetadata,
  yAxisValues,
  keysDataSet,
  measurementData,
  category,
  dataset,
  dateOfBirth,
  isPercentiles,
}: GrowthChartBuilderProps) => {
  const measurementCode = MeasurementTypeCodes[category];

  const adjustIndex = dataset === DataSetLabels.y_2_5 ? 24 : 0;

  const isWFLH = category === 'wflh_b' || category === 'wflh_g';
  const startIndex = isWFLH ? datasetMetadata.range.start : adjustIndex;

  const chartLineData = useChartLines(datasetValues, keysDataSet, startIndex, isPercentiles);

  const measurementPlotData = useMeasurementPlotting(
    measurementData,
    measurementCode,
    category,
    dataset,
    dateOfBirth,
    startIndex,
  ).flatMap((series) =>
    series.data.map((point: any) => ({
      group: 'Paciente',
      date: point.x,
      value: point.y,
    })),
  );

  const data = [...chartLineData, ...measurementPlotData];

  const options = useMemo(
    () => ({
      axes: {
        bottom: {
          title: datasetMetadata.xAxisLabel,
          mapsTo: 'date',
          scaleType: 'linear',
        },
        left: {
          title: datasetMetadata.yAxisLabel,
          mapsTo: 'value',
          scaleType: 'linear',
          domain: [yAxisValues.minDataValue, yAxisValues.maxDataValue],
        },
      },
      legend: { enabled: true },
      height: '400px',
      tooltip: { enabled: true },
      points: {
        enabled: false,
      },
      color: {
        scale: {
          P3: '#cc0000', // rojo más suave
          P97: '#cc0000', // rojo más suave
          P15: '#e67300', // naranja más suave
          P85: '#e67300', // naranja más suave
          P50: '#009933', // verde más suave
          Paciente: '#2b6693', // azul original (sin cambios)
        },
      },
      style: {
        Paciente: {
          point: { radius: 3 },
        },
        '*': {
          point: { radius: 0 },
        },
      },
    }),
    [datasetMetadata, yAxisValues],
  );

  return <LineChart data={data} options={options} />;
};
