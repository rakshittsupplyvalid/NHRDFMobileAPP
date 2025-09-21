import React from 'react';
import { View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import styles from './CommonPickerstyles';
import { CommonPickerProps } from '../Type/type';

const CommonPicker: React.FC<CommonPickerProps> = ({
  selectedValue,
  onValueChange,
  items,
  label,
  onFocus,
  onBlur,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Dropdown
        style={[styles.picker]}
        data={items}
        labelField="label"
        valueField="value"
        placeholder="Select item"
        search
        searchPlaceholder="Search..."
        value={selectedValue}
        onChange={item => onValueChange(item.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        mode="modal"
      />
    </View>
  );
};

export default CommonPicker;