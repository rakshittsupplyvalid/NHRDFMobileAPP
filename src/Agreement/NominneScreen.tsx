import React, { useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";


const NominneScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { signatureUri, type } = route.params || {}; // type = nominee/witness

  const submitNominee = async () => {
    if (!signatureUri) {
      Alert.alert("Error", "Signature missing!");
      return;
    }

    try {
      const formData = new FormData();

      // ✅ Base64 signature as file
      formData.append("Signature", {
        uri: signatureUri,
        type: "image/png",
        name: `signature_${Date.now()}.png`,
      });

      // ✅ Static Body fields
      formData.append("NomineeName", "test");
      formData.append("Gender", "FEMALE");
      formData.append("Relation", "brother");
      formData.append("MobileNo", "9990665358");
      formData.append("Email", "tyagirakshit@gmail.com");
      formData.append("DOB", "2025-10-30T16:44:54.111Z");
      formData.append("Age", "13");
      formData.append("Year", "23");
      formData.append("Addrline", "jagarti vihar");
      formData.append("Pincode", "201002");
      formData.append("StateName", "random");
      formData.append("DistrictName", "random");
      formData.append("SubdistrictName", "random");
      formData.append("VillageName", "random");
      formData.append("StateId", "2");
      formData.append("DistrictId", "3");
      formData.append("SubdistrictId", "4");
      formData.append("VillageId", "0");

      const apiUrl =
        "https://dev-backend-2024.epravaha.com/api/mobile/add/nominee/AGR2025101309404516319557025";

      console.log("📤 Uploading Signature...");
      console.log("URI:", signatureUri);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const result = await response.json();
      console.log("✅ API Result:", result);

      Alert.alert("Success", "Nominee added successfully!");

      navigation.goBack();
    } catch (err) {
      console.log("❌ Error uploading nominee:", err);
      Alert.alert("Error", "Signature upload failed. Try again.");
    }
  };

  useEffect(() => {
    if (signatureUri) {
      submitNominee(); // ✅ Auto submit after signature
    }
  }, [signatureUri]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>
        Signature Received — Uploading...
      </Text>

      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default NominneScreen;
