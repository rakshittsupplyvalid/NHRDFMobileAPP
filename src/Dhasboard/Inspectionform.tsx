import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { TextInput, Card, RadioButton, Button, HelperText } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "./DhasboardStyle";
import { BackHandler } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import CustomDateTimePicker from "../CommonComponent/DateTimePicker";
import YearPickerInput from "../CommonComponent/CommonYearPicker";
import apiClient from "../Service/apiInterceptors";
import CommonPicker from "../CommonComponent/CommonDropdown";


interface FormDataType {
  // Grower & Field Details
  growerName: string;
  address: string;
  centreName: string;
  agreementNo: string;
  agreementDate: Date | null;
  fieldNo: string;

  // Inspection Details
  inspectionNo: string | null;
  season: string | null;
  crop: string;
  variety: string;
  sowingDate: Date | null;
  inspectionDate: Date | null;
  expectedHarvestDate: Date | null;
  durationFrom: string;
  durationTo: string;
  classOfSeed: string;
  sourceOfSeed: string;
  totalArea: string;
  areaInspected: string;
  previousCrop: string;
  isolationDistance: string;
  growthStageContaminant: string;
  growthStageCrop: string;
  fieldCounts: string;
  offtypesPercentage: string;
  cropCondition: string;

  // Standards & Final Report
  confirmsStandard: string | null;
  reason: string;
  isFinalReport: string | null;

  // Yield & Representative
  estimatedYield: string;
  representativePresent: string | null;
  representativeName: string;
  remarks: string;
  centreInchargeRemark: string;
  designation: string;
}

interface FormErrorsType {
  [key: string]: string;
}

const InspectionForm = ({ inspectionId }: { inspectionId?: string }) => {
  const [formData, setFormData] = useState<FormDataType>({
    // Grower & Field Details
    growerName: "",
    address: "",
    centreName: "",
    agreementNo: "",
    agreementDate: null,
    fieldNo: "",
    
    // Inspection Details
    inspectionNo: null,
    season: null,
    crop: "",
    variety: "",
    sowingDate: null,
    inspectionDate: null,
    expectedHarvestDate: null,
    durationFrom: "",
    durationTo: "",
    classOfSeed: "",
    sourceOfSeed: "",
    totalArea: "",
    areaInspected: "",
    previousCrop: "",
    isolationDistance: "",
    growthStageContaminant: "",
    growthStageCrop: "",
    fieldCounts: "",
    offtypesPercentage: "",
    cropCondition: "",
    
    // Standards & Final Report
    confirmsStandard: null,
    reason: "",
    isFinalReport: null,
    
    // Yield & Representative
    estimatedYield: "",
    representativePresent: null,
    representativeName: "",
    remarks: "",
    centreInchargeRemark: "",
    designation: "",
  });

  const [errors, setErrors] = useState<FormErrorsType>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const navigation = useNavigation<any>();

  // API Base URL
  const API_BASE_URL = "https://dev-nhrdf-backend.supplyvalid.com/api";

  // Dropdown Options
  const inspectionOptions = [
    { label: "First", value: "1" },
    { label: "Second", value: "2" },
    { label: "Third", value: "3" },
    { label: "Fourth", value: "4" },
  ];

  const seasonOptions = [
    { label: "Kharif", value: "Kharif" },
    { label: "Rabi", value: "Rabi" },
    { label: "Summer", value: "Summer" },
  ];

  const yesNoOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  // Back handler
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Dashboard" as never);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  // Format date for display
  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Validation function
  const validateField = (field: string, value: any) => {
    let error = "";

    // Required field validation
    const requiredFields = [
      'growerName', 'address', 'centreName', 'agreementNo', 'agreementDate',
      'fieldNo', 'inspectionNo', 'season', 'crop', 'variety', 'sowingDate',
      'inspectionDate', 'classOfSeed', 'sourceOfSeed', 'totalArea', 'areaInspected'
    ];

    if (requiredFields.includes(field) && (!value || value.toString().trim() === "")) {
      error = "This field is required";
    } else {
      // Specific validations for numeric fields
      if (["totalArea", "areaInspected", "isolationDistance", "fieldCounts", "offtypesPercentage", "estimatedYield"].includes(field)) {
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = "Please enter a valid number";
        }
      }
      
      // Percentage validation
      if (field === "offtypesPercentage" && value && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
        error = "Percentage must be between 0 and 100";
      }

      // Email validation (if needed in future)
      if (field === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
        error = "Please enter a valid email address";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  // Handle date change
  const handleDateChange = (field: string, date: Date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
    validateField(field, date);
  };

  // Fetch inspection data by ID
  const fetchInspectionData = async (id: string) => {
    try {
      setLoading(true);
      
      // Dummy API call - replace with actual endpoint
      const response = await apiClient.get(`${API_BASE_URL}/inspections/${id}`);
      
      if (response.data && response.data.success) {
        const inspectionData = response.data.data;
        
        // Map API response to form data with proper date parsing
        setFormData({
          growerName: inspectionData.growerName || "",
          address: inspectionData.address || "",
          centreName: inspectionData.centreName || "",
          agreementNo: inspectionData.agreementNo || "",
          agreementDate: inspectionData.agreementDate ? new Date(inspectionData.agreementDate) : null,
          fieldNo: inspectionData.fieldNo || "",
          inspectionNo: inspectionData.inspectionNo || null,
          season: inspectionData.season || null,
          crop: inspectionData.crop || "",
          variety: inspectionData.variety || "",
          sowingDate: inspectionData.sowingDate ? new Date(inspectionData.sowingDate) : null,
          inspectionDate: inspectionData.inspectionDate ? new Date(inspectionData.inspectionDate) : null,
          expectedHarvestDate: inspectionData.expectedHarvestDate ? new Date(inspectionData.expectedHarvestDate) : null,
          durationFrom: inspectionData.durationFrom || "",
          durationTo: inspectionData.durationTo || "",
          classOfSeed: inspectionData.classOfSeed || "",
          sourceOfSeed: inspectionData.sourceOfSeed || "",
          totalArea: inspectionData.totalArea?.toString() || "",
          areaInspected: inspectionData.areaInspected?.toString() || "",
          previousCrop: inspectionData.previousCrop || "",
          isolationDistance: inspectionData.isolationDistance?.toString() || "",
          growthStageContaminant: inspectionData.growthStageContaminant || "",
          growthStageCrop: inspectionData.growthStageCrop || "",
          fieldCounts: inspectionData.fieldCounts?.toString() || "",
          offtypesPercentage: inspectionData.offtypesPercentage?.toString() || "",
          cropCondition: inspectionData.cropCondition || "",
          confirmsStandard: inspectionData.confirmsStandard || null,
          reason: inspectionData.reason || "",
          isFinalReport: inspectionData.isFinalReport || null,
          estimatedYield: inspectionData.estimatedYield?.toString() || "",
          representativePresent: inspectionData.representativePresent || null,
          representativeName: inspectionData.representativeName || "",
          remarks: inspectionData.remarks || "",
          centreInchargeRemark: inspectionData.centreInchargeRemark || "",
          designation: inspectionData.designation || "",
        });
        
        setEditMode(true);
      }
    } catch (error) {
      console.error('Error fetching inspection data:', error);
      // For demo purposes, we'll use dummy data
      setDummyData();
    } finally {
      setLoading(false);
    }
  };

  // Set dummy data for demonstration
  const setDummyData = () => {
    setFormData({
      growerName: "John Doe",
      address: "123 Farm Street, Agricultural Zone",
      centreName: "Main Production Centre",
      agreementNo: "AGR2024001",
      agreementDate: new Date('2024-01-15'),
      fieldNo: "FLD-001",
      inspectionNo: "1",
      season: "Kharif",
      crop: "Wheat",
      variety: "HD-2967",
      sowingDate: new Date('2024-06-01'),
      inspectionDate: new Date('2024-08-15'),
      expectedHarvestDate: new Date('2024-11-30'),
      durationFrom: "2024",
      durationTo: "2025",
      classOfSeed: "Foundation",
      sourceOfSeed: "Certified Supplier",
      totalArea: "5",
      areaInspected: "5",
      previousCrop: "Rice",
      isolationDistance: "50",
      growthStageContaminant: "Vegetative",
      growthStageCrop: "Flowering",
      fieldCounts: "10",
      offtypesPercentage: "2.5",
      cropCondition: "Good",
      confirmsStandard: "yes",
      reason: "",
      isFinalReport: "no",
      estimatedYield: "45",
      representativePresent: "yes",
      representativeName: "Jane Smith",
      remarks: "Crop is in good condition",
      centreInchargeRemark: "Approved for certification",
      designation: "Senior Inspector",
    });
    setEditMode(true);
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrorsType = {};
    const requiredFields = [
      'growerName', 'address', 'centreName', 'agreementNo', 'agreementDate',
      'fieldNo', 'inspectionNo', 'season', 'crop', 'variety', 'sowingDate',
      'inspectionDate', 'classOfSeed', 'sourceOfSeed', 'totalArea', 'areaInspected'
    ];

    requiredFields.forEach(field => {
      if (!formData[field as keyof FormDataType] || formData[field as keyof FormDataType]?.toString().trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    // Numeric field validation
    const numericFields = ['totalArea', 'areaInspected', 'isolationDistance', 'fieldCounts', 'offtypesPercentage', 'estimatedYield'];
    numericFields.forEach(field => {
      const value = formData[field as keyof FormDataType];
      if (value && value.toString().trim() !== "" && (isNaN(Number(value)) || parseFloat(value as string) < 0)) {
        newErrors[field] = "Please enter a valid number";
      }
    });

    // Percentage validation
    if (formData.offtypesPercentage && (parseFloat(formData.offtypesPercentage) < 0 || parseFloat(formData.offtypesPercentage) > 100)) {
      newErrors.offtypesPercentage = "Percentage must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form data
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix all errors before submitting");
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data for API with proper formatting
      const submissionData = {
        ...formData,
        agreementDate: formatDateForAPI(formData.agreementDate),
        sowingDate: formatDateForAPI(formData.sowingDate),
        inspectionDate: formatDateForAPI(formData.inspectionDate),
        expectedHarvestDate: formatDateForAPI(formData.expectedHarvestDate),
        totalArea: formData.totalArea ? parseFloat(formData.totalArea) : null,
        areaInspected: formData.areaInspected ? parseFloat(formData.areaInspected) : null,
        isolationDistance: formData.isolationDistance ? parseFloat(formData.isolationDistance) : null,
        fieldCounts: formData.fieldCounts ? parseInt(formData.fieldCounts) : null,
        offtypesPercentage: formData.offtypesPercentage ? parseFloat(formData.offtypesPercentage) : null,
        estimatedYield: formData.estimatedYield ? parseFloat(formData.estimatedYield) : null,
        confirmsStandard: formData.confirmsStandard === "yes",
        isFinalReport: formData.isFinalReport === "yes",
        representativePresent: formData.representativePresent === "yes",
      };

      let response;
      
      if (editMode && inspectionId) {
        // Update existing inspection - dummy API call
        response = await apiClient.put(`${API_BASE_URL}/inspections/${inspectionId}`, submissionData);
      } else {
        // Create new inspection - dummy API call
        response = await apiClient.post(`${API_BASE_URL}/inspections`, submissionData);
      }

      // For demo purposes, we'll simulate success
      Alert.alert(
        "Success",
        editMode ? "Inspection updated successfully!" : "Inspection created successfully!",
        [{ text: "OK" }]
      );
      
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert(
        "Submission Failed",
        "Failed to submit inspection data. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Load data when component mounts
  React.useEffect(() => {
    if (inspectionId) {
      fetchInspectionData(inspectionId);
    }
  }, [inspectionId]);

  // Radio Button Component
  const RadioGroup = ({ value, onValueChange, options, label }) => (
    <View style={styles.radioGroup}>
      <Text style={styles.label}>{label}</Text>
      <RadioButton.Group onValueChange={onValueChange} value={value}>
        <View style={styles.radioContainer}>
          {options.map((option) => (
            <View key={option.value} style={styles.radioOption}>
              <RadioButton value={option.value} />
              <Text style={styles.radioLabel}>{option.label}</Text>
            </View>
          ))}
        </View>
      </RadioButton.Group>
      {errors[Object.keys(formData).find(key => formData[key] === value)] && (
        <HelperText type="error" visible={true}>
          {errors[Object.keys(formData).find(key => formData[key] === value)]}
        </HelperText>
      )}
    </View>
  );

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
          
          {/* Grower & Field Details Card */}
          <Card style={styles.card}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="account-details" size={30} color="#2E7D32" />
              <Text style={styles.headerTitle}>Grower & Field Details</Text>
            </View>

            <Card.Content style={styles.content}>
              {/* Grower Information */}
              <Text style={styles.label}>Name of Grower with Address</Text>
            
              <TextInput
                mode="outlined"
                label="Enter grower name and address"
                activeOutlineColor="#2E7D32"
                value={formData.growerName}
                onChangeText={(text) => handleChange("growerName", text)}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.growerName}>
                {errors.growerName}
              </HelperText>

              <Text style={styles.label}>Name of Centre</Text>
             
              <TextInput
                mode="outlined"
                label="Enter centre name"
                value={formData.centreName}
                onChangeText={(text) => handleChange("centreName", text)}
                activeOutlineColor="#2E7D32"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.centreName}>
                {errors.centreName}
              </HelperText>

              {/* Agreement Details */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Agreement No.</Text>
                  <TextInput
                    mode="outlined"
                    label="Agreement no."
                    value={formData.agreementNo}
                    onChangeText={(text) => handleChange("agreementNo", text)}
                    activeOutlineColor="#2E7D32"
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.agreementNo}>
                    {errors.agreementNo}
                  </HelperText>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Agreement Date</Text>
                  <CustomDateTimePicker
                    mode="date"
                    value={formData.agreementDate || new Date()}
                    onChange={(date) => handleDateChange("agreementDate", date)}
                    label="Select agreement date"
                    inputStyle={styles.dateInput}
                  />
                  <HelperText type="error" visible={!!errors.agreementDate}>
                    {errors.agreementDate}
                  </HelperText>
                </View>
              </View>

              <Text style={styles.label}>Field No./Survey No./Block No.</Text>
              <TextInput
                mode="outlined"
                label="Enter field number"
                value={formData.fieldNo}
                onChangeText={(text) => handleChange("fieldNo", text)}
                activeOutlineColor="#2E7D32"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.fieldNo}>
                {errors.fieldNo}
              </HelperText>

              {/* Dropdown Fields */}
              <Text style={styles.label}>Inspection No.</Text>
              <Dropdown
                style={[styles.dropdown, errors.inspectionNo && styles.dropdownError]}
                data={inspectionOptions}
                labelField="label"
                valueField="value"
                placeholder="Select inspection no."
                value={formData.inspectionNo}
                onChange={(item) => handleChange("inspectionNo", item.value)}
              />
              <HelperText type="error" visible={!!errors.inspectionNo}>
                {errors.inspectionNo}
              </HelperText>

              <Text style={styles.label}>Season</Text>
              <Dropdown
                style={[styles.dropdown, errors.season && styles.dropdownError]}
                data={seasonOptions}
                labelField="label"
                valueField="value"
                placeholder="Select season"
                value={formData.season}
                onChange={(item) => handleChange("season", item.value)}
              />
              <HelperText type="error" visible={!!errors.season}>
                {errors.season}
              </HelperText>
            </Card.Content>
          </Card>

          {/* Crop & Production Details Card */}
          <Card style={styles.card}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="sprout" size={30} color="#2E7D32" />
              <Text style={styles.headerTitle}>Crop & Production Details</Text>
            </View>

            <Card.Content style={styles.content}>
              <Text style={styles.label}>Crop</Text>
              <TextInput
                mode="outlined"
                label="Enter crop name"
                value={formData.crop}
                onChangeText={(text) => handleChange("crop", text)}
                activeOutlineColor="#2E7D32"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.crop}>
                {errors.crop}
              </HelperText>

              <Text style={styles.label}>Variety</Text>
              <TextInput
                mode="outlined"
                label="Enter variety"
                value={formData.variety}
                onChangeText={(text) => handleChange("variety", text)}
                activeOutlineColor="#2E7D32"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.variety}>
                {errors.variety}
              </HelperText>

              {/* Date Fields */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Date of Sowing/Planting</Text>
                  <CustomDateTimePicker
                    mode="date"
                    value={formData.sowingDate || new Date()}
                    onChange={(date) => handleDateChange("sowingDate", date)}
                    label="Select sowing date"
                    inputStyle={styles.dateInput}
                  />
                  <HelperText type="error" visible={!!errors.sowingDate}>
                    {errors.sowingDate}
                  </HelperText>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Date of Inspection</Text>
                  <CustomDateTimePicker
                    mode="date"
                    value={formData.inspectionDate || new Date()}
                    onChange={(date) => handleDateChange("inspectionDate", date)}
                    label="Select inspection date"
                    inputStyle={styles.dateInput}
                  />
                  <HelperText type="error" visible={!!errors.inspectionDate}>
                    {errors.inspectionDate}
                  </HelperText>
                </View>
              </View>

              <Text style={styles.label}>Expected Date of Harvest</Text>
              <CustomDateTimePicker
                mode="date"
                value={formData.expectedHarvestDate || new Date()}
                onChange={(date) => handleDateChange("expectedHarvestDate", date)}
                label="Select expected harvest date"
                inputStyle={styles.dateInput}
              />
              <HelperText type="error" visible={!!errors.expectedHarvestDate}>
                {errors.expectedHarvestDate}
              </HelperText>

              {/* Duration */}
              <Text style={styles.label}>Duration: From To</Text>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <YearPickerInput
                    value={formData.durationFrom}
                    onChange={(year) => handleChange("durationFrom", year)}
                  />
                  <HelperText type="error" visible={!!errors.durationFrom}>
                    {errors.durationFrom}
                  </HelperText>
                </View>

                <View style={styles.halfInput}>
                  <YearPickerInput
                    value={formData.durationTo}
                    onChange={(year) => handleChange("durationTo", year)}
                  />
                  <HelperText type="error" visible={!!errors.durationTo}>
                    {errors.durationTo}
                  </HelperText>
                </View>
              </View>

              {/* Seed Details */}
              <Text style={styles.label}>Class of Seed</Text>
              <TextInput
                mode="outlined"
                label="Enter class of seed"
                value={formData.classOfSeed}
                onChangeText={(text) => handleChange("classOfSeed", text)}
                activeOutlineColor="#2E7D32"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.classOfSeed}>
                {errors.classOfSeed}
              </HelperText>

              <Text style={styles.label}>Source of Seed</Text>
              <TextInput
                mode="outlined"
                label="Enter source of seed"
                value={formData.sourceOfSeed}
                onChangeText={(text) => handleChange("sourceOfSeed", text)}
                activeOutlineColor="#2E7D32"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.sourceOfSeed}>
                {errors.sourceOfSeed}
              </HelperText>

              {/* Area Details */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Total Area (ha)</Text>
                  <TextInput
                    mode="outlined"
                    label="Area in hectares"
                    value={formData.totalArea}
                    onChangeText={(text) => handleChange("totalArea", text)}
                    activeOutlineColor="#2E7D32"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.totalArea}>
                    {errors.totalArea}
                  </HelperText>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Area Inspected (ha)</Text>
                  <TextInput
                    mode="outlined"
                    label="Area in hectares"
                    value={formData.areaInspected}
                    onChangeText={(text) => handleChange("areaInspected", text)}
                    activeOutlineColor="#2E7D32"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.areaInspected}>
                    {errors.areaInspected}
                  </HelperText>
                </View>
              </View>

              {/* Crop Details */}
              <Text style={styles.label}>Previous Crop</Text>
              <TextInput
                mode="outlined"
                label="Enter previous crop"
                value={formData.previousCrop}
                onChangeText={(text) => handleChange("previousCrop", text)}
                activeOutlineColor="#2E7D32"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.previousCrop}>
                {errors.previousCrop}
              </HelperText>

              <Text style={styles.label}>Isolation Distance (meter)</Text>
              <TextInput
                mode="outlined"
                label="Enter distance in meters"
                value={formData.isolationDistance}
                onChangeText={(text) => handleChange("isolationDistance", text)}
                activeOutlineColor="#2E7D32"
                keyboardType="numeric"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.isolationDistance}>
                {errors.isolationDistance}
              </HelperText>

              <Text style={styles.label}>Stage of Growth of Contaminant</Text>
              <TextInput
                mode="outlined"
                label="Enter growth stage"
                value={formData.growthStageContaminant}
                onChangeText={(text) => handleChange("growthStageContaminant", text)}
                activeOutlineColor="#2E7D32"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.growthStageContaminant}>
                {errors.growthStageContaminant}
              </HelperText>

              <Text style={styles.label}>Stage of Seed Crop at Inspection</Text>
              <TextInput
                mode="outlined"
                label="Enter growth stage"
                value={formData.growthStageCrop}
                onChangeText={(text) => handleChange("growthStageCrop", text)}
                activeOutlineColor="#2E7D32"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.growthStageCrop}>
                {errors.growthStageCrop}
              </HelperText>

              <Text style={styles.label}>Field Counts (100 plants per count)</Text>
              <TextInput
                mode="outlined"
                label="Enter field counts"
                value={formData.fieldCounts}
                onChangeText={(text) => handleChange("fieldCounts", text)}
                activeOutlineColor="#2E7D32"
                keyboardType="numeric"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.fieldCounts}>
                {errors.fieldCounts}
              </HelperText>

              <Text style={styles.label}>Percentage of Offtypes</Text>
              <TextInput
                mode="outlined"
                label="Enter percentage"
                value={formData.offtypesPercentage}
                onChangeText={(text) => handleChange("offtypesPercentage", text)}
                activeOutlineColor="#2E7D32"
                keyboardType="numeric"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.offtypesPercentage}>
                {errors.offtypesPercentage}
              </HelperText>

              <Text style={styles.label}>Crop Condition</Text>
              <TextInput
                mode="outlined"
                label="Describe crop condition"
                value={formData.cropCondition}
                onChangeText={(text) => handleChange("cropCondition", text)}
                activeOutlineColor="#2E7D32"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.cropCondition}>
                {errors.cropCondition}
              </HelperText>
            </Card.Content>
          </Card>

          {/* Standards & Final Report Card */}
          <Card style={styles.card}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="clipboard-check" size={30} color="#2E7D32" />
              <Text style={styles.headerTitle}>Standards & Final Report</Text>
            </View>

            <Card.Content style={styles.content}>
              {/* Radio Groups */}
              <RadioGroup
                label="Does this crop confirm the standard for particular class of seed?"
                value={formData.confirmsStandard}
                onValueChange={(value) => handleChange("confirmsStandard", value)}
                options={yesNoOptions}
              />

              {formData.confirmsStandard === "no" && (
                <>
                  <Text style={styles.label}>Reason</Text>
                  <TextInput
                    mode="outlined"
                    label="Enter reason"
                    value={formData.reason}
                    onChangeText={(text) => handleChange("reason", text)}
                    activeOutlineColor="#2E7D32"
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.reason}>
                    {errors.reason}
                  </HelperText>
                </>
              )}

              <RadioGroup
                label="Is this the final report?"
                value={formData.isFinalReport}
                onValueChange={(value) => handleChange("isFinalReport", value)}
                options={yesNoOptions}
              />

              <Text style={styles.label}>Estimated Seed Yield (q)</Text>
              <TextInput
                mode="outlined"
                label="Enter estimated yield"
                value={formData.estimatedYield}
                onChangeText={(text) => handleChange("estimatedYield", text)}
                activeOutlineColor="#2E7D32"
                keyboardType="numeric"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.estimatedYield}>
                {errors.estimatedYield}
              </HelperText>

              <RadioGroup
                label="Was the grower or his representative present at the time of inspection?"
                value={formData.representativePresent}
                onValueChange={(value) => handleChange("representativePresent", value)}
                options={yesNoOptions}
              />

              {formData.representativePresent === "yes" && (
                <>
                  <Text style={styles.label}>Name of Representative</Text>
                  <TextInput
                    mode="outlined"
                    label="Enter representative name"
                    value={formData.representativeName}
                    onChangeText={(text) => handleChange("representativeName", text)}
                    activeOutlineColor="#2E7D32"
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.representativeName}>
                    {errors.representativeName}
                  </HelperText>
                </>
              )}

              <Text style={styles.label}>Remarks/Advice Given</Text>
              <TextInput
                mode="outlined"
                label="Enter remarks or advice"
                value={formData.remarks}
                onChangeText={(text) => handleChange("remarks", text)}
                activeOutlineColor="#2E7D32"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.remarks}>
                {errors.remarks}
              </HelperText>

              <Text style={styles.label}>Remark of Centre Incharge</Text>
              <TextInput
                mode="outlined"
                label="Enter centre incharge remark"
                value={formData.centreInchargeRemark}
                onChangeText={(text) => handleChange("centreInchargeRemark", text)}
                activeOutlineColor="#2E7D32"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.centreInchargeRemark}>
                {errors.centreInchargeRemark}
              </HelperText>

              <Text style={styles.label}>Designation</Text>
              <TextInput
                mode="outlined"
                label="Enter designation"
                value={formData.designation}
                onChangeText={(text) => handleChange("designation", text)}
                activeOutlineColor="#2E7D32"
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.designation}>
                {errors.designation}
              </HelperText>
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
            {submitting ? "Submitting..." : editMode ? "Update Inspection" : "Submit Inspection"}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default InspectionForm;