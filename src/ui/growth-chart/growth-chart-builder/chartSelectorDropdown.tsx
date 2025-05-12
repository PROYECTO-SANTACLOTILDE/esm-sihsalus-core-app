import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, Tooltip, TextInput } from '@carbon/react';

interface DropdownItem {
  id: string;
  text: string;
}

interface ChartSelectorDropdownProps {
  title: string;
  items: DropdownItem[];
  handleItemChange: (key: string) => void;
  isDisabled?: boolean;
  dataTest?: string;
}

export const ChartSelectorDropdown = ({
  title,
  items,
  handleItemChange,
  isDisabled,
  dataTest,
}: ChartSelectorDropdownProps) => {
  const { t } = useTranslation();

  const getGender = (gender: string): string => {
    switch (gender) {
      case 'M':
        return t('male', 'Male');
      case 'F':
        return t('female', 'Female');
      case 'other':
        return t('other', 'Other');
      case 'unknown':
        return t('unknown', 'Unknown');
      default:
        return gender;
    }
  };

  return isDisabled ? (
    <Tooltip align="bottom" label={t('genderPreselected', 'Gender is pre-selected based on the profile')}>
      <TextInput
        id={`${dataTest}-disabled`}
        value={getGender(title)}
        disabled
        size="sm"
        data-testid={`${dataTest}-disabled`}
        labelText=""
      />
    </Tooltip>
  ) : (
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
