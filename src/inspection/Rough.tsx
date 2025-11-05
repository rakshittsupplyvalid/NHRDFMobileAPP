import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, Alert, ActivityIndicator, Image, BackHandler
} from "react-native";
import { Card, RadioButton, Button, HelperText } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import apiClient, { retrieveToken } from "../Service/apiInterceptors";
import { launchCamera } from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNFS from 'react-native-fs';
import SignatureView from "../Signature/SignatureScreen";
import { styles } from "./InspectionScreen.styles";
import useForm from "../Form/UseForm";
// ✅ Inspection Screen
const InspectionScreen = () => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const { agreementId } = (route.params as { agreementId?: string }) || {};

  // ✅ Using global form hook
  const { state, updateForm, updateState } = useForm();
  const form = state.form; // shortcut

  const [seedList, setSeedList] = useState([]);
  const [dateField, setDateField] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [currentSignatureField, setCurrentSignatureField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch Agreement Details
  const fetchAgreementDetails = async () => {
    try {
      const response = await apiClient.get(`/api/agreement/${agreementId}`);
      const d = response.data;

      updateForm({
        VarietyId: d.varietyid,
        CommodityId: d.commodityid,
        FarmerId: d.farmerid,
        FarmerDistributionId: d.farmerdistributionid
      });

    } catch (e) {
      console.log("Agreement fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch seed list
  const fetchSeedData = async () => {
    try {
      const res = await apiClient.get(`/api/class/seed?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED`);
      const formatted = res.data.map((item: any) => ({
        label: item.name, value: item.id
      }));
      setSeedList(formatted);
    } catch (e) {
      console.log("Seed fetch error", e);
    }
  };

  useEffect(() => {
    if (agreementId) fetchAgreementDetails();
    fetchSeedData();
  }, []);

  // ✅ Camera
  const openCamera = (field: string) => {
    launchCamera({ mediaType: "photo" }, (res: any) => {
      if (res?.assets?.[0]?.uri) {
        updateForm({ [field]: res.assets[0].uri });
      }
    });
  };

  // ✅ Signature Modal
  const saveSignature = (data: string) => {
    updateForm({ [currentSignatureField!]: data });
    setSignatureModalVisible(false);
  };

  // ✅ Date
  const handleDateConfirm = (date: Date) => {
    const formatted = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    updateForm({ [dateField!]: formatted });
    setShowDatePicker(false);
  };

  // ✅ Submit
  const base64File = async (b64: string, name: string) => {
    const clean = b64.replace(/^data:image\/\w+;base64,/, '');
    const filePath = `${RNFS.CachesDirectoryPath}/${name}`;
    await RNFS.writeFile(filePath, clean, 'base64');
    return { uri: `file://${filePath}`, type: "image/png", name };
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      const token = await retrieveToken();
      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (v !== null) fd.append(k, v as any);
      });

      // convert signatures
      for (const s of ["GrowerSignature","OfficerSignature","CenterInchargeSignature"]) {
        if (form[s]) {
          const file = await base64File(form[s], `${s}.png`);
          fd.append(s, file as any);
        }
      }

      const res = await apiClient.post(`/api/inspection/${agreementId}`, fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
      });

      Alert.alert("Success", "Inspection Saved", [{
        text:"OK", onPress:()=>navigation.navigate("AgreementListScreen")
      }]);

      updateState(null); // reset

    } catch (e:any) {
      console.log(e);
      Alert.alert("Error", e?.response?.data?.message || "Submit Fail");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Android back override
  useFocusEffect(useCallback(()=>{
    const back = ()=>{ navigation.navigate("AgreementListScreen"); return true };
    BackHandler.addEventListener("hardwareBackPress", back);
    return ()=>BackHandler.removeEventListener("hardwareBackPress", back);
  },[]));

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
      <ScrollView contentContainerStyle={{paddingBottom:80}}>
        
        <Card style={styles.card}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="clipboard-text" size={30} color="#2E7D32" />
            <Text style={styles.headerTitle}>Inspection Details</Text>
          </View>

          <Card.Content style={styles.content}>
            
            {/* ✅ Input */}
            <Text style={styles.label}>Inspection No</Text>
            <TextInput
              style={styles.input}
              value={form.InspectionNo}
              onChangeText={(t)=>updateForm({InspectionNo:t})}
            />

            {/* ✅ Source of Seed */}
            <Text style={styles.label}>Source Of Seed</Text>
            <CommonPicker
              data={seedList}
              value={form.SourceOfSeed}
              onChange={(v)=>updateForm({SourceOfSeed:v})}
              placeholder="Select seed source"
            />

            {/* ✅ Button */}
            <Button mode="contained" onPress={submit} loading={submitting}>
              Submit Inspection
            </Button>

          </Card.Content>
        </Card>
      </ScrollView>

      {/* ✅ Date Picker */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={()=>setShowDatePicker(false)}
      />

      {/* ✅ Signature Modal */}
      <Modal visible={signatureModalVisible} transparent>
        <SignatureView onSave={saveSignature} onCancel={()=>setSignatureModalVisible(false)} />
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default InspectionScreen;
