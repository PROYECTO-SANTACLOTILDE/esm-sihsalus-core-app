import React from 'react';
import { useTranslation } from 'react-i18next';
import { Line } from 'react-chartjs-2';
import {
  type ChartOptions,
  type Animation,
  type Scriptable,
  type ScriptableTooltipContext,
  type TooltipPositionerMap,
} from 'chart.js';
import Chart from 'chart.js/auto';

import annotationPlugin from 'chartjs-plugin-annotation';
import { differenceInMonths, differenceInWeeks, differenceInYears } from 'date-fns';

import {
  CategoryCodes,
  DataSetLabels,
  MeasurementTypeCodes,
  MeasurementTypeCodesLabel,
  TimeUnitCodes,
  timeUnitData,
  unitCodes,
  type CategoryToLabel,
  type ChartDataTypes,
} from '../config-schema';

import { useMeasurementPlotting } from '../hooks/useMeasurementPlotting';
import { useChartLines } from '../hooks/useChartLines';

interface TooltipConfig {
  enabled: boolean;
  intersect: boolean;
  position: Scriptable<keyof TooltipPositionerMap, ScriptableTooltipContext<'line'>>;
  backgroundColor: string;
  bodyFont: { size: number };
  bodyColor: string;
  borderColor: string;
  borderWidth: number;
  padding: number;
  caretPadding: number;
  boxPadding: number;
  usePointStyle: boolean;
  animation: any;
  filter: (tooltipItem: any) => boolean;
  callbacks: {
    title: () => string;
    beforeLabel: (tooltipItem: any) => string;
    label: (tooltipItem: any) => string[];
  };
}

interface DataSet {
  data: number[];
  borderWidth: number;
  borderColor: string;
  label: string;
}

export const AnnotateLineEnd = (
  animation: Animation & { chart?: Chart },
  isPercentiles: boolean,
  keysDataSet: string[],
) => {
  const { chart } = animation;
  if (!chart) return;

  const { ctx } = chart;

  chart.data.datasets
    .filter((dataset: DataSet) => keysDataSet.includes(dataset.label))
    .forEach((dataset: DataSet, index: number) => {
      const meta = chart.getDatasetMeta(index);
      const [lastElement] = meta.data.slice(-1);
      const { x, y } = lastElement.getProps(['x', 'y']);

      const labelText = parseFloat(dataset.label.replace(/[^\d.-]/g, ''));
      let label = dataset.label;

      if (isPercentiles) {
        if (label === 'P01') label = '0.1%';
        else if (label === 'P999') label = '99.9%';
        else label = `${labelText}%`;
      } else {
        const isNegative = label.includes('neg');
        label = isNegative ? `-${labelText}` : ` ${labelText}`;
      }

      ctx.fillStyle = dataset.borderColor;
      ctx.font = '14px Arial';
      ctx.fillText(label, x + 3, y + 4);
    });
};

export interface AnnotationLabelType {
  display: boolean;
  content?: (value: number) => string;
  position?: 'top' | 'bottom' | 'center' | 'start' | 'end';
  yAdjust?: number;
}

export const GrowthChartAnnotations = (ZscoreLines: any[], datasetMetadata: any): AnnotationLabelType[] => {
  if (
    datasetMetadata.xAxisLabel === TimeUnitCodes.weeks ||
    Object.values(MeasurementTypeCodesLabel).includes(datasetMetadata.xAxisLabel)
  )
    return [];

  const xValues = ZscoreLines[0]?.data.map((entry: any) => entry.x) || [];
  const annotations = xValues
    .filter((label: number) => label % 12 === 0)
    .map((label: number) => ({
      display: true,
      type: 'line',
      scaleID: 'x',
      borderWidth: 1.2,
      value: label,
      label: {
        display: true,
        content: () => {
          const value = label / 12;
          const { singular, plural } = timeUnitData.Years;
          return `${value} ${value === 1 ? singular : plural}`;
        },
        position: 'end',
        yAdjust: 10,
        font: [{ size: 13, weight: 'normal' }],
        color: 'rgba(75, 75, 75)',
        backgroundColor: 'rgba(237, 237, 237)',
      },
    }));

  if ((xValues.length - 1) % 12 === 0) annotations.pop();
  annotations.shift();
  return annotations;
};

export const ChartTooltip = (
  category: string,
  xAxisLabel: string,
  yAxisLabel: string,
  dateOfBirth: Date,
): TooltipConfig => {
  const { t } = useTranslation();
  let xUnit = '',
    yUnit = '';

  if (
    [CategoryCodes.hcfa_b, CategoryCodes.hcfa_g, CategoryCodes.lhfa_b, CategoryCodes.lhfa_g].includes(category as any)
  ) {
    yUnit = unitCodes.cm;
  }
  if ([CategoryCodes.wfa_b, CategoryCodes.wfa_g].includes(category as any)) {
    yUnit = unitCodes.kg;
  }
  if ([CategoryCodes.wflh_b, CategoryCodes.wflh_g].includes(category as any)) {
    xUnit = unitCodes.cm;
    yUnit = unitCodes.kg;
  }

  return {
    enabled: true,
    intersect: false,
    position: 'nearest',
    backgroundColor: 'white',
    bodyFont: { size: 12 },
    bodyColor: 'black',
    borderColor: 'black',
    borderWidth: 1,
    padding: 12,
    caretPadding: 4,
    boxPadding: 4,
    usePointStyle: true,
    animation: false,
    filter: (tooltipItem) => tooltipItem.dataset.id === 'measurementData',
    callbacks: {
      title: () => '',
      beforeLabel: (tooltipItem) => `${t('Date')}: ${new Date(tooltipItem.raw.eventDate).toLocaleDateString()}`,
      label: (tooltipItem) => {
        const date = new Date(tooltipItem.raw.eventDate);
        const yValue = Number(tooltipItem.formattedValue.replace(',', '.')).toFixed(2);
        const xValue = Number(tooltipItem.label.replace(',', '.')).toFixed(2);
        const weeks = differenceInWeeks(date, dateOfBirth);

        let xLabel = `${xAxisLabel}: ${xValue} ${xUnit}`;
        if (xAxisLabel === TimeUnitCodes.weeks) {
          xLabel = `${t('Age')}: ${weeks} ${weeks === 1 ? timeUnitData.Weeks.singular : timeUnitData.Weeks.plural}`;
        } else if (xAxisLabel === TimeUnitCodes.months) {
          const months = differenceInMonths(date, dateOfBirth) % 12;
          const years = differenceInYears(date, dateOfBirth);

          xLabel = `${t('Age')}: `;
          if (weeks <= 13) {
            xLabel += `${weeks} ${weeks === 1 ? timeUnitData.Weeks.singular : timeUnitData.Weeks.plural}`;
          } else {
            if (years > 0)
              xLabel += `${years} ${years === 1 ? timeUnitData.Years.singular : timeUnitData.Years.plural} `;
            if (months > 0)
              xLabel += `${months} ${months === 1 ? timeUnitData.Months.singular : timeUnitData.Months.plural}`;
          }
        }

        return [`${yAxisLabel}: ${yValue} ${yUnit}`, xLabel];
      },
    },
  };
};

interface GrowthChartBuilderProps extends ChartDataTypes {
  category: keyof typeof CategoryToLabel;
  dataset: string;
  dateOfBirth: Date;
  isPercentiles: boolean;
}

export const GrowthChartBuilder = ({
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
  Chart.register(annotationPlugin);
  const { t } = useTranslation();
  const { minDataValue, maxDataValue } = yAxisValues;

  const MeasuremenCode = MeasurementTypeCodes[category];
  const adjustIndex = dataset === DataSetLabels.y_2_5 ? 24 : 0;
  const startIndex = [CategoryCodes.wflh_b, CategoryCodes.wflh_g].includes(
    category as typeof CategoryCodes.wflh_b | typeof CategoryCodes.wflh_g,
  )
    ? datasetMetadata.range.start
    : adjustIndex;

  const ChartLinesData = useChartLines(
    datasetValues,
    keysDataSet,
    datasetMetadata,
    category,
    dataset,
    startIndex,
    isPercentiles,
  );
  const MeasurementData = useMeasurementPlotting(
    measurementData,
    MeasuremenCode,
    category,
    dataset,
    dateOfBirth,
    startIndex,
  );

  const data = { datasets: [...ChartLinesData, ...MeasurementData] };
  const annotations = GrowthChartAnnotations(ChartLinesData, datasetMetadata);

  const options: ChartOptions<'line'> = {
    elements: { point: { radius: 0, hoverRadius: 0 } },
    plugins: {
      annotation: { annotations },
      legend: { display: false },
      tooltip: ChartTooltip(category, datasetMetadata.xAxisLabel, datasetMetadata.yAxisLabel, dateOfBirth),
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: t(datasetMetadata.xAxisLabel), font: { size: 13 } },
        min: datasetMetadata.range.start,
        max: datasetMetadata.range.end,
        ticks: {
          stepSize: 1,
          callback: (value: number, index, values) => {
            if (datasetMetadata.xAxisLabel === 'Months') {
              const isFirstTick = index === 0;
              const isLastTick = index === values.length - 1;
              if (isFirstTick || isLastTick) {
                const years = value / 12;
                return `${years} ${years === 1 ? t('Year') : t('Years')}`;
              }
              const modulo = value % 12;
              return modulo === 0 ? '' : modulo;
            }
            return value;
          },
        },
      },
      y: {
        title: { display: true, text: t(datasetMetadata.yAxisLabel), font: { size: 13 } },
        position: 'left',
        min: minDataValue,
        max: maxDataValue,
      },
      yRight: {
        position: 'right',
        min: minDataValue,
        max: maxDataValue,
        ticks: { padding: isPercentiles ? 36 : 18 },
      },
    },
    animation: {
      onComplete: (chartAnimation: any) => AnnotateLineEnd(chartAnimation, isPercentiles, keysDataSet),
      onProgress: (chartAnimation: any) => AnnotateLineEnd(chartAnimation, isPercentiles, keysDataSet),
    },
  };

  return <Line data={data} options={options} />;
};
