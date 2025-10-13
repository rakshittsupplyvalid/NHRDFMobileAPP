import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from "react-native";
import {
  Button,
  Text,
  Card,
  TextInput,
  Checkbox,
  ScrollView,
} from "react-native-paper";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import CommonPicker from "../CommonComponent/CommonDropdown";
import {
  Onion,
  Garlic,
  Potato,
  relations,
  states,
  districts,
  years,
} from "../Constants/constants";
import { useNavigation, useRoute } from "@react-navigation/native";
import useForm from "../Form/UseForm";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SignatureView from "../Signature/SignatureScreen";  // adjust path as needed

const AgreementSecond: React.FC = () => {
  const { state, updateState } = useForm();
  const route = useRoute();
  const navigation = useNavigation<any>();

  const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);
  const [signatureVisible, setSignatureVisible] = useState(false);

  // If you pass signature via route params
  useEffect(() => {
    if ((route.params as any)?.signature) {
      const sig = (route.params as any).signature;
      updateState({
        ...state,
        form: { ...state.form, witnessSignature: sig },
      });
    }
  }, [route.params]);

  const renderCommodityDropdown = () => {
    const selected = state.form.commodity;
    switch (selected) {
      case "onion":
        return (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.label}>Onion Varieties</Text>
              <CommonPicker
                selectedValue={state.form.onionVariety || ""}
                onValueChange={(value) =>
                  updateState({
                    ...state,
                    form: { ...state.form, onionVariety: value },
                  })
                }
                items={Onion}
              />
            </Card.Content>
          </Card>
        );
      case "Garlic":
        return (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.label}>Garlic Varieties</Text>
              <CommonPicker
                selectedValue={state.form.garlicVariety || ""}
                onValueChange={(value) =>
                  updateState({
                    ...state,
                    form: { ...state.form, garlicVariety: value },
                  })
                }
                items={Garlic}
              />
            </Card.Content>
          </Card>
        );
      case "Potato":
        return (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.label}>Potato Varieties</Text>
              <CommonPicker
                selectedValue={state.form.potatoVariety || ""}
                onValueChange={(value) =>
                  updateState({
                    ...state,
                    form: { ...state.form, potatoVariety: value },
                  })
                }
                items={Potato}
              />
            </Card.Content>
          </Card>
        );
    }
    return null;
  };

  const handleSignatureSave = (signatureData: string) => {
    // signatureData will be a base64 URI string
    updateState({
      ...state,
      form: { ...state.form, witnessSignature: signatureData },
    });
    setSignatureVisible(false);
  };

  const handleSubmit = async () => {
    if (!isAgreementAccepted) {
      Alert.alert(
        "Agreement",
        "Please read and accept the agreement terms before submitting."
      );
      return;
    }

    // Prepare payload as multipart/form-data
    const formData = new FormData();

    formData.append("CenterTargetId", state.form.CenterTargetId || "");
    formData.append("FarmerDistributionId", state.form.FarmerDistributionId || "");
    formData.append("TagNumber", state.form.TagNumber || "");
    formData.append("VarietyId", state.form.VarietyId || "");
    formData.append("AuthorizedName", state.form.AuthorizedName || "");
    formData.append("SeedClass", state.form.SeedClass || "");
    formData.append("CommodityId", state.form.commodity || "");
    formData.append("Area", state.form.Area?.toString() ?? "0");
    formData.append("BillNumber", state.form.BillNumber || "");

    // Nominee object
    const nomineeObj = {
      gender: state.form.gender || "",
      pincode: state.form.pincode || "",
      mobileno: state.form.mobileNumber || "",
      addrline: state.form.addrline || "",
      villageid: state.form.villageid || 0,
      districtid: state.form.districtid || 0,
      subdistrictid: state.form.subdistrictid || 0,
      stateid: state.form.stateid || 0,
      profdocument: state.form.profdocument || "",
      dob: state.form.dob || new Date().toISOString(),
      villagename: state.form.villagename || "",
      signature: state.form.witnessSignature || "",
      subdistrictname: state.form.subdistrictname || "",
      districtname: state.form.districtname || "",
      relation: state.form.relation || "",
      statename: state.form.statename || "",
      nomineename: state.form.nomineename || "",
      email: state.form.email || "",
      year: state.form.year || 0,
      age: state.form.age || 0,
    };
    formData.append("NomiNee", JSON.stringify(nomineeObj));

    // Witness object
    const witnessObj = {
      pincode: state.form.witnessPincode || "",
      witnessemail: state.form.witnessEmail || "",
      witnessname: state.form.witnessname || "",
      addrline: state.form.witnessaddress || "",
      villageid: state.form.witnessVillageId || 0,
      districtid: state.form.witnessDistrictId || 0,
      subdistrictid: state.form.witnessSubdistrictId || 0,
      stateid: state.form.witnessStateId || 0,
      profdocument: state.form.witnessProfdocument || "",
      villagename: state.form.witnessVillagename || "",
      signature: state.form.witnessSignature || "",
      subdistrictname: state.form.witnessSubdistrictName || "",
      districtname: state.form.witnessDistrictName || "",
      witnessmobileno: state.form.witnessMobileno || "",
      statename: state.form.witnessStateName || "",
    };
    formData.append("Witness", JSON.stringify(witnessObj));

    formData.append("LotNumber", state.form.LotNumber || "");
    formData.append("DuringYear", state.form.DuringYear || "");
    formData.append("PlantingMaterial", state.form.PlantingMaterial || "SEED");
    formData.append("FarmerId", state.form.FarmerId || "");

    // If you have files, e.g. ProfFile or Signature (other than base64)
    // formData.append("ProfFile", {
    //   uri: state.form.profFileUri,
    //   name: "prof.pdf",
    //   type: "application/pdf",
    // });
    // formData.append("Signature", {
    //   uri: state.form.signatureUri,
    //   name: "signature.png",
    //   type: "image/png",
    // });

    try {
      const response = await fetch(
        "https://dev-nhrdf-backend.supplyvalid.com/api/mobile/agreement",
        {
          method: "POST",
          headers: {
            Accept: "text/plain",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....", // use real token
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );
      const respJson = await response.json();
      console.log("Submit response:", respJson);
      // Handle success / error
      if (response.ok) {
        Alert.alert("Success", "Agreement submitted successfully.");
        navigation.navigate("SomeNextScreen");
      } else {
        Alert.alert("Error", "Submission failed.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Agreement Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={true}
        showsVerticalScrollIndicator={false}
      >
        {/* Witness section with signature option */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Witness Details</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              mode="outlined"
              value={state.form.witnessname || ""}
              onChangeText={(txt) =>
                updateState({
                  ...state,
                  form: { ...state.form, witnessname: txt },
                })
              }
              style={styles.input}
              placeholder="Enter witness name"
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              mode="outlined"
              value={state.form.witnessaddress || ""}
              onChangeText={(txt) =>
                updateState({
                  ...state,
                  form: { ...state.form, witnessaddress: txt },
                })
              }
              style={styles.multilineinput}
              placeholder="Enter witness address"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.openButton}
              onPress={() => setSignatureVisible(true)}
            >
              <Text style={styles.buttonText}>Sign Witness</Text>
            </TouchableOpacity>

            {state.form.witnessSignature && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.label}>Signature Preview</Text>
                <Image
                  source={{ uri: state.form.witnessSignature }}
                  style={{ width: "100%", height: 200, borderWidth: 1, borderColor: "#ccc" }}
                  resizeMode="contain"
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Signature modal */}
        <Modal
          visible={signatureVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setSignatureVisible(false)}
        >
          <SignatureView onSave={handleSignatureSave} />
          <Button onPress={() => setSignatureVisible(false)}>Cancel</Button>
        </Modal>

        {/* Other form fields follow here: nomination, address, NHRDF signatory, agreement terms, etc. */}
        {/* ... (you can keep your other Cards and inputs here, same as before) */}

        {renderCommodityDropdown()}

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Agreement Terms & Conditions</Text>
            <ScrollView style={styles.agreementContainer} nestedScrollEnabled={true}>
              <Text style={styles.agreementText}>
                <Text style={styles.agreementHeading}>Important Terms:{'\n\n'}</Text>
                • The NHRDF reserves the right to terminate this Contract Agreement ...{'\n\n'}
                • In case of termination, the Grower ...{'\n\n'}
                // (rest of your terms)
                <Text style={styles.agreementNote}>
                  Note: The Grower is not allowed to sell ...
                </Text>
              </Text>
            </ScrollView>
            <View style={styles.checkboxContainer}>
              <Checkbox.Android
                status={isAgreementAccepted ? "checked" : "unchecked"}
                onPress={() => setIsAgreementAccepted(!isAgreementAccepted)}
                color="#70B04F"
              />
              <Text style={styles.checkboxLabel}>
                I have read and understood all the terms and conditions ...
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            !isAgreementAccepted && styles.submitButtonDisabled,
          ]}
          contentStyle={styles.submitButtonContent}
          icon="check"
          disabled={!isAgreementAccepted}
        >
          Submit Agreement
        </Button>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AgreementSecond;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#70B04F",
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "white",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#70B04F",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#455A64",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
    height: 38,
    fontSize: 14,
    paddingHorizontal: 10,
  },
  multilineinput: {
    backgroundColor: "#fff",
    marginBottom: 12,
    fontSize: 14,
  },
  openButton: {
    backgroundColor: "#70B04F",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  agreementContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#FAFAFA",
  },
  agreementText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#455A64",
  },
  agreementHeading: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D32F2F",
  },
  agreementNote: {
    fontStyle: "italic",
    color: "#FF9800",
    fontWeight: "600",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#455A64",
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 30,
    paddingVertical: 8,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  submitButtonContent: {
    paddingVertical: 6,
  },
});
