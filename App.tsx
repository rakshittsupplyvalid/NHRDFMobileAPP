import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, Platform, StyleSheet } from "react-native";
import { PermissionsAndroid } from "react-native";
import * as RNHTMLtoPDF from "react-native-html-to-pdf";

export default function Pdff() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "App needs access to save PDF",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const generatePDF = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Cannot generate PDF without permission");
      console.log("")
      return;
    }

    const htmlContent = `
      <p>Name: ${name}</p>
      <p>Email: ${email}</p>
    `;

    try {
      // TypeScript-safe convert call
      const file = await (RNHTMLtoPDF as any).convert({
        html: htmlContent,
        fileName: "form_pdf",
        directory: "Documents",
      });

      Alert.alert("PDF Generated", `PDF saved at: ${file.filePath}`);
      console.log("PDF file path:", file.filePath);
    } catch (error) {
      console.log("PDF generation error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter name" />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter email" />
      <View style={{ marginTop: 20 }}>
        <Button title="Generate PDF" onPress={generatePDF} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontWeight: "bold", marginTop: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginTop: 5 },
});
