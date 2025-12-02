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
  TextInput,
  PermissionsAndroid,
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
import { launchCamera, CameraOptions, Asset } from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNFS from 'react-native-fs';
import * as Location from 'expo-location';
import { styles } from "./InspectionScreen.styles";
import apiClient, { retrieveToken } from "../Service/apiInterceptors";
import SignatureView from "../Signature/SignatureScreen";

interface FormDataType {
  InspectionNo: string;
  ShowingDate: string;
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
  GeoLocation?: { latitude: number; longitude: number } | null;
  GrowerSignature: string | null;
  OfficerSignature: string | null;
  CenterInchargeSignature: string | null;
  VarietyId: string;
  CommodityId: string;
  FarmerId: string;
  FarmerDistributionId: string;
  StageofGrowthContaminant: string; // NEW FIELD
  StageofSeedAtInspection: string;  // NEW FIELD
  IsolationDistance: string;        // NEW FIELD
}

interface OfftypeData {
  naturetype: string;
  numberofplants: string;
  discription: string;
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
  SourceSeed: string;
}

const InspectionScreen = () => {
  const route = useRoute();
  const navigation: any = useNavigation();

  const { agreementId, inspectionType } = route.params as {
    agreementId: string;
    inspectionType: string;


  };


  console.log("🚀 InspectionScreen params:", { agreementId, inspectionType });



  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<FormDataType>({
    InspectionNo: "",
    InspectionDate: getTodayDate(),
    ShowingDate: "",
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
    GeoLocation: null,
    GrowerSignature: null,
    OfficerSignature: null,
    CenterInchargeSignature: null,
    VarietyId: "",
    CommodityId: "",
    FarmerId: "",
    FarmerDistributionId: "",
    StageofGrowthContaminant: "", // NEW FIELD initialized
    StageofSeedAtInspection: "",  // NEW FIELD initialized
    IsolationDistance: "",        // NEW FIELD initialized
  });
  const [agreementIds, setAgreementIds] = useState<AgreementIdsType>({
    VarietyId: "",
    CommodityId: "",
    FarmerId: "",
    FarmerDistributionId: "",
    VarietyName: "",
    SeedClass: "",
    CommodityName: "",
    Authorizedname: "",
    SourceSeed: ""
  
  });

  const [offtypes, setOfftypes] = useState<OfftypeData[]>([
    { naturetype: "", numberofplants: "", discription: "" }
  ]);

  const [errors, setErrors] = useState<FormErrorsType>({});

  const [offtypeErrors, setOfftypeErrors] = useState(
    Array.from({ length: 10 }, () => ({
      naturetype: "",
      numberofplants: ""
    }))
  );

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [minDurationToDate, setMinDurationToDate] = useState<Date | null>(null);
  const [isFirstInspection, setIsFirstInspection] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonData, setSeasonData] = useState<any[]>([]);
  const [seedList, setSeedList] = useState<any[]>([]);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [currentSignatureField, setCurrentSignatureField] = useState<string | null>(null);
  const [subSeasonList, setSubSeasonList] = useState([]);
  const [selectedSubSeason, setSelectedSubSeason] = useState(null);
  const [classSeedList, setClassSeedList] = useState([]);
  const [loadingClassSeed, setLoadingClassSeed] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  // Camera Options - Updated with better defaults
  const cameraOptions: CameraOptions = {
    mediaType: 'photo',
    quality: 0.8,
    cameraType: 'back',
    saveToPhotos: true,
    includeBase64: false,
    maxWidth: 1024,
    maxHeight: 1024,
  };

  // FIXED: Improved Android permissions handling
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      try {
        // Request CAMERA permission (required for Android 13+)
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera to take photos for inspection.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );

        if (cameraGranted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Permission Required",
            "Camera permission is required to take photos. Please enable it in app settings."
          );
          return false;
        }

        // For Android 12 and below, we may need WRITE_EXTERNAL_STORAGE
        if (Platform.Version < 33) {
          const storageGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: "Storage Permission",
              message: "This app needs access to your storage to save photos.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );

          if (storageGranted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              "Permission Required",
              "Storage permission is required to save photos. Please enable it in app settings."
            );
            return false;
          }
        }

        return true;
      } catch (err) {
        console.error("Permission error:", err);
        Alert.alert("Error", "An error occurred while requesting permissions.");
        return false;
      }
    }

    // iOS permissions are handled automatically by the library
    return true;
  };

  // FIXED: Improved openCamera function with better error handling
  const openCamera = async () => {
    try {
      setIsCameraLoading(true);

      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsCameraLoading(false);
        return;
      }

      // Request location permission
      let location = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,

          });
          console.log("📍 Location obtained:", location.coords);
        } else {
          console.log("Location permission denied, proceeding without location");
        }
      } catch (locationError) {
        console.warn("Location error:", locationError);
        // Continue without location if it fails
      }

      // Launch camera with error handling
      launchCamera(cameraOptions, (response) => {
        setIsCameraLoading(false);

        if (response.didCancel) {
          console.log("User cancelled camera");
          return;
        }

        if (response.errorCode || response.errorMessage) {
          console.error("Camera Error:", response.errorCode, response.errorMessage);
          Alert.alert(
            "Camera Error",
            response.errorMessage || "Failed to open camera. Please try again."
          );
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          const uri = asset.uri;

          if (!uri) {
            Alert.alert("Error", "Could not get image URI");
            return;
          }

          // Update form data with image and location
          const updateData: any = {
            GeoImage: uri,
          };

          if (location && location.coords) {
            updateData.GeoLocation = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            updateData.Latitude = location.coords.latitude;
            updateData.Longitude = location.coords.longitude;
          }

          setFormData((prev: FormDataType) => ({
            ...prev,
            ...updateData,
          }));

          // Clear any previous error
          setErrors((prev) => ({
            ...prev,
            GeoImage: "",
          }));

          Alert.alert("Success", "Photo captured successfully!");
        } else {
          Alert.alert("Error", "No image was captured");
        }
      });
    } catch (error) {
      setIsCameraLoading(false);
      console.error("Camera open error:", error);
      Alert.alert(
        "Error",
        "Failed to open camera. Please check if camera is available and try again."
      );
    }
  };

  // API Calls (unchanged from your original)
  const fetchAgreementDetails = async () => {
    if (!agreementId) {
      console.log("❌ No agreementId provided");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/api/agreement/${agreementId}`);
      const agreementData = response.data;


      console.log(" ***************Fetched agreement data:", agreementData)  ;


      setAgreementIds(prev => ({
        VarietyId: agreementData?.varietyid || "",
        CommodityId: agreementData?.commodityid || "",
        FarmerId: agreementData?.farmerid || "",
        FarmerDistributionId: agreementData?.farmerdistributionid || "",
        VarietyName: agreementData?.varietyname || "",
        CommodityName: agreementData?.commodityname || "",
        Authorizedname: agreementData?.authorizedname || "",
        SeedClass: agreementData?.seedclass || "",
        SourceSeed : agreementData?.sourceofseed || "",
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
        label: item.name,
        value: item.id
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

  const addOfftypeRow = () => {
    if (offtypes.length >= 10) {
      Alert.alert("Limit reached", "You can add maximum 10 offtypes.");
      return;
    }

    setOfftypes(prev => [
      ...prev,
      { naturetype: "", numberofplants: "", discription: "" }
    ]);

    setOfftypeErrors(prev => [
      ...prev,
      { naturetype: "", numberofplants: "" }
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Agreement List");
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

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
      setFormData(prev => ({
        ...prev,
        [dateField]: formattedDate
      }));

      setErrors(prev => ({
        ...prev,
        [dateField]: ""
      }));

      // Set minimum date for Duration To when Duration From is selected
      if (dateField === "DurationFrom") {
        setMinDurationToDate(date);

        // If DurationTo is already selected and is before the new DurationFrom, clear it
        if (formData.DurationTo && new Date(formData.DurationTo) < date) {
          setFormData(prev => ({
            ...prev,
            DurationTo: ""
          }));
        }
      }
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
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleOfftypeChange = (index: number, field: string, value: string) => {
    let filteredValue = value.replace(/[^0-9]/g, "");

    setOfftypes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: filteredValue };
      return updated;
    });

    validateOfftypeField(index, field, filteredValue);
  };

  const validateOfftypeField = (index: number, field: string, value: string) => {
    let error = "";

    if (field === "numberofplants") {
      if (!value || value.trim() === "") {
        error = "This field is required";
      } else if (isNaN(Number(value)) || Number(value) < 0) {
        error = "Please enter a valid number";
      } else if (Number(value) > 99) {
        error = "Maximum 99 plants allowed";
      } else if (Number(value) === 0) {
        error = "Number cannot be zero";
      }
    }

    const updatedErrors = [...offtypeErrors];
    updatedErrors[index] = {
      ...updatedErrors[index],
      [field]: error
    };

    setOfftypeErrors(updatedErrors);
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
      'GeoImage',
    ];

    if (requiredFields.includes(field) && (!value || value.toString().trim() === "")) {
      error = "This field is required";
    } else {
      if (["InspectedArea", "FieldCount", "IsolationDistance"].includes(field)) {
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = "Please enter a valid number";
        }
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleChange = (field: string, value: any) => {
    console.log(`Setting ${field} to:`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSeasonSelect = async (value: string) => {
    setSelectedSeason(value);
    console.log("Selected Season ID:", value);

    try {
      const response = await apiClient.get(`/api/subseason/${value}`);
      console.log("SubSeason Data:", response.data);

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
      'InspectionDate', 'HarvestingDate', 'DurationFrom', 'DurationTo', 'ShowingDate',
      'SourceOfSeed', 'PreviousCrop', 'CropCondition', 'GeoImage', 'StageofSeedAtInspection', 'StageofGrowthContaminant', 'IsolationDistance', 'EstimatedSeedYield', 'GrowerRepresentative', 'Remarks',
    ];

    let isValid = true;
    const newErrors: FormErrorsType = {};

    requiredFields.forEach(field => {
      const value = formData[field as keyof FormDataType];
      if (!value || value.toString().trim() === "") {
        newErrors[field] = "This field is required";
        isValid = false;
      }
    });

    if (!selectedSeason) {
      newErrors.Year = "Year is required";
      isValid = false;
    }

    if (!selectedSubSeason) {
      newErrors.Season = "Season is required";
      isValid = false;
    }

    if (formData.InspectedArea <= 0) {
      newErrors.InspectedArea = "Please enter a valid area";
      isValid = false;
    }

    if (formData.FieldCount <= 0) {
      newErrors.FieldCount = "Please enter a valid field count";
      isValid = false;
    }

    // Validate offtypes - all 10 entries must have numberofplants filled
    const hasEmptyOfftypes = offtypes.some(offtype =>
      !offtype.numberofplants || offtype.numberofplants.toString().trim() === ""
    );

    if (hasEmptyOfftypes) {
      Alert.alert("Validation Error", "Please fill all 10 offtype entries with number of plants");
      isValid = false;
    }

    const hasOfftypeErrors = offtypeErrors.some(error =>
      error.numberofplants !== ""
    );

    if (hasOfftypeErrors) {
      Alert.alert("Validation Error", "Please fix offtype field errors before submitting");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    if (inspectionType) {
      setFormData(prev => ({
        ...prev,
        InspectionNo: inspectionType.toUpperCase(),
      }));
    }
  }, [inspectionType]);

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

      // Agreement data
      requestData.append("InspectionNo", formData.InspectionNo);
      requestData.append("VarietyId", agreementIds.VarietyId);
      requestData.append("CommodityId", agreementIds.CommodityId);
      requestData.append("FarmerId", agreementIds.FarmerId);
      requestData.append("FarmerDistributionId", agreementIds.FarmerDistributionId);
      requestData.append("GrowerRepresentative", agreementIds.Authorizedname);
      requestData.append("Latitude", formData.GeoLocation?.latitude.toFixed(6) || "0");
      requestData.append("Longitude", formData.GeoLocation?.longitude.toFixed(6) || "0");


      // Form fields - include all fields including new ones
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof FormDataType];
        if (value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            requestData.append(key, value.toString());
            console.log(`Appended ${key}: ${value.toString()}`);
          } else {
            requestData.append(key, value.toString());
            console.log(`Appended ${key}: ${value.toString()}`);
          }
        } else {
          console.log(`Skipping ${key}: null or undefined`);
        }
      });

      // Offtypes - convert string values to numbers for API
      const offtypesData = offtypes.map(o => ({
        naturetype: null,
        numberofplants: Number(o.numberofplants) || 0,
        discription: null
      }));

      requestData.append("NatureOfOffTypes", JSON.stringify(offtypesData));
      console.log("🚀 Offtypes Data to Submit:", JSON.stringify(offtypesData, null, 2));

      // GeoImage
      if (formData.GeoImage) {
        requestData.append("GeoImage", {
          uri: formData.GeoImage,
          type: "image/jpeg",
          name: "geo_image.jpg",
        } as any);
        console.log("📷 Appended GeoImage");
      }

      // Grower Signature
      if (formData.GrowerSignature) {
        const growerFile = await base64ToFile(formData.GrowerSignature, "grower_signature.png");
        requestData.append("GrowerSignature", growerFile as any);
        console.log("✍️ Appended GrowerSignature");
      }

      // Officer Signature
      if (formData.OfficerSignature) {
        const officerFile = await base64ToFile(formData.OfficerSignature, "officer_signature.png");
        requestData.append("OfficerSignature", officerFile as any);
        console.log("✍️ Appended OfficerSignature");
      }

      // Center Incharge Signature
      if (formData.CenterInchargeSignature) {
        const inchargeFile = await base64ToFile(formData.CenterInchargeSignature, "center_incharge_signature.png");
        requestData.append("CenterInchargeSignature", inchargeFile as any);
        console.log("✍️ Appended CenterInchargeSignature");
      }



      // API CALL
      console.log("🚀 Making API call to:", `/api/inspection/${agreementId}`);
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
      console.error("❌ Error response:", error?.response?.data);
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
              <RadioButton value={option.value} color="#2E7D32" />
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

  // FIXED: Updated ImagePickerField component with loading state
  const ImagePickerField = ({ label, value, onPress, field }: any) => (
    <View style={styles.imagePickerContainer}>
      <Text style={styles.label}>{label}</Text>
      <Button
        mode="outlined"
        onPress={onPress}
        style={styles.imagePickerButton}
        icon={isCameraLoading ? "camera-timer" : "camera"}
        textColor="#2E7D32"
        disabled={isCameraLoading}
      >
        {isCameraLoading ? "Opening Camera..." : (value ? "Retake Photo" : "Take Photo")}
      </Button>

      {value && !isCameraLoading && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: value }} style={styles.previewImage} />

          {formData.GeoLocation && (
            <View style={styles.geoOverlay}>
              <Text style={styles.geoText}>
                Lat: {formData.GeoLocation.latitude.toFixed(6)} | Long: {formData.GeoLocation.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          <Text style={styles.imagePreviewText}>Photo captured successfully</Text>
        </View>
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
              textColor="#2E7D32"
            >
              Re-sign
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
          textColor="#2E7D32"
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

  const OfftypeField = ({ index, offtype, onChange, errors }: any) => (
    <View style={styles.offtypeRow}>
      <View style={styles.countNumber}>
        <Text style={styles.countNumberText}>{index + 1}</Text>
      </View>

      <View style={styles.offtypeInputs}>
        <View style={styles.offtypeInputContainer}>
          <Text style={styles.offtypeLabel}>Number of Plant of Offtypes *</Text>

          <TextInput
            placeholder="Enter number (1-99)"
            value={offtype.numberofplants}
            onChangeText={(text) => onChange(index, "numberofplants", text)}
            keyboardType="numeric"
            maxLength={5}
            style={[
              styles.offtypeInput,
              errors?.numberofplants && styles.inputError
            ]}
          />

          {errors?.numberofplants ? (
            <HelperText type="error" visible={true}>
              {errors.numberofplants}
            </HelperText>
          ) : null}
        </View>
      </View>
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

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Showing Date</Text>
                  <Button
                    mode="outlined"
                    onPress={() => openDatePicker("ShowingDate")}
                    style={styles.dateButton}
                    textColor="#2E7D32"
                  >
                    {displayDate(formData.ShowingDate)}
                  </Button>
                  <HelperText type="error" visible={!!errors.ShowingDate}>
                    {errors.ShowingDate}
                  </HelperText>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Expected Harvesting Date</Text>
                  <Button
                    mode="outlined"
                    onPress={() => openDatePicker("HarvestingDate")}
                    style={styles.dateButton}
                    textColor="#2E7D32"
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
                  <Button
                    mode="outlined"
                    onPress={() => openDatePicker("DurationFrom")}
                    style={styles.dateButton}
                    textColor="#2E7D32"
                  >
                    {displayDate(formData.DurationFrom)}
                  </Button>
                  <HelperText type="error" visible={!!errors.DurationFrom}>
                    {errors.DurationFrom}
                  </HelperText>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Duration To</Text>
                  <Button
                    mode="outlined"
                    onPress={() => openDatePicker("DurationTo")}
                    style={styles.dateButton}
                    textColor="#2E7D32"
                  >
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
                style={[styles.input, styles.disabledInput]}
              />

              <Text style={styles.label}>Class of Seed</Text>

              {inspectionType === "First" ? (
                // Show dropdown ONLY for First inspection
                <Dropdown
                  style={styles.dropdown}
                  data={classSeedList}
                  labelField="label"
                  valueField="value"
                  value={agreementIds.SeedClass}
                  mode="modal"
                  onChange={(item) => {
                    setAgreementIds(prev => ({ ...prev, SeedClass: item.value }));
                  }}
                />
              ) : (
                // For Second, Third, Fourth → show TextInput with auto-filled value
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={agreementIds.SeedClass}
                  editable={false}  // keep readonly
                />
              )}



              <Text style={styles.label}>Crop</Text>
              <TextInput
                placeholder="Enter crop"
                value={agreementIds.CommodityName}
                style={[styles.input, styles.disabledInput]}
                editable={false}
              />

              <Text style={styles.label}>Previous Crop</Text>
              <TextInput
                placeholder="Enter previous crop"
                placeholderTextColor="#666"
                value={formData.PreviousCrop}
                autoCorrect={false}
                autoComplete="off"
                autoCapitalize="characters"
                onChangeText={(text) =>
                  handleChange("PreviousCrop", text)
                }
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
                placeholderTextColor="#666"
                value={agreementIds.SourceSeed}
                autoCorrect={false}
                autoComplete="off"
                autoCapitalize="characters"
                onChangeText={(text) =>
                  handleChange("SourceOfSeed", text)
                }
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

              <Text style={styles.label}>Stage of Growth Contaminant</Text>
              <TextInput
                placeholder="Enter stage of growth contaminant"
                placeholderTextColor="#666"
                value={formData.StageofGrowthContaminant}
                autoCorrect={false}
                autoComplete="off"
                autoCapitalize="characters"
                onChangeText={(text) =>
                  handleChange("StageofGrowthContaminant", text)
                }
                style={styles.input}
              />
              {errors.StageofGrowthContaminant && (
                <HelperText type="error" visible={true}>
                  {errors.SourceOfSeed}
                </HelperText>
              )}


              <Text style={styles.label}>Stage of Seed at Inspection</Text>
              <TextInput
                placeholder="Enter Stage of Seed At Inspection"
                placeholderTextColor="#666"
                value={formData.StageofSeedAtInspection}
                autoCorrect={false}
                autoComplete="off"
                autoCapitalize="characters"
                onChangeText={(text) =>
                  handleChange("StageofSeedAtInspection", text)
                }
                style={styles.input}
              />

              {errors.StageofSeedAtInspection && (
                <HelperText type="error" visible={true}>
                  {errors.SourceOfSeed}
                </HelperText>
              )}




              <Text style={styles.label}>Year</Text>
              <Dropdown
                style={[styles.dropdown, errors.Year && { borderColor: "red" }]}
                data={seasonData}
                value={selectedSeason}
                placeholder={!loading ? "Select Year" : "Loading..."}
                labelField="label"
                valueField="value"
                onChange={(item) => {
                  handleSeasonSelect(item.value);
                  setErrors(prev => ({ ...prev, Year: "" }));  // FIX
                }}
                mode="modal"
              />

              <HelperText type="error" visible={!!errors.Year}>
                {errors.Year}
              </HelperText>
              <Text style={styles.label}>Season</Text>
              <Dropdown
                style={[styles.dropdown, errors.Season && { borderColor: "red" }]}
                data={subSeasonList}
                labelField="label"
                valueField="value"
                placeholder="Select Season"
                value={selectedSubSeason}
                onChange={(item) => {
                  setSelectedSubSeason(item.value);
                  setErrors(prev => ({ ...prev, Season: "" }));
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
                    placeholderTextColor="#666"
                    value={formData.InspectedArea.toString()}
                    autoCorrect={false}
                    autoComplete="off"
                    autoCapitalize="characters"
                    onChangeText={(text) =>
                      handleChange("InspectedArea", text)
                    }
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
                    placeholderTextColor="#666"
                    value={formData.FieldCount.toString()}
                    autoCorrect={false}
                    autoComplete="off"
                    autoCapitalize="characters"
                    onChangeText={(text) =>
                      handleChange("FieldCount", text)
                    }
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.FieldCount}>
                    {errors.FieldCount}
                  </HelperText>
                </View>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Isolation Distance</Text>
                <TextInput
                  placeholder="Enter Isolation Distance"
                  placeholderTextColor="#666"
                  value={formData.IsolationDistance}
                  autoCorrect={false}
                  autoComplete="off"
                  autoCapitalize="characters"
                  onChangeText={(text) =>
                    handleChange("IsolationDistance", text)
                  }
                  keyboardType="numeric"
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.IsolationDistance}>
                  {errors.IsolationDistance}
                </HelperText>
              </View>

              {/* Geo Image Field */}
              <ImagePickerField
                label="Geo Tagged Image *"
                value={formData.GeoImage}
                onPress={openCamera}
                field="GeoImage"
              />
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
                Please fill in the number of plants for all 10 offtype entries (Numbers 1-10 only)
              </Text>

              {offtypes.map((offtype, index) => (
                <OfftypeField
                  key={index}
                  index={index}
                  offtype={offtype}
                  onChange={handleOfftypeChange}
                  errors={offtypeErrors[index]}
                />
              ))}

              <Button
                mode="contained"
                onPress={addOfftypeRow}
                style={{ marginTop: 10, backgroundColor: "#2E7D32" }}
              >
                Add Offtype
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
                    placeholderTextColor="#666"
                    value={formData.Reason}
                    onChangeText={(text) => handleChange("Reason", text)}
                    multiline
                    numberOfLines={3}
                    style={[styles.input, styles.textArea]}
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
                placeholderTextColor="#666"
                value={formData.EstimatedSeedYield}
                onChangeText={(text) => handleChange("EstimatedSeedYield", text)}
                style={styles.input}
              />


              {errors.EstimatedSeedYield && (
                <HelperText type="error" visible={true}>
                  {errors.SourceOfSeed}
                </HelperText>
              )}


              <Text style={styles.label}>Grower Representative</Text>
              <TextInput
                placeholder="Enter representative name"
                placeholderTextColor="#666"
                value={formData.GrowerRepresentative}
                autoCorrect={false}
                autoComplete="off"
                autoCapitalize="characters"
                onChangeText={(text) =>
                  handleChange("GrowerRepresentative", text)
                }
                style={styles.input}
              />


              {errors.GrowerRepresentative && (
                <HelperText type="error" visible={true}>
                  {errors.SourceOfSeed}
                </HelperText>
              )}


              <Text style={styles.label}>Remarks</Text>
              <TextInput
                placeholder="Enter remarks"
                placeholderTextColor="#666"
                value={formData.Remarks}
                autoCorrect={false}
                autoComplete="off"
                autoCapitalize="characters"
                onChangeText={(text) =>
                  handleChange("Remarks", text)
                }
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
              />
              {errors.Remarks && (
                <HelperText type="error" visible={true}>
                  {errors.SourceOfSeed}
                </HelperText>
              )}
            </Card.Content>
          </Card>

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
            {submitting ? "Submitting..." : "Submit Inspection"}
          </Button>
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => {
          setShowDatePicker(false);
          setDateField(null);
        }}
        minimumDate={dateField === "DurationTo" && minDurationToDate ? minDurationToDate : undefined}
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
              textColor="#636161"
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