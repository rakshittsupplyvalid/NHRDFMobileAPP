import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StyleProp, ViewStyle, TextStyle } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

type Mode = 'date' | 'time' | 'datetime';

interface CustomDateTimePickerProps {
  mode?: Mode;
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  dateTextStyle?: StyleProp<TextStyle>;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  mode = 'date',
  value,
  onChange,
  label,
  style,
  labelStyle,
  inputStyle,
  dateTextStyle,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleConfirm = (selectedDate: Date) => {
    setIsVisible(false);
    onChange(selectedDate);
  };

  const formattedDate =
    mode === 'time'
      ? value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : value.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        style={[styles.input, inputStyle]}
        activeOpacity={0.7}
      >
        <Text style={[styles.dateText, dateTextStyle]}>{formattedDate}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isVisible}
        mode={mode}
        date={value}
        onConfirm={handleConfirm}
        onCancel={() => setIsVisible(false)}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 50,
    padding: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
});

export default CustomDateTimePicker;
