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
import { launchCamera, CameraOptions } from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNFS from 'react-native-fs';

import { styles } from "./InspectionScreen.styles";
import apiClient, { retrieveToken } from "../Service/apiInterceptors";
import SignatureView from "../Signature/SignatureScreen";

interface FormDataType {
  InspectionNo: string;
  InspectionDate: string;
  HarvestingDate: string;
  DurationFrom: string;
  DurationTo: string;
  SourceOfSeed: string;
  InspectedArea: number;
  PreviousCrop: string;
  FieldCount: number;
  CropCondition: string;
  StandardOfSeed: boolean;
  Reason: string;
  IsThisFinalReport: boolean;
  EstimatedSeedYield: string;
  GrowerRepresentative: string;
  Remarks: string;
  Latitude: number;
  Longitude: number;
  GeoImage: string | null;
  GrowerSignature: string | null;
  OfficerSignature: string | null;
  CenterInchargeSignature: string | null;
  VarietyId: string;
  CommodityId: string;
  FarmerId: string;
  FarmerDistributionId: string;
}

interface OfftypeData {
  nature: string;
  count: string;
}

interface FormErrorsType {
  [key: string]: string;
}

interface AgreementIdsType {
  VarietyId: string;
  CommodityId: string;
  FarmerId: string;
  FarmerDistributionId: string;
  VarietyName: string;
  SeedClass: string;
  CommodityName: string;
  Authorizedname: string;
}

const InspectionScreen = () => {
  const route = useRoute();
  const navigation: any = useNavigation();
  const { agreementId } = (route.params as { agreementId?: string }) || {};

  // State Management
  const [formData, setFormData] = useState<FormDataType>({
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

  const [agreementIds, setAgreementIds] = useState<AgreementIdsType>({
    VarietyId: "",
    CommodityId: "",
    FarmerId: "",
    FarmerDistributionId: "",
    VarietyName: "",
    SeedClass: "",
    CommodityName: "",
    Authorizedname: ""


  });

  // Offtypes State - 10 count numbers with 2 input boxes each
  const [offtypes, setOfftypes] = useState<OfftypeData[]>([
    { nature: "", count: "" },
    { nature: "", count: "" },

  ]);

  const [errors, setErrors] = useState<FormErrorsType>({});
  const [offtypeErrors, setOfftypeErrors] = useState<{ [key: string]: string }[]>(
    Array(10).fill({ nature: "", count: "" })
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFirstInspection, setIsFirstInspection] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [seasonData, setSeasonData] = useState<any[]>([]);
  const [seedList, setSeedList] = useState<any[]>([]);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [currentSignatureField, setCurrentSignatureField] = useState<string | null>(null);
  const [subSeasonList, setSubSeasonList] = useState([]);
  const [selectedSubSeason, setSelectedSubSeason] = useState("");
  const [classSeedList, setClassSeedList] = useState([]);
  const [loadingClassSeed, setLoadingClassSeed] = useState(false);



  // Camera Options
  const cameraOptions: CameraOptions = {
    mediaType: 'photo',
    quality: 0.8,
    cameraType: 'back',
    saveToPhotos: true,
  };

  // API Calls

  const fetchAgreementDetails = async () => {
    if (!agreementId) {
      console.log("❌ No agreementId provided");
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.get(`/api/agreement/${agreementId}`);
      const agreementData = response.data;



      setAgreementIds(prev => ({
        VarietyId: agreementData?.varietyid || "",
        CommodityId: agreementData?.commodityid || "",
        FarmerId: agreementData?.farmerid || "",
        FarmerDistributionId: agreementData?.farmerdistributionid || "",
        VarietyName: agreementData?.varietyname || "",
        CommodityName: agreementData?.commodityname || "",
        Authorizedname: agreementData?.authorizedname || "",

        // ✅ FIRST: user value preserve (prev.SeedClass) OR API default
        // ✅ OTHER: API value only
        SeedClass: isFirstInspection
          ? (prev.SeedClass || agreementData?.plantingmaterial || "")
          : (agreementData?.plantingmaterial || "")
      }));


      setFormData(prev => ({
        ...prev,
        VarietyId: agreementData?.varietyid || "",
        CommodityId: agreementData?.commodityid || "",
        FarmerId: agreementData?.farmerid || "",
        FarmerDistributionId: agreementData?.farmerdistributionid || "",
      }));

    } catch (error) {
      console.log("❌ Error fetching agreement:", error);
      Alert.alert("Error", "Failed to load agreement details");
    } finally {
      setLoading(false);
    }
  };


  const fetchClassSeed = async () => {
    try {
      setLoadingClassSeed(true);

      const response = await apiClient.get(
        "/api/class/seed?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED"
      );

      const formatted = response.data.map((item) => ({
        label: item.name,    // change if key different
        value: item.id       // change if key different
      }));

      setClassSeedList(formatted);
    } catch (error) {
      console.log("Class seed fetch error:", error);
    } finally {
      setLoadingClassSeed(false);
    }
  };

  useEffect(() => {
    fetchClassSeed();
  }, []);


  const fetchSeasonData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        "/api/season?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED"
      );

      // console.log("📅 Season Data:", response.data);

      const dropdownList = response.data?.map((item: any) => ({
        label: item?.name,
        value: item?.id,
      }));

      setSeasonData(dropdownList || []);
    } catch (error) {
      console.error("❌ Season API error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeedData = async () => {
    try {
      const response = await apiClient.get(
        `/api/class/seed?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED`
      );

      const formattedData = response.data.map((item: any) => ({
        label: item.name,
        value: item.id
      }));

      setSeedList(formattedData);
    } catch (error) {
      console.log("❌ Error fetching seed list:", error);
    }
  };

  // Effects
  useEffect(() => {
    if (agreementId) {
      fetchAgreementDetails();
    }
  }, [agreementId]);

  useEffect(() => {
    fetchSeasonData();
    fetchSeedData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("AgreementListScreen");
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  // Camera Functions
  const launchCameraForField = (field: string) => {
    launchCamera(cameraOptions, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', `Camera Error: ${response.errorMessage}`);
      } else if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          setFormData(prev => ({
            ...prev,
            [field]: imageUri
          }));
        }
      }
    });
  };

  // Signature Functions
  const openSignatureModal = (field: string) => {
    setCurrentSignatureField(field);
    setSignatureModalVisible(true);
  };

  const handleSignatureSave = (signatureData: string) => {
    if (currentSignatureField) {
      setFormData(prev => ({
        ...prev,
        [currentSignatureField]: signatureData
      }));
    }
    setSignatureModalVisible(false);
    setCurrentSignatureField(null);
  };

  const clearSignature = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: null
    }));
  };

  // Date Functions
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const handleDateConfirm = (date: Date) => {
    if (dateField) {
      const formattedDate = formatDateForAPI(date);

      // ✅ 1. Update the date
      setFormData(prev => ({
        ...prev,
        [dateField]: formattedDate
      }));

      // ✅ 2. Clear the error for that field
      setErrors(prev => ({
        ...prev,
        [dateField]: ""
      }));
    }

    setShowDatePicker(false);
    setDateField(null);
  };


  const openDatePicker = (field: string) => {
    setDateField(field);
    setShowDatePicker(true);
  };

  const displayDate = (dateString: string) => {
    if (!dateString) return "Select date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Offtype Handlers
  const handleOfftypeChange = (index: number, field: keyof OfftypeData, value: string) => {
    const updatedOfftypes = [...offtypes];
    updatedOfftypes[index] = {
      ...updatedOfftypes[index],
      [field]: value
    };
    setOfftypes(updatedOfftypes);

    // Validate offtype fields
    validateOfftypeField(index, field, value);
  };

  const validateOfftypeField = (index: number, field: keyof OfftypeData, value: string) => {
    let error = "";

    if (field === 'count' && value && (isNaN(Number(value)) || Number(value) < 0)) {
      error = "Please enter a valid number";
    }

    if (field === 'nature' && value && value.length > 100) {
      error = "Nature should be less than 100 characters";
    }

    const updatedErrors = [...offtypeErrors];
    updatedErrors[index] = {
      ...updatedErrors[index],
      [field]: error
    };
    setOfftypeErrors(updatedErrors);
  };

  const addMoreOfftypes = () => {
    setOfftypes(prev => [...prev, { nature: "", count: "" }]);
    setOfftypeErrors(prev => [...prev, { nature: "", count: "" }]);
  };

  const removeOfftype = (index: number) => {
    if (offtypes.length > 10) {
      const updatedOfftypes = [...offtypes];
      const updatedErrors = [...offtypeErrors];

      updatedOfftypes.splice(index, 1);
      updatedErrors.splice(index, 1);

      setOfftypes(updatedOfftypes);
      setOfftypeErrors(updatedErrors);
    } else {
      Alert.alert("Cannot Remove", "Minimum 10 offtype entries are required");
    }
  };

  // Validation
  const validateField = (field: string, value: any) => {
    let error = "";

    const requiredFields = [
      'InspectionNo',
      'InspectionDate',
      'HarvestingDate',
      'DurationFrom',
      'DurationTo',
      'SourceOfSeed',
      'PreviousCrop',
      'CropCondition',
      'InspectedArea',
      'FieldCount',
      'EstimatedSeedYield',
      'GrowerRepresentative',
      'Remarks',
      'Latitude',
      'Longitude',
      'GeoImage',
      'GrowerSignature',
      'OfficerSignature',
      'CenterInchargeSignature',

      // ✅ Add these two new required fields
      'Year',
      'Season'
    ];

    if (requiredFields.includes(field) && (!value || value.toString().trim() === "")) {
      error = "This field is required";
    } else {
      if (["InspectedArea", "FieldCount", "Latitude", "Longitude"].includes(field)) {
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = "Please enter a valid number";
        }
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSeasonSelect = async (value: string) => {
    setSelectedSeason(value);
    console.log("Selected Season ID:", value);

    try {
      const response = await apiClient.get(`/api/subseason/${value}`);
      console.log("SubSeason Data:", response.data);

      // dropdown data format me set karo
      const formattedData = response.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));

      setSubSeasonList(formattedData);
    } catch (error) {
      console.log("Error fetching subseason:", error);
    }
  };


  // Form Submission
  const base64ToFile = async (base64String: string, fileName: string) => {
    try {
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, base64Data, 'base64');

      return {
        uri: `file://${filePath}`,
        type: 'image/png',
        name: fileName
      };
    } catch (error) {
      console.error('❌ Base64 to File Error:', error);
      throw error;
    }
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      'InspectionNo', 'InspectionDate', 'HarvestingDate', 'DurationFrom', 'DurationTo',
      'SourceOfSeed', 'PreviousCrop', 'CropCondition'
    ];

    let isValid = true;
    const newErrors: FormErrorsType = {};

    // Validate main form fields
    requiredFields.forEach(field => {
      const value = formData[field as keyof FormDataType];
      if (!value || value.toString().trim() === "") {
        newErrors[field] = "This field is required";
        isValid = false;
      }
    });

    // Numeric field validation
    if (formData.InspectedArea <= 0) {
      newErrors.InspectedArea = "Please enter a valid area";
      isValid = false;
    }

    if (formData.FieldCount <= 0) {
      newErrors.FieldCount = "Please enter a valid field count";
      isValid = false;
    }

    // Validate offtypes
    const hasOfftypeErrors = offtypeErrors.some(error =>
      error.nature !== "" || error.count !== ""
    );

    if (hasOfftypeErrors) {
      Alert.alert("Validation Error", "Please fix offtype field errors before submitting");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill all required fields correctly");
      return;
    }

    if (!agreementId) {
      Alert.alert("Error", "Agreement ID is missing");
      return;
    }

    try {
      setSubmitting(true);

      const token = await retrieveToken();
      const requestData = new FormData();

      // Append agreement IDs
      requestData.append("VarietyId", agreementIds.VarietyId);
      requestData.append("CommodityId", agreementIds.CommodityId);
      requestData.append("FarmerId", agreementIds.FarmerId);
      requestData.append("FarmerDistributionId", agreementIds.FarmerDistributionId);

      // Append form data
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof FormDataType];
        if (value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            requestData.append(key, value.toString());
          } else {
            requestData.append(key, value.toString());
          }
        }
      });

      // Append offtypes data as JSON string
      const offtypesData = offtypes.map((offtype, index) => ({
        countNumber: index + 1,
        natureOfOfftype: offtype.nature,
        numberOfPlants: offtype.count ? parseInt(offtype.count) : 0
      }));

      requestData.append("Offtypes", JSON.stringify(offtypesData));

      // Handle file attachments
      if (formData.GeoImage) {
        requestData.append("GeoImage", {
          uri: formData.GeoImage,
          type: 'image/jpeg',
          name: 'geo_image.jpg',
        } as any);
      }

      // Handle signatures
      if (formData.GrowerSignature) {
        const growerFile = await base64ToFile(formData.GrowerSignature, "grower_signature.png");
        requestData.append("GrowerSignature", growerFile as any);
      }

      if (formData.OfficerSignature) {
        const officerFile = await base64ToFile(formData.OfficerSignature, "officer_signature.png");
        requestData.append("OfficerSignature", officerFile as any);
      }

      if (formData.CenterInchargeSignature) {
        const inchargeFile = await base64ToFile(formData.CenterInchargeSignature, "center_incharge_signature.png");
        requestData.append("CenterInchargeSignature", inchargeFile as any);
      }

      console.log("🚀 Submitting Inspection Data...");
      console.log("Offtypes Data:", offtypesData);

      const response = await apiClient.post(
        `/api/inspection/${agreementId}`,
        requestData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ API Response:", response.data);

      Alert.alert(
        "Success",
        "Inspection created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Dashboard" }],
              });
            }
          }
        ]
      );


    } catch (error: any) {
      console.error("❌ Error submitting inspection:", error);
      Alert.alert(
        "Submission Failed",
        error?.response?.data?.message || "Failed to submit inspection data. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reusable Components
  const RadioGroup = ({ value, onValueChange, options, label, field }: any) => (
    <View style={styles.radioGroup}>
      <Text style={styles.label}>{label}</Text>
      <RadioButton.Group onValueChange={onValueChange} value={value}>
        <View style={styles.radioContainer}>
          {options.map((option: any) => (
            <View key={option.value} style={styles.radioOption}>
              <RadioButton value={option.value} />
              <Text style={styles.radioLabel}>{option.label}</Text>
            </View>
          ))}
        </View>
      </RadioButton.Group>
      {errors[field] && (
        <HelperText type="error" visible={true}>
          {errors[field]}
        </HelperText>
      )}
    </View>
  );

  const ImagePickerField = ({ label, value, onPress, field }: any) => (
    <View style={styles.imagePickerContainer}>
      <Text style={styles.label}>{label}</Text>
      <Button
        mode="outlined"
        onPress={onPress}
        style={styles.imagePickerButton}
        icon="camera"
      >
        {value ? "Retake Photo" : "Take Photo"}
      </Button>
      {value && (
        <Image source={{ uri: value }} style={styles.previewImage} />
      )}
      {errors[field] && (
        <HelperText type="error" visible={true}>
          {errors[field]}
        </HelperText>
      )}
    </View>
  );

  const SignatureField = ({ label, value, field }: any) => (
    <View style={styles.signatureFieldContainer}>
      <Text style={styles.label}>{label}</Text>
      {value ? (
        <View style={styles.signaturePreviewContainer}>
          <Image
            source={{ uri: value }}
            style={styles.signatureImage}
            resizeMode="contain"
          />
          <View style={styles.signatureActions}>
            <Button
              mode="outlined"
              onPress={() => openSignatureModal(field)}
              style={styles.signatureButton}
              icon="pencil"
            >
              Resign
            </Button>
            <Button
              mode="outlined"
              onPress={() => clearSignature(field)}
              style={[styles.signatureButton, styles.clearButton]}
              icon="delete"
              textColor="#FF3B30"
            >
              Clear
            </Button>
          </View>
        </View>
      ) : (
        <Button
          mode="outlined"
          onPress={() => openSignatureModal(field)}
          style={styles.signatureButton}
          icon="signature-freehand"
        >
          Add Signature
        </Button>
      )}
      {errors[field] && (
        <HelperText type="error" visible={true}>
          {errors[field]}
        </HelperText>
      )}
    </View>
  );

  // Offtype Field Component
  const OfftypeField = ({ index, nature, count, errors }: any) => (
    <View style={styles.offtypeRow}>
      <View style={styles.countNumber}>
        <Text style={styles.countNumberText}>{index + 1}</Text>
      </View>

      <View style={styles.offtypeInputs}>

        <View style={styles.offtypeInputContainer}>
          <Text style={styles.offtypeLabel}>Number of Plant of Offtypes</Text>
          <TextInput
            placeholder="Enter number"
            value={count}
            onChangeText={(text) => handleOfftypeChange(index, 'count', text)}
            keyboardType="numeric"
            style={[
              styles.offtypeInput,
              errors.count && styles.inputError
            ]}
          />
          {errors.count ? (
            <HelperText type="error" visible={true}>
              {errors.count}
            </HelperText>
          ) : null}
        </View>
      </View>

      {offtypes.length > 2 && (
        <Button
          mode="text"
          onPress={() => removeOfftype(index)}
          style={styles.removeButton}
          textColor="#FF3B30"
          icon="delete"
        >
          Remove
        </Button>
      )}
    </View>
  );

  const getSignatureFieldLabel = (field: string): string => {
    const labels: { [key: string]: string } = {
      GrowerSignature: "Grower Signature",
      OfficerSignature: "Officer Signature",
      CenterInchargeSignature: "Center Incharge Signature"
    };
    return labels[field] || "Signature";
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
      style={{ flex: 1, backgroundColor: "#F4F9F4" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.container}>

          {/* Inspection Details Card */}
          <Card style={styles.card}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="clipboard-text" size={30} color="#2E7D32" />
              <Text style={styles.headerTitle}>Inspection Details</Text>
            </View>

            <Card.Content style={styles.content}>
              <Text style={styles.label}>Inspection No.</Text>
              <Dropdown
                style={[styles.dropdown, errors.InspectionNo && styles.inputError]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={[
                  { label: "FIRST", value: "FIRST" },
                  { label: "SECOND", value: "SECOND" },
                  { label: "THIRD", value: "THIRD" },
                  { label: "FOURTH", value: "FOURTH" },
                ]}
                maxHeight={200}
                labelField="label"
                valueField="value"
                placeholder="Select Inspection Number"
                value={formData.InspectionNo}
                onChange={(item) => {
                  handleChange("InspectionNo", item.value);
                  setIsFirstInspection(item.value === "FIRST"); // ✅ Enable only when FIRST
                }}
                mode="modal"
              />
              {errors.InspectionNo && (
                <HelperText type="error" visible>
                  {errors.InspectionNo}
                </HelperText>
              )}

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Inspection Date</Text>
                  <Button
                    mode="outlined"
                    onPress={() => openDatePicker("InspectionDate")}
                    style={styles.dateButton}
                  >
                    {displayDate(formData.InspectionDate)}
                  </Button>
                  <HelperText type="error" visible={!!errors.InspectionDate}>
                    {errors.InspectionDate}
                  </HelperText>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Harvesting Date</Text>
                  <Button
                    mode="outlined"
                    onPress={() => openDatePicker("HarvestingDate")}
                    style={styles.dateButton}
                  >
                    {displayDate(formData.HarvestingDate)}
                  </Button>
                  <HelperText type="error" visible={!!errors.HarvestingDate}>
                    {errors.HarvestingDate}
                  </HelperText>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Duration From</Text>
                  <Button mode="outlined" onPress={() => openDatePicker("DurationFrom")} style={styles.dateButton}>
                    {displayDate(formData.DurationFrom)}
                  </Button>
                  <HelperText type="error" visible={!!errors.DurationFrom}>
                    {errors.DurationFrom}
                  </HelperText>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Duration To</Text>
                  <Button mode="outlined" onPress={() => openDatePicker("DurationTo")} style={styles.dateButton}>
                    {displayDate(formData.DurationTo)}
                  </Button>
                  <HelperText type="error" visible={!!errors.DurationTo}>
                    {errors.DurationTo}
                  </HelperText>
                </View>
              </View>


              <Text style={styles.label}>Variety Name</Text>
              <TextInput
                placeholder="Enter Variety Name"
                value={agreementIds.VarietyName}
                editable={false}
                style={styles.input}
              />


              <Text style={styles.label}>Class of Seed</Text>

              <Dropdown
                style={[
                  styles.dropdown,
                  !isFirstInspection && { backgroundColor: "#e5e5e5" } // disabled look
                ]}
                data={classSeedList}
                labelField="label"
                valueField="value"
                placeholder={loadingClassSeed ? "Loading..." : "Select Class of Seed"}

                // ✅ FIRST + SECOND + THIRD + FOURTH → always show API OR saved value
                value={agreementIds.SeedClass}

                onChange={(item) => {
                  if (isFirstInspection) {
                    // ✅ FIRST inspection only
                    setAgreementIds(prev => ({
                      ...prev,
                      SeedClass: item.value
                    }));
                  }
                }}

                mode="modal"

                // ✅ Disable for 2/3/4
                disable={!isFirstInspection}
              />



              <Text style={styles.label}>Crop</Text>
              <TextInput
                placeholder="Enter crop"
                value={agreementIds.CommodityName}
                style={styles.input}
                editable={false}

              />



              <Text style={styles.label}>Previous Crop</Text>
              <TextInput
                placeholder="Enter previous crop"
                placeholderTextColor="#141414ff"
                value={formData.PreviousCrop}
                onChangeText={(text) => handleChange("PreviousCrop", text)}
                style={styles.input}
              />
              {errors.PreviousCrop && (
                <HelperText type="error" visible>
                  {errors.PreviousCrop}
                </HelperText>
              )}


              <Text style={styles.label}>Source of Seed</Text>
              <TextInput
                placeholder="Enter Source of Seed"
                placeholderTextColor="#141414ff"
                value={formData.SourceOfSeed}
                onChangeText={(text) => handleChange("SourceOfSeed", text)}
                style={[
                  styles.input,
                  errors.SourceOfSeed && { borderColor: "red" }
                ]}
              />
              {errors.SourceOfSeed && (
                <HelperText type="error" visible={true}>
                  {errors.SourceOfSeed}
                </HelperText>
              )}


              <Text style={styles.label}>Year</Text>
              <Dropdown
                style={[styles.dropdown]}
                data={seasonData}
                value={selectedSeason}
                placeholder={!loading ? "Select Year" : "Loading..."}
                labelField="label"
                valueField="value"
                onChange={(item) => handleSeasonSelect(item.value)}
                mode="modal"
              />

              <HelperText type="error" visible={!!errors.Year}>
                {errors.Year}
              </HelperText>

              <Text style={styles.label}>Season</Text>
              <Dropdown
                style={styles.dropdown}
                data={subSeasonList}
                labelField="label"
                valueField="value"
                placeholder="Select Season"
                value={selectedSubSeason}
                onChange={(item) => {
                  setSelectedSubSeason(item.value);
                  console.log("Selected SubSeason:", item);
                }}
              />

              <HelperText type="error" visible={!!errors.Season}>
                {errors.Season}
              </HelperText>


              <Text style={styles.label}>Crop Condition</Text>
              <Dropdown
                style={[styles.dropdown, errors.CropCondition && styles.inputError]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={[
                  { label: "Excellent", value: "Excellent" },
                  { label: "Good", value: "Good" },
                  { label: "Fair", value: "Fair" },
                  { label: "Poor", value: "Poor" },
                ]}
                maxHeight={200}
                labelField="label"
                valueField="value"
                placeholder="Select Crop Condition"
                value={formData.CropCondition}
                onChange={(item) => handleChange("CropCondition", item.value)}
                mode="modal"
              />
              {errors.CropCondition && (
                <HelperText type="error" visible>
                  {errors.CropCondition}
                </HelperText>
              )}

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Inspected Area</Text>
                  <TextInput
                    placeholder="Enter area"
                    placeholderTextColor="#141414ff"
                    value={formData.InspectedArea.toString()}
                    onChangeText={(text) => handleChange("InspectedArea", text)}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.InspectedArea}>
                    {errors.InspectedArea}
                  </HelperText>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Field Count</Text>
                  <TextInput
                    placeholder="Enter field count"
                    placeholderTextColor="#141414ff"
                    value={formData.FieldCount.toString()}
                    onChangeText={(text) => handleChange("FieldCount", text)}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.FieldCount}>
                    {errors.FieldCount}
                  </HelperText>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Offtypes Card */}
          <Card style={styles.card}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="format-list-numbered" size={30} color="#2E7D32" />
              <Text style={styles.headerTitle}>Offtypes Details</Text>
            </View>

            <Card.Content style={styles.content}>
              <Text style={styles.sectionDescription}>
                Please fill in the nature and number of plants for each offtype count (1-10)
              </Text>

              {offtypes.map((offtype, index) => (
                <OfftypeField
                  key={index}
                  index={index}
                  nature={offtype.nature}
                  count={offtype.count}
                  errors={offtypeErrors[index]}
                />
              ))}

              <Button
                mode="outlined"
                onPress={addMoreOfftypes}
                style={styles.addMoreButton}
                icon="plus"
              >
                Add More Offtypes
              </Button>
            </Card.Content>
          </Card>

          {/* Standards & Report Card */}
          <Card style={styles.card}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="certificate" size={30} color="#2E7D32" />
              <Text style={styles.headerTitle}>Standards & Report</Text>
            </View>

            <Card.Content style={styles.content}>
              <RadioGroup
                label="Standard of Seed"
                value={formData.StandardOfSeed ? "true" : "false"}
                onValueChange={(value) => handleChange("StandardOfSeed", value === "true")}
                options={[
                  { label: "Yes", value: "true" },
                  { label: "No", value: "false" },
                ]}
                field="StandardOfSeed"
              />

              {!formData.StandardOfSeed && (
                <>
                  <Text style={styles.label}>Reason</Text>
                  <TextInput
                    placeholder="Enter reason"
                    placeholderTextColor="#141414ff"
                    value={formData.Reason}
                    onChangeText={(text) => handleChange("Reason", text)}
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.Reason}>
                    {errors.Reason}
                  </HelperText>
                </>
              )}

              <RadioGroup
                label="Is This Final Report?"
                value={formData.IsThisFinalReport ? "true" : "false"}
                onValueChange={(value) => handleChange("IsThisFinalReport", value === "true")}
                options={[
                  { label: "Yes", value: "true" },
                  { label: "No", value: "false" },
                ]}
                field="IsThisFinalReport"
              />

              <Text style={styles.label}>Estimated Seed Yield</Text>
              <TextInput
                placeholder="Enter estimated yield"
                placeholderTextColor="#141414ff"
                value={formData.EstimatedSeedYield}
                onChangeText={(text) => handleChange("EstimatedSeedYield", text)}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.EstimatedSeedYield}>
                {errors.EstimatedSeedYield}
              </HelperText>

              <Text style={styles.label}>Grower Representative</Text>
              <TextInput
                placeholder="Enter representative name"
                placeholderTextColor="#141414ff"
                value={agreementIds.Authorizedname}
                onChangeText={(text) => handleChange("GrowerRepresentative", text)}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.GrowerRepresentative}>
                {errors.GrowerRepresentative}
              </HelperText>

              <Text style={styles.label}>Remarks</Text>
              <TextInput
                placeholder="Enter remarks"
                placeholderTextColor="#141414ff"
                value={formData.Remarks}
                onChangeText={(text) => handleChange("Remarks", text)}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.Remarks}>
                {errors.Remarks}
              </HelperText>
            </Card.Content>
          </Card>

          {/* Location Details Card */}
          {/* <Card style={styles.card}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="map-marker" size={30} color="#2E7D32" />
              <Text style={styles.headerTitle}>Location Details</Text>
            </View>

            <Card.Content style={styles.content}>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Latitude</Text>
                  <TextInput
                    placeholder="Enter latitude"
                    placeholderTextColor="#141414ff"
                    value={formData.Latitude.toString()}
                    onChangeText={(text) => handleChange("Latitude", text)}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.Latitude}>
                    {errors.Latitude}
                  </HelperText>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Longitude</Text>
                  <TextInput
                    placeholder="Enter longitude"
                    placeholderTextColor="#141414ff"
                    value={formData.Longitude.toString()}
                    onChangeText={(text) => handleChange("Longitude", text)}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.Longitude}>
                    {errors.Longitude}
                  </HelperText>
                </View>
              </View>

              <ImagePickerField
                label="Capture Image"
                value={formData.GeoImage}
                onPress={() => launchCameraForField("GeoImage")}
                field="GeoImage"
              />
            </Card.Content>
          </Card> */}

          {/* Signatures Card */}
          <Card style={styles.card}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="signature" size={30} color="#2E7D32" />
              <Text style={styles.headerTitle}>Signatures</Text>
            </View>

            <Card.Content style={styles.content}>
              <SignatureField
                label="Grower Signature"
                value={formData.GrowerSignature}
                field="GrowerSignature"
              />

              <SignatureField
                label="Officer Signature"
                value={formData.OfficerSignature}
                field="OfficerSignature"
              />

              <SignatureField
                label="Center Incharge Signature"
                value={formData.CenterInchargeSignature}
                field="CenterInchargeSignature"
              />
            </Card.Content>
          </Card>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
          >
            {submitting ? "Submitting..." : "Submit Inspection"}
          </Button>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => {
          setShowDatePicker(false);
          setDateField(null);
        }}
      />

      {/* Signature Modal */}
      <Portal>
        <PaperModal
          visible={signatureModalVisible}
          onDismiss={() => setSignatureModalVisible(false)}
          contentContainerStyle={styles.signatureModal}
        >
          <View style={styles.signatureModalHeader}>
            <Text style={styles.signatureModalTitle}>
              {currentSignatureField ? getSignatureFieldLabel(currentSignatureField) : "Add Signature"}
            </Text>
            <Button
              mode="text"
              onPress={() => setSignatureModalVisible(false)}
              textColor="#636161ff"
            >
              Close
            </Button>
          </View>

          <View style={styles.signatureModalContent}>
            <SignatureView onSave={handleSignatureSave} />
          </View>
        </PaperModal>
      </Portal>
    </KeyboardAvoidingView>
  );
};

export default InspectionScreen;