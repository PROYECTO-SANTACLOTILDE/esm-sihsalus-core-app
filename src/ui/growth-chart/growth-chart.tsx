import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Tag, Tab, TabListVertical, TabPanel, TabPanels, TabsVertical } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import { differenceInMonths, differenceInWeeks } from 'date-fns';
import styles from './growth-chart.scss';
import { useChartLines } from './hooks/useChartLines';
import { useChartDataForGender } from './hooks/useChartDataForGender';
import { useAppropriateChartData } from './hooks/useAppropriateChartData';
import { chartData as rawChartData } from './data-sets/WhoStandardDataSets/ChartData';
import { MeasurementTypeCodes, type CategoryCodes, DataSetLabels, GenderCodes } from './data-sets';
import { age } from '@openmrs/esm-framework';
const DEFAULT_METADATA = {
  chartLabel: '',
  yAxisLabel: '',
  xAxisLabel: '',
  range: { start: 0, end: 0 },
};

interface GrowthChartProps {
  measurementData: any[];
  patientName: string;
  gender: string;
  dateOfBirth: Date;
}

interface GrowthChartCategoryItem {
  id: string;
  title: string;
  value: keyof typeof CategoryCodes;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ measurementData, patientName, gender, dateOfBirth }) => {
  const { t } = useTranslation();

  const memoizedChartData = useMemo(() => rawChartData, []);
  const { chartDataForGender } = useChartDataForGender(gender, memoizedChartData);

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
  const [isPercentiles, setIsPercentiles] = useState(true); // Nuevo estado para controlar el modo

  const { selectedDataset } = useAppropriateChartData(
    chartDataForGender,
    selectedCategory.value,
    gender,
    childAgeInWeeks,
    childAgeInMonths,
  );

  const dataSetEntry = useMemo(
    () => chartDataForGender[selectedCategory.value]?.datasets?.[selectedDataset],
    [chartDataForGender, selectedCategory.value, selectedDataset],
  );
  const datasetMetadata = dataSetEntry?.metadata ?? DEFAULT_METADATA;

  const dataSetValues = useMemo(
    () => (isPercentiles ? (dataSetEntry?.percentileDatasetValues ?? []) : (dataSetEntry?.zScoreDatasetValues ?? [])),
    [dataSetEntry, isPercentiles],
  );

  const keysDataSet = useMemo(() => Object.keys(dataSetValues[0] ?? {}), [dataSetValues]);
  const measurementCode = MeasurementTypeCodes[selectedCategory.value];

  const startIndex = useMemo(
    () => determineStartIndex(selectedCategory.value, selectedDataset, datasetMetadata.range.start),
    [selectedCategory.value, selectedDataset, datasetMetadata.range.start],
  );

  const chartLineData = useChartLines(dataSetValues, keysDataSet, startIndex, isPercentiles);

  const measurementPlotData = useMemo(() => {
    const measurementDataValues: { x: Date | number | string; y: number }[] = [];

    if (!measurementData) return [];

    const processEntry = (entry: any) => {
      let xValue: Date | number | string;
      let yValue: number;

      if (selectedCategory.value === 'wflh_b' || selectedCategory.value === 'wflh_g') {
        xValue = parseFloat(entry.dataValues.height);
        yValue = parseFloat(entry.dataValues.weight);
      } else {
        const obsDate = new Date(entry.eventDate);
        const diff = obsDate.getTime() - dateOfBirth.getTime();
        const msPerDay = 1000 * 60 * 60 * 24;
        const weeks = diff / (msPerDay * 7);
        const months = diff / (msPerDay * 30.44);

        switch (selectedDataset) {
          case DataSetLabels.w_0_13:
            xValue = weeks.toFixed(2);
            break;
          case DataSetLabels.y_0_2:
            xValue = months.toFixed(2);
            break;
          default:
            xValue = months.toFixed(2);
        }

        yValue = parseFloat(entry.dataValues[measurementCode]);
      }

      if (!isNaN(Number(xValue)) && !isNaN(yValue)) {
        measurementDataValues.push({ x: xValue, y: yValue });
      }
    };

    measurementData.forEach(processEntry);
    return measurementDataValues.map((point) => ({ group: patientName, date: point.x, value: point.y }));
  }, [measurementData, measurementCode, selectedCategory.value, selectedDataset, patientName, dateOfBirth]);

  const data = useMemo(() => [...chartLineData, ...measurementPlotData], [chartLineData, measurementPlotData]);
  const { min, max } = useMemo(() => calculateMinMaxValues(dataSetValues), [dataSetValues]);

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
      tooltip: { enabled: true },
      height: '400px',

      points: { enabled: false },
      color: {
        scale: {
          P3: '#cc0000',
          P97: '#cc0000',
          P15: '#e67300',
          P85: '#e67300',
          P50: '#009933',
          [patientName]: '#2b6693',
        },
      },
      style: {
        [patientName]: { point: { radius: 3 } },
        '*': { point: { radius: 0 } },
      },
    }),
    [datasetMetadata, min, max, patientName],
  );

  return (
    <div className={styles.growthChartContainer}>
      <div className={styles.growthArea}>
        <div className={styles.growthLabel}>
          <Button
            size="sm"
            kind="ghost"
            onClick={() => setIsPercentiles(!isPercentiles)}
            className={styles.toggleButton}
          >
            {isPercentiles ? 'Percentiles' : 'Z-Scores'}
          </Button>
          <Tag type={gender === GenderCodes.CGC_Female ? 'magenta' : 'blue'}>
            {gender === GenderCodes.CGC_Female ? t('female', 'Femenino') : t('male', 'Masculino')}
          </Tag>
          <Tag type="gray" className={classNames('ml-2', styles.datasetTag)}>
            {age(dateOfBirth, new Date())}
          </Tag>
        </div>
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

export default GrowthChart;
