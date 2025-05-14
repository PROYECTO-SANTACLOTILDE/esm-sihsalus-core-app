import React, { useMemo, useId, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tag, Tab, TabListVertical, TabPanel, TabPanels, TabsVertical } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import { differenceInMonths, differenceInWeeks } from 'date-fns';
import styles from './growth-chart.scss';

import { useChartLines } from './hooks/useChartLines';
import { useMeasurementPlotting } from './hooks/useMeasurementPlotting';
import { useChartDataForGender } from './hooks/useChartDataForGender';
import { useAppropriateChartData } from './hooks/useAppropriateChartData';
import { chartData } from './data-sets/WhoStandardDataSets/ChartData';
import { MeasurementTypeCodes, type CategoryCodes, DataSetLabels, GenderCodes } from './types';

const DEFAULT_METADATA = {
  chartLabel: '',
  yAxisLabel: '',
  xAxisLabel: '',
  range: { start: 0, end: 0 },
};

function calculateMinMaxValues(datasetValues: Array<Record<string, unknown>>) {
  if (!datasetValues || datasetValues.length === 0) return { min: 0, max: 0 };
  const flatValues: number[] = datasetValues.flatMap((entry) =>
    Object.values(entry).filter((value): value is number => typeof value === 'number' && Number.isFinite(value)),
  );
  if (flatValues.length === 0) return { min: 0, max: 0 };
  const min = Math.min(...flatValues);
  const max = Math.max(...flatValues);
  return { min, max };
}

function determineStartIndex(category: keyof typeof CategoryCodes, dataset: string, metadataRangeStart: number) {
  const adjustIndex = dataset === DataSetLabels.y_2_5 ? 24 : 0;
  const isWFLH = category === 'wflh_b' || category === 'wflh_g';
  return isWFLH ? metadataRangeStart : adjustIndex;
}

interface GrowthChartProps {
  measurementData: any[];
  dateOfBirth: Date;
  gender: string;
}

interface GrowthChartCategoryItem {
  id: string;
  title: string;
  value: keyof typeof CategoryCodes;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ measurementData, dateOfBirth, gender }) => {
  const { t } = useTranslation();
  const id = useId();

  const { chartDataForGender } = useChartDataForGender(gender, chartData);

  const categories: GrowthChartCategoryItem[] = useMemo(
    () =>
      Object.entries(chartDataForGender).map(([key, value]) => ({
        id: key,
        title: value.categoryMetadata?.label ?? key,
        value: key as keyof typeof CategoryCodes,
      })),
    [chartDataForGender],
  );

  const [selectedCategory, setSelectedCategory] = useState<GrowthChartCategoryItem>(categories[0]);

  const childAgeInWeeks = useMemo(() => differenceInWeeks(new Date(), dateOfBirth), [dateOfBirth]);
  const childAgeInMonths = useMemo(() => differenceInMonths(new Date(), dateOfBirth), [dateOfBirth]);

  const { selectedDataset, setSelectedDataset } = useAppropriateChartData(
    chartDataForGender,
    selectedCategory.value,
    gender,
    childAgeInWeeks,
    childAgeInMonths,
  );

  const dataSetEntry = chartDataForGender[selectedCategory.value]?.datasets?.[selectedDataset];
  const datasetMetadata = dataSetEntry?.metadata ?? DEFAULT_METADATA;
  const isPercentiles = true;
  const dataSetValues = isPercentiles
    ? (dataSetEntry?.percentileDatasetValues ?? [])
    : (dataSetEntry?.zScoreDatasetValues ?? []);

  const keysDataSet = Object.keys(dataSetValues[0] ?? {});
  const measurementCode = MeasurementTypeCodes[selectedCategory.value];
  const startIndex = determineStartIndex(selectedCategory.value, selectedDataset, datasetMetadata.range.start);

  const chartLineData = useChartLines(dataSetValues, keysDataSet, startIndex, isPercentiles);
  const measurementPlotData = useMeasurementPlotting(
    measurementData,
    measurementCode,
    selectedCategory.value,
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
  const { min, max } = calculateMinMaxValues(dataSetValues);

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
          domain: [Math.max(0, Math.floor(min)), Math.ceil(max)],
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
    [datasetMetadata, min, max],
  );

  return (
    <div className={styles.clinicalDataChartContainer}>
      <div className={styles.vitalSignsArea}>
        <TabsVertical>
          <TabListVertical aria-label="Growth Chart vertical tabs">
            {categories.map(({ id, title, value }) => (
              <Tab
                className={classNames(styles.tab, styles.bodyLong01, {
                  [styles.selectedTab]: selectedCategory.value === value,
                })}
                id={`${id}-tab`}
                key={id}
                onClick={() => setSelectedCategory({ id, title, value })}
              >
                {title}
              </Tab>
            ))}
            <Tag type="gray">
              {t('sex', 'Sexo')}: {gender === GenderCodes.CGC_Female ? t('female', 'Female') : t('male', 'Male')}
            </Tag>
            <Tag type="blue" className="ml-2">
              {selectedDataset}
            </Tag>
          </TabListVertical>
          <TabPanels>
            {categories.map(({ id }) => (
              <TabPanel key={id}>
                <LineChart data={data} options={options} key={id} />
              </TabPanel>
            ))}
          </TabPanels>
        </TabsVertical>
      </div>
    </div>
  );
};

export default GrowthChart;
