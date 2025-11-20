import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface UpperCaseInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const UpperCaseInput: React.FC<UpperCaseInputProps> = ({ value, onChangeText, ...props }) => {
  const handleChange = (text: string) => {
    onChangeText(text.toUpperCase());
  };

  return <TextInput value={value} onChangeText={handleChange} {...props} />;
};
