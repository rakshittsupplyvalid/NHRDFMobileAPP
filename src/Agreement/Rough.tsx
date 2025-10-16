import React, { useState } from "react";
import { View, ScrollView, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { Button, Text, TextInput, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CommonActions, useNavigation } from "@react-navigation/native";
import apiClient from "../api/apiClient"; // aapka axios instance
import { retrieveToken } from "../utils/token"; // token retrieval

interface NomineeType {
  nomineename: string;
  gender: string;
  age: string;
  dob: string;
  mobileno: string;
  email: string;
  addrline: string;
  villageid: string;
  villagename: string;
  districtid: string;
  districtname: string;
  subdistrictid: string;
  subdistrictname: string;
  stateid: string;
  statename: string;
  relation: string;
  profdocument: string;
  signature: string;
  year: string;
}

interface WitnessType {
  witnessname: string;
  witnessmobileno: string;
  witnessemail: string;
  addrline: string;
  villageid: string;
  villagename: string;
  districtid: string;
  districtname: string;
  subdistrictid: string;
  subdistrictname: string;
  stateid: string;
  statename: string;
  profdocument: string;
  signature: string;
  pincode: string;
}

const AgreementForm = () => {
  const navigation = useNavigation();

  const [nominees, setNominees] = useState<NomineeType[]>([
    {
      nomineename: "",
      gender: "",
      age: "",
      dob: "",
      mobileno: "",
      email: "",
      addrline: "",
      villageid: "",
      villagename: "",
      districtid: "",
      districtname: "",
      subdistrictid: "",
      subdistrictname: "",
      stateid: "",
      statename: "",
      relation: "",
      profdocument: "",
      signature: "",
      year: "",
    },
  ]);

  const [witnesses, setWitnesses] = useState<WitnessType[]>([
    {
      witnessname: "",
      witnessmobileno: "",
      witnessemail: "",
      addrline: "",
      villageid: "",
      villagename: "",
      districtid: "",
      districtname: "",
      subdistrictid: "",
      subdistrictname: "",
      stateid: "",
      statename: "",
      profdocument: "",
      signature: "",
      pincode: "",
    },
  ]);

  const [isAgreementAccepted, setAgreementAccepted] = useState(false);

  // ------------------ Nominee Handlers ------------------
  const updateNominee = (index: number, key: keyof NomineeType, value: string) => {
    const newNominees = [...nominees];
    newNominees[index][key] = value;
    setNominees(newNominees);
  };

  const addNominee = () => {
    setNominees([
      ...nominees,
      {
        nomineename: "",
        gender: "",
        age: "",
        dob: "",
        mobileno: "",
        email: "",
        addrline: "",
        villageid: "",
        villagename: "",
        districtid: "",
        districtname: "",
        subdistrictid: "",
        subdistrictname: "",
        stateid: "",
        statename: "",
        relation: "",
        profdocument: "",
        signature: "",
        year: "",
      },
    ]);
  };

  // ------------------ Witness Handlers ------------------
  const updateWitness = (index: number, key: keyof WitnessType, value: string) => {
    const newWitnesses = [...witnesses];
    newWitnesses[index][key] = value;
    setWitnesses(newWitnesses);
  };

  const addWitness = () => {
    setWitnesses([
      ...witnesses,
      {
        witnessname: "",
        witnessmobileno: "",
        witnessemail: "",
        addrline: "",
        villageid: "",
        villagename: "",
        districtid: "",
        districtname: "",
        subdistrictid: "",
        subdistrictname: "",
        stateid: "",
        statename: "",
        profdocument: "",
        signature: "",
        pincode: "",
      },
    ]);
  };

  // ------------------ Submit Handler ------------------
  const handleSubmit = async () => {
    if (!isAgreementAccepted) {
      Alert.alert("Agreement", "Please accept the agreement terms before submitting.");
      return;
    }

    const formData = new FormData();

    // Append Nominees
    nominees.forEach((nominee, index) => {
      Object.keys(nominee).forEach((key) => {
        formData.append(`NomiNee[${index}][${key}]`, nominee[key as keyof NomineeType].toString());
      });
    });

    // Append Witnesses
    witnesses.forEach((witness, index) => {
      Object.keys(witness).forEach((key) => {
        formData.append(`Witness[${index}][${key}]`, witness[key as keyof WitnessType].toString());
      });
    });

    // Debug: log FormData
    for (let [key, value] of (formData as any).entries()) {
      console.log(`📦 ${key}:`, value);
    }

    const token = await retrieveToken();
    console.log("📜 Token before submit:", token);

    try {
      const response = await apiClient.post("/api/mobile/agreement", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Submit response:", response.data);

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Agreement submitted successfully.", [
          {
            text: "OK",
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "DashboardScreen" }],
                })
              );
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Submission failed.");
      }
    } catch (err: any) {
      console.log("❌ Submit error:", err.response?.data || err.message);
      Alert.alert("Error", "Submission failed. Check console for details.");
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      {/* ----------------- Nominees ----------------- */}
      <Text style={styles.sectionTitle}>Nominee Details</Text>
      {nominees.map((nominee, index) => (
        <Card key={index} style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionSubTitle}>Nominee {index + 1}</Text>

            <TextInput
              label="Full Name"
              value={nominee.nomineename}
              onChangeText={(text) => updateNominee(index, "nomineename", text)}
              style={styles.input}
            />
            <TextInput
              label="Gender"
              value={nominee.gender}
              onChangeText={(text) => updateNominee(index, "gender", text)}
              style={styles.input}
            />
            <TextInput
              label="Age"
              keyboardType="numeric"
              value={nominee.age}
              onChangeText={(text) => updateNominee(index, "age", text)}
              style={styles.input}
            />
            <TextInput
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
              value={nominee.dob}
              onChangeText={(text) => updateNominee(index, "dob", text)}
              style={styles.input}
            />
            <TextInput
              label="Mobile No"
              keyboardType="phone-pad"
              value={nominee.mobileno}
              onChangeText={(text) => updateNominee(index, "mobileno", text)}
              style={styles.input}
            />
            <TextInput
              label="Email"
              keyboardType="email-address"
              value={nominee.email}
              onChangeText={(text) => updateNominee(index, "email", text)}
              style={styles.input}
            />
            <TextInput
              label="Address Line"
              value={nominee.addrline}
              onChangeText={(text) => updateNominee(index, "addrline", text)}
              style={styles.input}
            />
            <TextInput
              label="Village Name"
              value={nominee.villagename}
              onChangeText={(text) => updateNominee(index, "villagename", text)}
              style={styles.input}
            />
            <TextInput
              label="District Name"
              value={nominee.districtname}
              onChangeText={(text) => updateNominee(index, "districtname", text)}
              style={styles.input}
            />
            <TextInput
              label="Subdistrict Name"
              value={nominee.subdistrictname}
              onChangeText={(text) => updateNominee(index, "subdistrictname", text)}
              style={styles.input}
            />
            <TextInput
              label="State Name"
              value={nominee.statename}
              onChangeText={(text) => updateNominee(index, "statename", text)}
              style={styles.input}
            />
            <TextInput
              label="Relation"
              value={nominee.relation}
              onChangeText={(text) => updateNominee(index, "relation", text)}
              style={styles.input}
            />

            {/* Signature placeholder */}
            <TouchableOpacity
              style={styles.signatureBtn}
              onPress={() => Alert.alert("Signature", "Capture nominee signature here")}
            >
              <MaterialCommunityIcons name="signature-freehand" size={26} color="#2C5EFF" />
              <Text>Add Signature</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      ))}
      <Button mode="outlined" onPress={addNominee} style={{ marginVertical: 10 }}>
        Add Another Nominee
      </Button>

      {/* ----------------- Witnesses ----------------- */}
      <Text style={styles.sectionTitle}>Witness Details</Text>
      {witnesses.map((witness, index) => (
        <Card key={index} style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionSubTitle}>Witness {index + 1}</Text>

            <TextInput
              label="Full Name"
              value={witness.witnessname}
              onChangeText={(text) => updateWitness(index, "witnessname", text)}
              style={styles.input}
            />
            <TextInput
              label="Mobile No"
              keyboardType="phone-pad"
              value={witness.witnessmobileno}
              onChangeText={(text) => updateWitness(index, "witnessmobileno", text)}
              style={styles.input}
            />
            <TextInput
              label="Email"
              keyboardType="email-address"
              value={witness.witnessemail}
              onChangeText={(text) => updateWitness(index, "witnessemail", text)}
              style={styles.input}
            />
            <TextInput
              label="Address Line"
              value={witness.addrline}
              onChangeText={(text) => updateWitness(index, "addrline", text)}
              style={styles.input}
            />
            <TextInput
              label="Pincode"
              keyboardType="numeric"
              value={witness.pincode}
              onChangeText={(text) => updateWitness(index, "pincode", text)}
              style={styles.input}
            />
            <TextInput
              label="Village Name"
              value={witness.villagename}
              onChangeText={(text) => updateWitness(index, "villagename", text)}
              style={styles.input}
            />
            <TextInput
              label="District Name"
              value={witness.districtname}
              onChangeText={(text) => updateWitness(index, "districtname", text)}
              style={styles.input}
            />
            <TextInput
              label="Subdistrict Name"
              value={witness.subdistrictname}
              onChangeText={(text) => updateWitness(index, "subdistrictname", text)}
              style={styles.input}
            />
            <TextInput
              label="State Name"
              value={witness.statename}
              onChangeText={(text) => updateWitness(index, "statename", text)}
              style={styles.input}
            />

            {/* Signature placeholder */}
            <TouchableOpacity
              style={styles.signatureBtn}
              onPress={() => Alert.alert("Signature", "Capture witness signature here")}
            >
              <MaterialCommunityIcons name="signature-freehand" size={26} color="#2C5EFF" />
              <Text>Add Signature</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      ))}
      <Button mode="outlined" onPress={addWitness} style={{ marginVertical: 10 }}>
        Add Another Witness
      </Button>

      {/* ----------------- Agreement Checkbox ----------------- */}
      <View style={{ marginVertical: 10 }}>
        <Button
          mode={isAgreementAccepted ? "contained" : "outlined"}
          onPress={() => setAgreementAccepted(!isAgreementAccepted)}
        >
          {isAgreementAccepted ? "Agreement Accepted ✅" : "Accept Agreement"}
        </Button>
      </View>

      <Button mode="contained" onPress={handleSubmit} style={{ marginBottom: 30 }}>
        Submit Agreement
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  sectionSubTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  sectionCard: { marginVertical: 5, padding: 5 },
  input: { marginBottom: 10, backgroundColor: "#fff" },
  signatureBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#2C5EFF",
    borderRadius: 5,
    marginTop: 10,
  },
});

export default AgreementForm;
