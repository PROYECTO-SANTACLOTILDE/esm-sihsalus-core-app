import { timeUnitData, TimeUnitCodes, MeasurementTypeCodesLabel } from '../config-schema';
import type { Animation, Chart } from 'chart.js';

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
