/** ✅✅✅ UPDATED AGREEMENT FORM WITH MERGED AADHAR + FARMER INFO CARD ✅✅✅ **/

import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { Button, Text, Card, Checkbox, Divider, HelperText } from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from "@react-navigation/native";
import CommonPicker from "../CommonComponent/CommonDropdown";
import YearPickerInput from "../CommonComponent/CommonYearPicker";
import useForm from "../Form/UseForm";
import apiClient from "../Service/apiInterceptors";
import { farmerDetails, getFarmerLandDetail, fetchSeedOptions } from "../Service/fetchCommodity";
import { useFormData } from "../Constants/FormContext";

const AgreementForm: React.FC = () => {

  const { state, updateState } = useForm();
  const { setFormData } = useFormData();
  const navigation = useNavigation<any>();

  /** ------------------------ STATES --------------------------- */
  const [aadharData, setAadharData] = useState<any>(null);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("");
  const [seedOptions, setSeedOptions] = useState<any[]>([]);
  const [farmerLandList, setFarmerLandList] = useState<any[]>([]);
  const [selectedLandId, setSelectedLandId] = useState<string | null>(null);
  const [focusedFields, setFocusedFields] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [aadharExtraFields, setAadharExtraFields] = useState<any>({
    VarietyId: "",
    CommodityId: "",
    CenterTargetId: "",
    Area: "",
    LotNumber: "",
    TagNumber: "",
    BillNumber: "",
    distributiontype: "",
    DistrubutedFarnerId: "",
  });

  /** ---------------------- VALIDATIONS ------------------------ */
  const validateField = (field: string, value: any) => {
    switch (field) {
      case "selectedLandId":
        return !value ? "Please select at least one land" : "";
      case "seeds":
        return !value ? "Seeds selection is required" : "";
      case "Year":
        return !value ? "Duration Year is required" : "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {
      selectedLandId: validateField("selectedLandId", selectedLandId),
      seeds: validateField("seeds", state.form.seeds),
      Year: validateField("Year", state.form.Year),
    };
    setErrors(newErrors);

    return Object.values(newErrors).every((x) => x === "");
  };

  /** ---------------------- HANDLE CHANGES --------------------- */
  const handleFieldChange = (field: string, value: any) => {
    if (field === "selectedLandId") setSelectedLandId(value);
    else updateState({ ...state, form: { ...state.form, [field]: value } });

    setTouched((p: any) => ({ ...p, [field]: true }));
    setErrors((p: any) => ({ ...p, [field]: validateField(field, value) }));
  };

  const shouldShowError = (field: string) =>
    touched[field] && errors[field];

  /** ---------------------- FETCH AADHAR DATA ------------------ */
  const fetchAadharData = async (aadhar: string) => {
    if (!aadhar || aadhar.length !== 12) return;

    try {
      const res = await apiClient.get(
        `/api/mobile/farmer/distribution/list?AadharNo=${aadhar}&ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED`
      );

      if (res.data?.length > 0) {
        const info = res.data[0];
        setAadharData(info);
        setSelectedFarmerId(info.farmerid);

        setAadharExtraFields({
          DistrubutedFarnerId: info.id,
          VarietyId: info.varietyid,
          CommodityId: info.commodityid,
          CenterTargetId: info.centertargetid,
          Area: info.area,
          LotNumber: info.lotno,
          TagNumber: info.tagnumber,
          BillNumber: info.billnumber,
          distributiontype: info.distributiontype,
        });
      }
    } catch (e) {
      setAadharData(null);
    }
  };

  /** ---------------------- FETCH FARMER DETAILS --------------- */
  useEffect(() => {
    if (!selectedFarmerId) return;

    (async () => {
      const f = await farmerDetails(selectedFarmerId);
      const info = f?.[0];

      updateState({
        ...state,
        form: {
          ...state.form,
          name: info?.name || "",
          gender: info?.gender || "",
          relation: info?.relation || "",
          relativename: info?.relativename || "",
          villagename: info?.villagename || "",
          districtname: info?.districtname || "",
          statename: info?.statename || "",
          pincode: info?.pincode?.toString() || "",
          mobile: info?.mobile || "",
        },
      });

      const land = await getFarmerLandDetail(selectedFarmerId);
      setFarmerLandList(land || []);
    })();
  }, [selectedFarmerId]);

  /** ---------------------- FETCH SEED DATA -------------------- */
  useEffect(() => {
    (async () => {
      const data = await fetchSeedOptions();
      setSeedOptions(data || []);
    })();
  }, []);

  /** ✅ MERGED AADHAR + FARMER INFO DATA */
  const mergedFarmerDetails = [
    { label: "Farmer Name", value: aadharData?.farmername || state.form.name, icon: "account" },
    { label: "Relation", value: aadharData?.relation || state.form.relation, icon: "account-heart" },
    { label: "Relative Name", value: aadharData?.relative || state.form.relativename, icon: "account-group" },
    { label: "Center Name", value: aadharData?.centername || "-", icon: "home-city" },
    { label: "Commodity", value: aadharData?.commodityname || "-", icon: "seed" },
    { label: "Variety", value: aadharData?.varietyname || "-", icon: "sprout" },
    { label: "Gender", value: state.form.gender, icon: "gender-male-female" },
    { label: "Village", value: state.form.villagename, icon: "home-city" },
    { label: "District", value: state.form.districtname, icon: "map-marker" },
    { label: "State", value: state.form.statename, icon: "map" },
    { label: "Pincode", value: state.form.pincode, icon: "numeric" },
    { label: "Mobile Number", value: state.form.mobile, icon: "phone" },
  ];

  /** ---------------------- UI START --------------------------- */
  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* ✅ Aadhar Input */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.label}>Aadhar Number *</Text>

          <TextInput
            placeholder="Enter Aadhar Number"
            value={state.form.AadharNumber}
            maxLength={12}
            keyboardType="number-pad"
            onChangeText={(v) => {
              handleFieldChange("AadharNumber", v);
              if (v.length === 12) fetchAadharData(v);
            }}
            style={[styles.simpleInput, shouldShowError("AadharNumber") && styles.inputError]}
          />
        </Card.Content>
      </Card>

      {/* ✅ MERGED FARMER DETAILS CARD */}
      <Card style={styles.farmerCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Farmer Details</Text>
          <Divider style={styles.headerDivider} />

          {mergedFarmerDetails.map((item, i) => (
            <View key={i}>
              <View style={styles.detailRow}>
                <View style={styles.labelContainer}>
                  <MaterialCommunityIcons name={item.icon} size={20} color="#4CAF50" style={{ marginRight: 8 }} />
                  <Text style={styles.detailLabel}>{item.label}:</Text>
                </View>
                <Text style={styles.detailValue}>{item.value || "-"}</Text>
              </View>

              {i < mergedFarmerDetails.length - 1 && (
                <Divider style={styles.rowDivider} />
              )}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* ✅ LAND DETAILS */}
      <Card style={styles.farmerCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Farmer Land Details *</Text>
          <Divider />

          {farmerLandList.map((land, idx) => (
            <View key={idx} style={styles.landCard}>
              <Checkbox
                status={selectedLandId === land.id ? "checked" : "unchecked"}
                onPress={() => handleFieldChange("selectedLandId", land.id)}
              />
              <Text>Land No: {land.number}</Text>
            </View>
          ))}

          <HelperText type="error">
            {errors.selectedLandId}
          </HelperText>
        </Card.Content>
      </Card>

      {/* ✅ Seed Selection */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Seed Production Details</Text>

          <Text style={styles.label}>Seeds *</Text>
          <CommonPicker
            selectedValue={state.form.seeds}
            items={seedOptions}
            onValueChange={(v) => handleFieldChange("seeds", v)}
          />

          <HelperText type="error">{errors.seeds}</HelperText>
        </Card.Content>
      </Card>

      {/* ✅ Year Picker */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Contract Terms</Text>

          <Text style={styles.label}>Duration Year *</Text>
          <YearPickerInput
            value={state.form.Year}
            onChange={(y) => handleFieldChange("Year", y)}
          />

          <HelperText type="error">{errors.Year}</HelperText>
        </Card.Content>
      </Card>

      {/* ✅ Submit */}
      <Button
        mode="contained"
        style={styles.submitButton}
        onPress={() => {
          if (!validateForm()) return;

          const dataToSend = {
            seeds: state.form.seeds,
            DistributedFarmerid: aadharExtraFields.DistrubutedFarnerId,
            Farmerid: selectedFarmerId,
            selectedLandId,
            Certificate: state.form.CertificateNo,
            Survey: state.form.SurveyNo,
            ...aadharExtraFields,
            Year: state.form.Year,
          };

          setFormData(dataToSend);
          navigation.navigate("Agreement");
        }}
      >
        Next
      </Button>

    </KeyboardAwareScrollView>
  );
};

export default AgreementForm;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContent: { padding: 16 },
  sectionCard: { marginBottom: 16, borderRadius: 12, backgroundColor: "white" },
  farmerCard: { marginBottom: 16, padding: 10, borderRadius: 12, backgroundColor: "#fff" },
  simpleInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, paddingHorizontal: 14, height: 40 },
  inputError: { borderColor: "red" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  landCard: { padding: 10, marginVertical: 4, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", padding: 8, backgroundColor: "#f7f7f7", borderRadius: 8 },
  detailLabel: { fontSize: 15, color: "#555" },
  detailValue: { fontSize: 15, fontWeight: "600" },
  rowDivider: { height: 1, backgroundColor: "#ddd", marginVertical: 4 },
  headerDivider: { height: 1, backgroundColor: "#ccc", marginBottom: 10 },
  submitButton: { marginTop: 10, backgroundColor: "#4CAF50" },
});
