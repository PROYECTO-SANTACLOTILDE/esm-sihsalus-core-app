import React, { useMemo, useId } from 'react';
import { LineChart } from '@carbon/charts-react';
import {
  MeasurementTypeCodes,
  type CategoryCodes,
  DataSetLabels,
  GenderCodes,
  CategoryToLabel,
  type ChartData,
} from './types';
import { useChartLines } from './hooks/useChartLines';
import { useMeasurementPlotting } from './hooks/useMeasurementPlotting';
import styles from './growth-chart.scss';
import { useTranslation } from 'react-i18next';
import { Dropdown, Tooltip, TextInput } from '@carbon/react';

interface GrowthChartProps {
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
  chartData: ChartData;
  gender: string;
  setCategory: (category: keyof typeof CategoryCodes) => void;
  setDataset: (dataset: string) => void;
  setGender: (gender: keyof typeof GenderCodes) => void;
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
  chartData,
  gender,
  setCategory,
  setDataset,
  setGender,
}: GrowthChartProps) => {
  const { t } = useTranslation();
  const id = useId();

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
      points: { enabled: false },
      color: {
        scale: {
          P3: '#cc0000',
          P97: '#cc0000',
          P15: '#e67300',
          P85: '#e67300',
          P50: '#009933',
          Paciente: '#2b6693',
        },
      },
      style: {
        Paciente: { point: { radius: 3 } },
        '*': { point: { radius: 0 } },
      },
    }),
    [datasetMetadata, yAxisValues],
  );

  const genderItems = Object.values(GenderCodes).map((code) => ({
    id: code,
    text: code === GenderCodes.CGC_Female ? t('female', 'Female') : t('male', 'Male'),
  }));

  const categoryItems = Object.keys(chartData).map((key) => ({
    id: key,
    text: chartData[key].categoryMetadata.label,
  }));

  const datasetItems = Object.keys(chartData[category]?.datasets || {}).map((key) => ({
    id: key,
    text: key,
  }));

  return (
    <div className={styles.clinicalDataChartContainer}>
      <div className={styles.vitalSignsArea}>
        <div className="cds--grid cds--grid--condensed">
          <div className="cds--row cds--grid-row">
            <div className="cds--col">
              <Dropdown
                id={`${id}-gender`}
                titleText=""
                label={t('gender', 'Gender')}
                items={genderItems}
                itemToString={(item) => item?.text || ''}
                onChange={({ selectedItem }) => selectedItem && setGender(selectedItem.id)}
                size="sm"
              />
            </div>
            <div className="cds--col">
              <Dropdown
                id={`${id}-category`}
                titleText=""
                label={t('category', 'Category')}
                items={categoryItems}
                itemToString={(item) => item?.text || ''}
                onChange={({ selectedItem }) => {
                  if (selectedItem) {
                    const newCategory = selectedItem.id as keyof typeof CategoryCodes;
                    setCategory(newCategory);
                    const firstDataset = Object.keys(chartData[newCategory]?.datasets || {})[0];
                    setDataset(firstDataset);
                  }
                }}
                size="sm"
              />
            </div>
            <div className="cds--col">
              <Dropdown
                id={`${id}-dataset`}
                titleText=""
                label={t('dataset', 'Dataset')}
                items={datasetItems}
                itemToString={(item) => item?.text || ''}
                onChange={({ selectedItem }) => selectedItem && setDataset(selectedItem.id)}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.clinicalDataChartArea}>
        <LineChart data={data} options={options} />
      </div>
    </div>
  );
};
