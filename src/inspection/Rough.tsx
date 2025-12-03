import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from "react-native";

interface OfftypeData {
  naturetype: string;
  numberofplants: string;
  discription: string;
}

export default function OfftypeForm() {
  const [offtypes, setOfftypes] = useState<OfftypeData[]>([
    { naturetype: "", numberofplants: "", discription: "" },
  ]);

  const handleOfftypeChange = (index: number, field: keyof OfftypeData, value: string) => {
    // Update only the changed field to prevent full re-render
    setOfftypes(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addOfftypeRow = () => {
    if (offtypes.length >= 10) return;
    setOfftypes(prev => [
      ...prev,
      { naturetype: "", numberofplants: "", discription: "" },
    ]);
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      {offtypes.map((offtype, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.label}>Offtype {index + 1}</Text>

          <TextInput
            placeholder="Number of plants"
            keyboardType="numeric"
            value={offtype.numberofplants}
            onChangeText={(text) => handleOfftypeChange(index, "numberofplants", text)}
            style={styles.input}
          />

          <TextInput
            placeholder="Nature Type"
            value={offtype.naturetype}
            onChangeText={(text) => handleOfftypeChange(index, "naturetype", text)}
            style={styles.input}
          />

          <TextInput
            placeholder="Description"
            value={offtype.discription}
            onChangeText={(text) => handleOfftypeChange(index, "discription", text)}
            style={styles.input}
          />
        </View>
      ))}

      <Button title="Add Offtype" onPress={addOfftypeRow} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  label: { fontWeight: "bold", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    height: 40,
  },
});
