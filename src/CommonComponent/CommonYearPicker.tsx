import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { TextInput } from "react-native-paper";

interface YearPickerInputProps {
  value?: string;
  onChange: (year: string) => void;
}

const YearPickerInput: React.FC<YearPickerInputProps> = ({ value, onChange }) => {
  const [visible, setVisible] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();
  const years: number[] = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => currentYear - i
  );

  const handleYearSelect = (year: number) => {
    onChange(year.toString());
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setVisible(true)} activeOpacity={0.8}>
        <TextInput
          label="Duration Year"
          mode="outlined"
          placeholder="Enter Year (e.g. 2025)"
          value={value || ""}
          editable={false} // user cannot type, only select
          left={<TextInput.Icon icon="calendar" />}
          style={[styles.input, { backgroundColor: "white" }]}
        />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Year</Text>

            <FlatList
              data={years}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleYearSelect(item)}
                  style={styles.yearItem}
                >
                  <Text style={styles.yearText}>{item}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default YearPickerInput;

const styles = StyleSheet.create({
  input: {
   marginBottom: 12,
    backgroundColor: "white",
    height: 38,
    fontSize: 14,
    paddingHorizontal: 10,
    borderRadius: 30
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    margin: 30,
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  yearItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  yearText: {
    fontSize: 16,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#007bff",
    borderRadius: 8,
    paddingVertical: 10,
  },
  closeText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
