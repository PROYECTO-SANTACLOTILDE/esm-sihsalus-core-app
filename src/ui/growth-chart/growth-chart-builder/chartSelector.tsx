import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, Tooltip, TextInput } from '@carbon/react';
import { type ChartData, type CategoryCodes, GenderCodes, CategoryToLabel } from '../config-schema';

interface DropdownItem {
  id: string;
  text: string;
}

interface ChartSelectorProps {
  category: keyof typeof CategoryCodes;
  dataset: string;
  setCategory: (category: keyof typeof CategoryCodes) => void;
  setDataset: (dataset: string) => void;
  chartData: ChartData;
  isDisabled?: boolean;
  gender: string;
  setGender: (gender: keyof typeof GenderCodes) => void;
}

export const ChartSelector = ({
  category,
  dataset,
  setCategory,
  setDataset,
  chartData,
  isDisabled,
  gender,
  setGender,
}: ChartSelectorProps) => {
  const genderItems = useMemo(
    () =>
      Object.values(GenderCodes).map((code) => ({
        id: code,
        text: code === GenderCodes.CGC_Female ? 'Female' : 'Male',
      })),
    [],
  );

  const categoryItems = useMemo(
    () =>
      Object.keys(chartData).map((key) => ({
        id: key,
        text: chartData[key].categoryMetadata.label,
      })),
    [chartData],
  );

  const datasetItems = useMemo(
    () =>
      Object.keys(chartData[category]?.datasets || {}).map((key) => ({
        id: key,
        text: key,
      })),
    [chartData, category],
  );

  const handleCategoryChange = (categoryKey: string) => {
    const newCategory = categoryKey as keyof typeof CategoryCodes;
    setCategory(newCategory);
    const firstDataset = Object.keys(chartData[newCategory]?.datasets || {})[0];
    setDataset(firstDataset);
  };

  return (
    <div className="cds--grid cds--grid--condensed">
      <div className="cds--row cds--grid-row">
        <div className="cds--col">
          <ChartSelectorDropdown
            title={gender}
            items={genderItems}
            handleItemChange={(value) => setGender(value as keyof typeof GenderCodes)}
            isDisabled={isDisabled}
            dataTest="gender-selector"
          />
        </div>

        <div className="cds--col">
          <ChartSelectorDropdown
            title={CategoryToLabel[category]}
            items={categoryItems}
            handleItemChange={handleCategoryChange}
            dataTest="category-selector"
          />
        </div>

        <div className="cds--col">
          <ChartSelectorDropdown
            title={dataset}
            items={datasetItems}
            handleItemChange={setDataset}
            dataTest="dataset-selector"
          />
        </div>
      </div>
    </div>
  );
};

interface ChartSelectorDropdownProps {
  title: string;
  items: DropdownItem[];
  handleItemChange: (key: string) => void;
  isDisabled?: boolean;
  dataTest?: string;
}

const ChartSelectorDropdown = ({
  title,
  items,
  handleItemChange,
  isDisabled,
  dataTest,
}: ChartSelectorDropdownProps) => {
  const { t } = useTranslation();

  const genderMap: Record<string, string> = useMemo(
    () => ({
      M: t('male', 'Male'),
      F: t('female', 'Female'),
      other: t('other', 'Other'),
      unknown: t('unknown', 'Unknown'),
    }),
    [t],
  );

  const getLabel = (val: string): string => genderMap[val] ?? val;

  if (isDisabled) {
    return (
      <Tooltip align="bottom" label={t('genderPreselected', 'Gender is pre-selected based on the profile')}>
        <TextInput
          id={`${dataTest}-disabled`}
          value={getLabel(title)}
          disabled
          size="sm"
          data-testid={`${dataTest}-disabled`}
          labelText=""
        />
      </Tooltip>
    );
  }

  return (
    <Dropdown
      id={`${dataTest}-dropdown`}
      titleText=""
      label={title}
      items={items}
      itemToString={(item) => item?.text || ''}
      onChange={({ selectedItem }) => selectedItem && handleItemChange(selectedItem.id)}
      size="sm"
      data-testid={dataTest}
    />
  );
};
