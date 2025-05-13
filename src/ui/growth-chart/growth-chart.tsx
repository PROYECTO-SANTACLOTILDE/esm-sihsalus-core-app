import React, { useMemo, useId } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Dropdown, Tab, Tabs, TabList } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import styles from './growth-chart.scss';

import { useChartLines } from './hooks/useChartLines';
import { MeasurementTypeCodes, type CategoryCodes, DataSetLabels, GenderCodes } from './types';
import { useMeasurementPlotting } from './hooks/useMeasurementPlotting';
import { useChartDataForGender } from './hooks/useChartDataForGender';
import { useAppropriateChartData } from './hooks/useAppropriateChartData';
import { chartData as defaultChartData } from './data-sets/WhoStandardDataSets/ChartData';
import { differenceInMonths, differenceInWeeks } from 'date-fns';

enum ScaleTypes {
  LABELS = 'labels',
  LINEAR = 'linear',
  TIME = 'time',
}

interface GrowthChartProps {
  measurementData: any[];
  dateOfBirth: Date;
  gender: string;
  setGender: (gender: keyof typeof GenderCodes) => void;
}

function calculateMinMaxValues(datasetValues: Array<Record<string, unknown>>) {
  if (!datasetValues || datasetValues.length === 0) return { min: 0, max: 0 };
  const flatValues: number[] = datasetValues.flatMap((entry) =>
    Object.values(entry).filter((value): value is number => typeof value === 'number' && Number.isFinite(value)),
  );
  if (flatValues.length === 0) return { min: 0, max: 0 };
  const min = flatValues.reduce((acc, val) => Math.min(acc, val), Infinity);
  const max = flatValues.reduce((acc, val) => Math.max(acc, val), -Infinity);
  return { min, max };
}

function determineStartIndex(category: keyof typeof CategoryCodes, dataset: string, metadataRangeStart: number) {
  const adjustIndex = dataset === DataSetLabels.y_2_5 ? 24 : 0;
  const isWFLH = category === 'wflh_b' || category === 'wflh_g';
  return isWFLH ? metadataRangeStart : adjustIndex;
}

const GrowthChart: React.FC<GrowthChartProps> = ({
  measurementData,
  dateOfBirth,
  gender,
  setGender,
}: GrowthChartProps) => {
  const { t } = useTranslation();
  const id = useId();

  const { chartDataForGender } = useChartDataForGender(gender, defaultChartData);
  const defaultIndicator = useMemo(() => Object.keys(chartDataForGender)[0] ?? '', [chartDataForGender]);
  const childAgeInWeeks = useMemo(() => differenceInWeeks(new Date(), dateOfBirth), [dateOfBirth]);
  const childAgeInMonths = useMemo(() => differenceInMonths(new Date(), dateOfBirth), [dateOfBirth]);

  const { selectedCategory, selectedDataset, setSelectedCategory, setSelectedDataset } = useAppropriateChartData(
    chartDataForGender,
    defaultIndicator,
    gender,
    childAgeInWeeks,
    childAgeInMonths,
  );

  const dataSetEntry = chartDataForGender[selectedCategory]?.datasets?.[selectedDataset];

  const datasetMetadata = useMemo(
    () =>
      dataSetEntry?.metadata ?? {
        chartLabel: '',
        yAxisLabel: '',
        xAxisLabel: '',
        range: { start: 0, end: 0 },
      },
    [dataSetEntry],
  );

  const isPercentiles = true;
  const dataSetValues = useMemo(
    () => (isPercentiles ? (dataSetEntry?.percentileDatasetValues ?? []) : (dataSetEntry?.zScoreDatasetValues ?? [])),
    [dataSetEntry, isPercentiles],
  );

  const keysDataSet = Object.keys(dataSetValues[0] ?? {});
  const measurementCode = MeasurementTypeCodes[selectedCategory];
  const startIndex = determineStartIndex(selectedCategory, selectedDataset, datasetMetadata.range.start);

  const chartLineData = useChartLines(dataSetValues, keysDataSet, startIndex, isPercentiles);
  const measurementPlotData = useMeasurementPlotting(
    measurementData,
    measurementCode,
    selectedCategory,
    selectedDataset,
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

  const yAxisRange = useMemo(() => {
    const { min, max } = calculateMinMaxValues(dataSetValues);
    return {
      minDataValue: Math.max(0, Math.floor(min)),
      maxDataValue: Math.ceil(max),
    };
  }, [dataSetValues]);

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
          domain: [yAxisRange.minDataValue, yAxisRange.maxDataValue],
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
    [datasetMetadata, yAxisRange],
  );

  const genderItems = Object.values(GenderCodes).map((code) => ({
    id: code,
    text: code === GenderCodes.CGC_Female ? t('female', 'Female') : t('male', 'Male'),
  }));

  const categoryItems = Object.keys(chartDataForGender).map((key) => ({
    id: key,
    text: chartDataForGender[key].categoryMetadata.label,
  }));

  const datasetItems = Object.keys(chartDataForGender[selectedCategory]?.datasets || {}).map((key) => ({
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
                    setSelectedCategory(newCategory);
                    const firstDataset = Object.keys(chartDataForGender[newCategory]?.datasets || {})[0];
                    setSelectedDataset(firstDataset);
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
                onChange={({ selectedItem }) => selectedItem && setSelectedDataset(selectedItem.id)}
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

export default GrowthChart;
