import React from 'react';
import { useTranslation } from 'react-i18next';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js/auto';
import type { Scriptable, ScriptableTooltipContext, TooltipPositionerMap } from 'chart.js';
import { Chart, type Animation } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import AutoSizer from 'react-virtualized-auto-sizer';
import { differenceInMonths, differenceInWeeks, differenceInYears } from 'date-fns';
import {
  CategoryCodes,
  DataSetLabels,
  MeasurementTypeCodes,
  MeasurementTypeCodesLabel,
  TimeUnitCodes,
  timeUnitData,
  unitCodes,
} from '../config-schema';
import type { CategoryToLabel, ChartDataTypes } from '../config-schema';
import { useMeasurementPlotting } from '../hooks/useMeasurementPlotting';
import { useChartLines } from '../utils/chartLineColorPicker';

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

  const labelsToInclude = keysDataSet;

  const lines = chart.data.datasets.filter((dataset: DataSet) => labelsToInclude.includes(dataset.label));

  const extractNumberFromLabel = (label: string): number => parseFloat(label.replace(/[^\d.-]/g, ''));

  const adjustLabel = (labelText: number, originalLabel: string): string => {
    if (isPercentiles) {
      if (originalLabel === 'P01') return '0.1%';
      if (originalLabel === 'P999') return '99.9%';
      return `${labelText}%`;
    }
    if (!isPercentiles) {
      const isNegative = originalLabel.includes('neg');
      return isNegative ? `-${labelText}` : ` ${labelText}`;
    }
    return originalLabel;
  };

  const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.font = '14px Arial';
    ctx.fillText(text, x + 3, y + 4);
  };

  lines.forEach((dataset: DataSet, index: number) => {
    const meta = chart.getDatasetMeta(index);
    const [lastElement] = meta.data.slice(-1);
    const { x, y } = lastElement.getProps(['x', 'y']);

    const labelText = extractNumberFromLabel(dataset.label);
    const adjustedLabelText = adjustLabel(labelText, dataset.label);

    drawText(ctx, adjustedLabelText.toString(), x, y, dataset.borderColor);
  });
};

export interface AnnotationLabelType {
  display: boolean;
  content?: (value: number) => string;
  position?: 'top' | 'bottom' | 'center' | 'start' | 'end';
  yAdjust?: number;
}

export const GrowthChartAnnotations = (ZscoreLines: any[], datasetMetadata: any): AnnotationLabelType[] => {
  let timeUnitConfig = {
    singular: '',
    plural: '',
  };

  if (
    datasetMetadata.xAxisLabel === TimeUnitCodes.weeks ||
    Object.values(MeasurementTypeCodesLabel).includes(datasetMetadata.xAxisLabel)
  ) {
    return [];
  }

  if (datasetMetadata.xAxisLabel === TimeUnitCodes.months) {
    timeUnitConfig = timeUnitData.Years;
  }

  if (timeUnitConfig) {
    const xValues = ZscoreLines[0]?.data.map((entry: any) => entry.x) || [];

    const { divisor } = { divisor: 12 };

    const annotations = xValues
      .filter((label: number) => label % divisor === 0)
      .map((label: number) => ({
        display: true,
        type: 'line',
        scaleID: 'x',
        borderWidth: 1.2,
        value: label,
        label: {
          display: true,
          content: () => {
            const value = label / divisor;
            return `${value} ${value === 1 ? timeUnitConfig.singular : timeUnitConfig.plural}`;
          },
          position: 'end',
          yAdjust: 10,
          font: [{ size: 13, weight: 'normal' }],
          color: 'rgba(75, 75, 75)',
          backgroundColor: 'rgba(237, 237, 237)',
        },
      }));
    if ((xValues.length - 1) % 12 === 0) {
      annotations.pop();
    }
    annotations.shift();
    return annotations;
  }
  return [];
};

export const ChartTooltip = (
  category: string,
  xAxisLabel: string,
  yAxisLabel: string,
  dateOfBirth: Date,
): TooltipConfig => {
  let xUnit = '';
  let yUnit = '';
  const { t } = useTranslation();

  if (category === CategoryCodes.hcfa_b || category === CategoryCodes.hcfa_g) {
    yUnit = unitCodes.cm;
  }

  if (category === CategoryCodes.lhfa_b || category === CategoryCodes.lhfa_g) {
    yUnit = unitCodes.cm;
  }

  if (category === CategoryCodes.wfa_g || category === CategoryCodes.wfa_b) {
    yUnit = unitCodes.kg;
  }

  if (category === CategoryCodes.wflh_b || category === CategoryCodes.wflh_g) {
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
      beforeLabel: (tooltipItem) => {
        const date = new Date(tooltipItem.raw.eventDate).toLocaleDateString();
        return `${t('Date')}: ${date}`;
      },
      label: (tooltipItem) => {
        const date = new Date(tooltipItem.raw.eventDate);
        let yValue = Number(tooltipItem.formattedValue.replace(',', '.'));
        let xValue = Number(tooltipItem.label.replace(',', '.'));
        const weeks = differenceInWeeks(date, dateOfBirth);

        let xLabel = '';

        yValue = Number(yValue.toFixed(2));
        xValue = Number(xValue.toFixed(2));

        const yLabel = `${yAxisLabel}: ${yValue} ${yUnit}`;
        xLabel = `${xAxisLabel}: ${xValue} ${xUnit}`;

        if (xAxisLabel === TimeUnitCodes.weeks) {
          xLabel = `${t('Age')}: `;
          xLabel += `${weeks} ${weeks === 1 ? timeUnitData.Weeks.singular : timeUnitData.Weeks.plural} `;
        }
        if (xAxisLabel === TimeUnitCodes.months) {
          const months = differenceInMonths(date, dateOfBirth) % 12;
          const years = differenceInYears(date, dateOfBirth);

          xLabel = `${t('Age')}: `;

          if (weeks <= 13) {
            xLabel += `${weeks} ${weeks === 1 ? timeUnitData.Weeks.singular : timeUnitData.Weeks.plural} `;
          }

          if (weeks > 13) {
            if (years > 0) {
              xLabel += `${years} ${years === 1 ? timeUnitData.Years.singular : timeUnitData.Years.plural} `;
            }

            if (months > 0) {
              xLabel += `${months} ${months === 1 ? timeUnitData.Months.singular : timeUnitData.Months.plural} `;
            }
          }
        }

        const labels = [];
        labels.push(yLabel);
        labels.push(xLabel);

        return labels;
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
  // Registramos el plugin de anotación
  Chart.register(annotationPlugin);

  const { t } = useTranslation();
  const { minDataValue, maxDataValue } = yAxisValues;

  // Obtenemos el "código" de medición según la categoría (peso, altura, etc.)
  const MeasuremenCode = MeasurementTypeCodes[category];

  // Ajustes para el inicio del eje X
  const adjustIndex = dataset === DataSetLabels.y_2_5 ? 24 : 0;
  const startIndex =
    category !== CategoryCodes.wflh_b && category !== CategoryCodes.wflh_g ? adjustIndex : datasetMetadata.range.start;

  // Datos de percentiles/z-scores
  const ChartLinesData = useChartLines(
    datasetValues,
    keysDataSet,
    datasetMetadata,
    category,
    dataset,
    startIndex,
    isPercentiles,
  );

  // Datos de mediciones reales del paciente
  const MeasurementData = useMeasurementPlotting(
    measurementData,
    MeasuremenCode,
    category,
    dataset,
    dateOfBirth,
    startIndex,
  );

  // Armamos el objeto data para Chart.js
  const data: any = {
    datasets: [...ChartLinesData, ...MeasurementData],
  };

  // Anotaciones (líneas, áreas sombreadas, etc.)
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
        title: {
          display: true,
          text: t(datasetMetadata.xAxisLabel),
          font: { size: 13 },
        },
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
        title: {
          display: true,
          text: t(datasetMetadata.yAxisLabel),
          font: { size: 13 },
        },
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

  return (
    <div id="divToPrint" className="aspect-video w-full" style={{ minHeight: '400px' }}>
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <div style={{ height, width }}>
            <Line data={data} options={options} />
          </div>
        )}
      </AutoSizer>
    </div>
  );
};
