import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  BackHandler,
  TextInput
} from "react-native";
import {
  Card,
  RadioButton,
  Button,
  HelperText,
  Modal as PaperModal,
  Portal,
} from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { launchCamera } from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNFS from 'react-native-fs';
import { styles } from "./InspectionScreen.styles";
import apiClient, { retrieveToken } from "../Service/apiInterceptors";
import SignatureView from "../Signature/SignatureScreen";

const InspectionScreen = () => {
  const route = useRoute();
  const navigation: any = useNavigation();
  const { agreementId } = (route.params as { agreementId?: string }) || {};

  const [formData, setFormData] = useState({
    InspectionNo: "",
    InspectionDate: "",
    HarvestingDate: "",
    DurationFrom: "",
    DurationTo: "",
    SourceOfSeed: "",
    InspectedArea: 0,
    PreviousCrop: "",
    FieldCount: 0,
    CropCondition: "",
    StandardOfSeed: true,
    Reason: "",
    IsThisFinalReport: false,
    EstimatedSeedYield: "",
    GrowerRepresentative: "",
    Remarks: "",
    Latitude: 0,
    Longitude: 0,
    GeoImage: null,
    GrowerSignature: null,
    OfficerSignature: null,
    CenterInchargeSignature: null,
    VarietyId: "",
    CommodityId: "",
    FarmerId: "",
    FarmerDistributionId: "",
  });

  const [agreementIds, setAgreementIds] = useState({
    VarietyId: "",
    CommodityId: "",
    FarmerId: "",
    FarmerDistributionId: "",
    VarietyName: "",
    SeedClass: "",
    CommodityName: "",
    Authorizedname: ""
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFirstInspection, setIsFirstInspection] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState<string | null>(null);
  const [errors, setErrors] = useState({});
  const [classSeedList, setClassSeedList] = useState<any[]>([]);
  const [loadingClassSeed, setLoadingClassSeed] = useState(false);

  // 📅 Set “Inspection Today” default date
  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    setFormData(prev => ({
      ...prev,
      InspectionDate: prev.InspectionDate || formatted
    }));
  }, []);

  // 📦 Fetch class of seed
  const fetchClassSeed = async () => {
    try {
      setLoadingClassSeed(true);
      const res = await apiClient.get("/api/class/seed");
      const formatted = res.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));
      setClassSeedList(formatted);
    } catch (e) {
      console.log("Seed list error:", e);
    } finally {
      setLoadingClassSeed(false);
    }
  };

  useEffect(() => {
    fetchClassSeed();
  }, []);

  const openDatePicker = (field: string) => {
    setDateField(field);
    setShowDatePicker(true);
  };

  const handleDateConfirm = (date: Date) => {
    const formatted = date.toISOString().split("T")[0];
    if (dateField) {
      setFormData(prev => ({ ...prev, [dateField]: formatted }));
    }
    setShowDatePicker(false);
    setDateField(null);
  };

  const displayDate = (dateString: string) => {
    if (!dateString) return "Select date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    Alert.alert("Submitted!", "Inspection data saved successfully (demo).");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading inspection data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.container}>
          <Card style={styles.card}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="clipboard-text" size={30} color="#2E7D32" />
              <Text style={styles.headerTitle}>Inspection Details</Text>
            </View>

            <Card.Content style={styles.content}>
              {/* Inspection Number */}
              <Text style={styles.label}>Inspection No.</Text>
              <Dropdown
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyle}
                data={[
                  { label: "FIRST", value: "FIRST" },
                  { label: "SECOND", value: "SECOND" },
                  { label: "THIRD", value: "THIRD" },
                  { label: "FOURTH", value: "FOURTH" },
                ]}
                labelField="label"
                valueField="value"
                placeholder="Select Inspection Number"
                value={formData.InspectionNo}
                onChange={(item) => {
                  handleChange("InspectionNo", item.value);
                  setIsFirstInspection(item.value === "FIRST");
                }}
                mode="modal"
              />

              {/* Dates */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Inspection Date</Text>
                  <Button
                    mode="outlined"
                    onPress={() => openDatePicker("InspectionDate")}
                    style={styles.dateButton}
                    textColor="#000"
                  >
                    {displayDate(formData.InspectionDate)}
                  </Button>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Harvesting Date</Text>
                  <Button
                    mode="outlined"
                    onPress={() => openDatePicker("HarvestingDate")}
                    style={styles.dateButton}
                    textColor="#000"
                  >
                    {displayDate(formData.HarvestingDate)}
                  </Button>
                </View>
              </View>

              {/* Class of Seed */}
              <Text style={styles.label}>Class of Seed</Text>
              <Dropdown
                style={[
                  styles.dropdown,
                  !isFirstInspection && { backgroundColor: "#f0f0f0", opacity: 0.7 }
                ]}
                data={classSeedList}
                labelField="label"
                valueField="value"
                placeholder={loadingClassSeed ? "Loading..." : "Select Class of Seed"}
                value={agreementIds.SeedClass}
                onChange={(item) => {
                  if (isFirstInspection) {
                    setAgreementIds(prev => ({
                      ...prev,
                      SeedClass: item.value
                    }));
                  }
                }}
                disable={!isFirstInspection}
              />

              {/* Crop Condition */}
              <Text style={styles.label}>Crop Condition</Text>
              <Dropdown
                style={styles.dropdown}
                data={[
                  { label: "Excellent", value: "Excellent" },
                  { label: "Good", value: "Good" },
                  { label: "Fair", value: "Fair" },
                  { label: "Poor", value: "Poor" },
                ]}
                labelField="label"
                valueField="value"
                placeholder="Select Crop Condition"
                value={formData.CropCondition}
                onChange={(item) => handleChange("CropCondition", item.value)}
              />
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
          >
            Submit Inspection
          </Button>
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default InspectionScreen;
