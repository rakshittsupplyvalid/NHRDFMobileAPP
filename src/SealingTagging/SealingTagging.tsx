import React, { useState, useCallback, useEffect, useRef, use } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions
} from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import apiClient from "../Service/apiInterceptors";
import { useFormData } from "../Constants/FormContext";
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


export default function CombinedSeedOperations() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { formData } = useFormData();

  // console.log("🚀 SealingTagging Screen - Agreement ID:", formData?.agreementId);
  const [loading, setLoading] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [estimatedSeedYield, setEstimatedSeedYield] = useState("");

  const [isDraftEnabled, setIsDraftEnabled] = useState(true);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  const [existingData, setExistingData] = useState(null);
  const [existingId, setExistingId] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);

  /* ---------------- STATE ---------------- */
  const [formState, setFormState] = useState({
    HarvestingDate: "",
    ThreshingDate: "",
    SealingTaggingDate: "",
    unprocessedseed: "",
    noofbags: "",
    staffname: "",
    transportationmode: "",
    vehiclenumber: "",
    drivername: "",
    drivercontactno: "",
    remarks: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [activeField, setActiveField] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const [errors, setErrors] = useState({
    HarvestingDate: "",
    ThreshingDate: "",
    SealingTaggingDate: "",
    unprocessedseed: "",
    noofbags: "",
    staffname: "",
    transportationmode: "",
    vehiclenumber: "",
    drivername: "",
    drivercontactno: "",
    tags: "",
  });

  const fetchEstimatedYeilds = async () => {
    try {
      const response = await apiClient.get(
        `/api/estimatedseedyield/${formData?.agreementId}`
      );

      const landDetails = response?.data?.agreementlanddetail || [];

      let totalYield = 0;

      landDetails.forEach((land) => {
        land.estimatedseedyield?.forEach((item) => {
          if (item?.estimatedseedyield) {
            totalYield += Number(item.estimatedseedyield);
          }
        });
      });

      console.log("🌾 Total Estimated Seed Yield:", totalYield);

      // 👉 autofill TextInput
      if (totalYield > 0) {
        setEstimatedSeedYield(totalYield.toString());
      }

    } catch (error) {
      console.log("❌ Error fetching existing data:", error?.response?.data || error);
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    if (formData?.agreementId) {
      console.log("No Agreement ID found");
      fetchEstimatedYeilds();
    }
  }, [formData?.agreementId]);

  const fetchExistingData = async () => {
    if (!formData?.agreementId) {
      console.log("No Agreement ID found");
      return;
    }

    try {
      setFetchingData(true);
      console.log("🔍 Checking for existing data...");

      const apiUrl = `/api/harvesting/list?AgreementId=${formData.agreementId}&Draft=TRUE&ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED`;



      const response = await apiClient.get(apiUrl);

      if (response.data && response.data.length > 0) {


        // Get the first item (assuming we want the most recent)
        const existingRecord = response.data[0];
        setExistingId(existingRecord.id);
        setExistingData(existingRecord);

        // Now fetch the detailed data
        await fetchDetailedData(existingRecord.id);
      } else {
        console.log("📭 No existing data found");
        setExistingData(null);
        setExistingId(null);
      }
    } catch (error) {
      console.log("❌ Error fetching existing data:", error?.response?.data || error);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchDetailedData = async (id) => {
    try {
      console.log("🔍 Fetching detailed data for ID:", id);

      const response = await apiClient.get(`/api/harvesting/${id}`);

      if (response.data) {
        console.log("✅ Detailed data fetched:", response.data);
        autoFillForm(response.data);
      }
    } catch (error) {
      console.log("❌ Error fetching detailed data:", error?.response?.data || error);
    }
  };

 
  const autoFillForm = (data) => {
    console.log("🔄 Auto-filling form with data:", data);

    const newFormState = {
      HarvestingDate: data.harvestingdate || "",
      ThreshingDate: data.threshingdate || "",
      SealingTaggingDate: data.sealingtaggingdate || "",
      unprocessedseed: "",
      noofbags: "",
      staffname: "",
      transportationmode: "",
      vehiclenumber: "",
      drivername: "",
      drivercontactno: "",
      remarks: "",
    };

    // If there's seed lifting data in the response
    if (data.seedlefting && data.seedlefting.length > 0) {
      const seedLifting = data.seedlefting[0];
      newFormState.unprocessedseed = seedLifting.unprocessedseed?.toString() || "";
      newFormState.noofbags = seedLifting.noofbags?.toString() || "";
      newFormState.staffname = seedLifting.staffname || "";
      newFormState.transportationmode = seedLifting.transportationmode || "";
      newFormState.vehiclenumber = seedLifting.vehiclenumber || "";
      newFormState.drivername = seedLifting.drivername || "";
      newFormState.drivercontactno = seedLifting.drivercontactno || "";
      newFormState.remarks = seedLifting.remarks || "";
    }

    // Set tags if they exist
    if (data.tags && data.tags.length > 0) {
      const tagArray = data.tags.map(tag => ({
        tagno: tag.tagno || ""
      }));
      setTags(tagArray);
    }

    setFormState(newFormState);
    console.log("✅ Form auto-filled successfully");
  };



    const resetForm = () => {
  console.log("🔄 Resetting form data...");
  
  setFormState({
    HarvestingDate: "",
    ThreshingDate: "",
    SealingTaggingDate: "",
    unprocessedseed: "",
    noofbags: "",
    staffname: "",
    transportationmode: "",
    vehiclenumber: "",
    drivername: "",
    drivercontactno: "",
    remarks: "",
  });
  
  setTagInput("");
  setTags([]);
  setErrors({
    HarvestingDate: "",
    ThreshingDate: "",
    SealingTaggingDate: "",
    unprocessedseed: "",
    noofbags: "",
    staffname: "",
    transportationmode: "",
    vehiclenumber: "",
    drivername: "",
    drivercontactno: "",
    tags: "",
  });
  
  setEstimatedSeedYield("");
  setExistingData(null);
  setExistingId(null);
  
  console.log("✅ Form reset completed");
};

  // Modify useFocusEffect:
useFocusEffect(
  useCallback(() => {

    resetForm();
    
    // Only fetch fresh data from API
    fetchExistingData();
    fetchEstimatedYeilds();

    const onBackPress = () => {
      resetForm(); // Back press pe bhi reset
      navigation.navigate("Farmer Agreement");
      return true;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    
    // Jab screen chhodein tab bhi reset karein
    return () => {
      resetForm(); // Cleanup mein reset
      subscription.remove();
    };
  }, [navigation, formData?.agreementId])
);



  /* ---------------- DROPDOWN DATA ---------------- */
  const transportModes = [
    { label: "Transport", value: "Transport" },
    { label: "Hired Vehicle", value: "HiredVechile" },
    { label: "Office Vehicle", value: "OfficeVechile" },
    { label: "Farmer Own Vehicle", value: "FarmerOwnVechile" },
  ];

  /* ---------------- VALIDATION FUNCTIONS ---------------- */
  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case 'unprocessedseed':
        if (!value.trim()) {
          error = "Unprocessed seed is required";
        } else if (!/^\d+(\.\d+)?$/.test(value)) {
          error = "Must be a valid number";
        }
        break;

      case 'noofbags':
        if (!value.trim()) {
          error = "Number of bags is required";
        } else if (!/^\d+$/.test(value)) {
          error = "Must be a whole number";
        }
        break;

      case 'staffname':
        if (!value.trim()) {
          error = "Staff name is required";
        }
        break;

      case 'transportationmode':
        if (!value.trim()) {
          error = "Transportation mode is required";
        }
        break;

      case 'vehiclenumber':
        if (!value.trim()) {
          error = "Vehicle number is required";
        }
        break;

      case 'drivername':
        if (!value.trim()) {
          error = "Driver name is required";
        }
        break;

      case 'drivercontactno':
        if (!value.trim()) {
          error = "Driver contact is required";
        } else if (!/^\d{10}$/.test(value)) {
          error = "Must be 10 digits";
        }
        break;

      case 'HarvestingDate':
      case 'ThreshingDate':
      case 'SealingTaggingDate':
        // Dates are now optional
        break;
    }

    return error;
  };

  /* ---------------- BUTTON STATUS CALCULATION ---------------- */
  useEffect(() => {
    const buttonStatus = calculateButtonStatus();
    setIsSubmitEnabled(buttonStatus.isSubmitEnabled);
  }, [formState, tags, errors]);

  const calculateButtonStatus = () => {
    // Required fields for submission
    const requiredSeedLiftingFields = [
      'unprocessedseed', 'noofbags', 'staffname',
      'transportationmode', 'vehiclenumber', 'drivername', 'drivercontactno', 'remarks'
    ];


    const areSeedLiftingFieldsFilled = requiredSeedLiftingFields.every(
      field => formState[field]?.toString().trim() !== ""
    );


    const areNumericFieldsValid =
      /^\d+(\.\d+)?$/.test(formState.unprocessedseed) &&
      /^\d+$/.test(formState.noofbags);

    // Check phone number validation
    const isPhoneValid = /^\d{10}$/.test(formState.drivercontactno);

    // Check sealing/tagging fields for submit
    // Dates are now optional, but tags are still required
    const areSealingFieldsFilled = tags.length > 0;

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => error !== "");

    // SUBMIT BUTTON: Enabled only if ALL conditions are met and no errors
    const isSubmitEnabled =
      areSeedLiftingFieldsFilled &&
      areNumericFieldsValid &&
      isPhoneValid &&
      areSealingFieldsFilled &&
      !hasErrors;

    return {
      isSubmitEnabled,
      isDraftEnabled: true // Draft button is always enabled
    };
  };

  /* ---------------- HANDLERS ---------------- */
  const openDatePicker = (field: string) => {
    setActiveField(field);
    setDatePickerVisible(true);
    // Close keyboard when opening date picker
    Keyboard.dismiss();
  };

  const handleConfirmDate = (date: Date) => {
    const iso = date.toISOString();
    const fieldName = activeField === "harvest" ? "HarvestingDate" :
      activeField === "thresh" ? "ThreshingDate" :
        "SealingTaggingDate";

    setFormState(prev => ({
      ...prev,
      [fieldName]: iso
    }));

    setErrors(prev => ({
      ...prev,
      [fieldName]: ""
    }));

    setDatePickerVisible(false);
  };

  const handleCancelDate = () => {
    setDatePickerVisible(false);
    setActiveField("");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));

    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const addTag = () => {
    if (!tagInput.trim()) {
      setErrors(prev => ({
        ...prev,
        tags: "Please enter tag number"
      }));
      return;
    }

    setErrors(prev => ({
      ...prev,
      tags: ""
    }));

    setTags((prev) => [...prev, { tagno: tagInput.trim() }]);
    setTagInput("");
  };

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------- VALIDATION FOR SUBMIT (ALL DATA) ---------------- */
  const validateFormForSubmit = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate all required fields
    Object.keys(formState).forEach(field => {
      if (field !== 'remarks' && field !== 'HarvestingDate' && field !== 'ThreshingDate' && field !== 'SealingTaggingDate') {
        const error = validateField(field, formState[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    // Validate tags
    if (tags.length === 0) {
      newErrors.tags = "At least one tag is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /* ---------------- VALIDATION FOR DRAFT (ONLY 5 FIELDS) ---------------- */
  const validateFormForDraft = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // For draft, only check AgreementId and Tags
    // AgreementId is already validated from formData context

    // Check tags (must have at least one tag for draft)
    if (tags.length === 0) {
      newErrors.tags = "At least one tag is required";
      isValid = false;
    }

    // Clear validation errors for other fields in draft mode
    Object.keys(newErrors).forEach(key => {
      if (key !== 'tags') {
        newErrors[key] = "";
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  /* ---------------- BUILD FORM DATA FOR DRAFT (ONLY 5 FIELDS) ---------------- */
  const buildDraftFormData = () => {
    const fd = new FormData();

    // 1. AgreementId (string) - REQUIRED
    fd.append("AgreementId", formData?.agreementId || "");

    // 2. HarvestingDate (string) - Send empty if not filled
    fd.append("HarvestingDate", formState.HarvestingDate || "");

    // 3. ThreshingDate (string) - Send empty if not filled
    fd.append("ThreshingDate", formState.ThreshingDate || "");

    // 4. SealingTaggingDate (string) - Send empty if not filled
    fd.append("SealingTaggingDate", formState.SealingTaggingDate || "");

    // 5. Tag (array) - REQUIRED, at least one tag
    tags.forEach((item, index) => {
      fd.append(`Tag[${index}].tagno`, item.tagno);
    });

    // Set Draft = "TRUE" (uppercase string)
    fd.append("Draft", "TRUE");

    return fd;
  };

  /* ---------------- BUILD FORM DATA FOR SUBMIT (ALL FIELDS) ---------------- */
  const buildSubmitFormData = () => {
    const fd = new FormData();

    // SEED LIFTING FIELDS (with proper type conversions)
    // Send empty string if field is empty
    fd.append("Date", formState.HarvestingDate || ""); // Changed to nullable

    // Numeric fields - convert to numbers or send 0 if empty
    const unprocessedSeedValue = formState.unprocessedseed ?
      parseFloat(formState.unprocessedseed) : 0;
    fd.append("UnProcessedSeed", unprocessedSeedValue.toString());

    const noOfBagsValue = formState.noofbags ?
      parseInt(formState.noofbags, 10) : 0;
    fd.append("NoOfBags", noOfBagsValue.toString());

    // String fields - send empty string if not filled
    fd.append("StaffName", formState.staffname || "");
    fd.append("TransportationMode", formState.transportationmode || "");
    fd.append("VehicleNumber", formState.vehiclenumber || "");
    fd.append("DriverName", formState.drivername || "");
    fd.append("DriverContactNo", formState.drivercontactno || "");
    fd.append("Remarks", formState.remarks || "");

    console.log("📤 SUBMIT DATA - Seed Lifting fields");
    console.log("UnProcessedSeed:", unprocessedSeedValue);
    console.log("NoOfBags:", noOfBagsValue);
    console.log("Date (nullable):", formState.HarvestingDate || "empty");

    return fd;
  };

  /* ---------------- API SUBMIT FUNCTION FOR DRAFT ---------------- */
  const submitDraftData = async () => {
    try {
      setLoading(true);

      const formDataToSend = buildDraftFormData();

      console.log(`📤 Submitting DRAFT data...`);
      console.log("Mode: Draft - Only 5 required fields");
      console.log("Draft field value: TRUE");

      const response = await apiClient.post("/api/harvesting/add", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Draft API Response:", response.data);

      // Show success message
      Alert.alert(
        "Success",
        "Data saved as draft successfully",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to Sealing Tagging List screen after draft save
              navigation.navigate("Sealing Tagging List");
            },
          },
        ]
      );
    } catch (error) {
      console.log("❌ DRAFT API ERROR:", error?.response?.data || error);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save draft";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- API SUBMIT FUNCTION FOR FINAL SUBMIT ---------------- */
  const submitFinalData = async () => {
    try {
      setLoading(true);

      if (!existingId) {
        Alert.alert("Error", "No existing data found. Please save as draft first.");
        return;
      }

      const formDataToSend = buildSubmitFormData();

      console.log(`📤 Submitting FINAL data...`);
      console.log("Using existing ID:", existingId);
      console.log("API Endpoint:", `/api/seedlifting/harvesting/${existingId}`);

      const response = await apiClient.post(
        `/api/seedlifting/harvesting/${existingId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Final Submit API Response:", response.data);

      // Show success message
      Alert.alert(
        "Success",
        "Data submitted successfully",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to Dashboard after successful submission
              navigation.reset({
                index: 0,
                routes: [{ name: "Dashboard" }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.log("❌ FINAL SUBMIT API ERROR:", error?.response?.data || error);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to submit data";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- BUTTON HANDLERS ---------------- */
  const handleDraftSubmit = async () => {
    // Validate draft requirements (only AgreementId and Tags)
    if (!formData?.agreementId) {
      Alert.alert("Error", "Agreement ID is required");
      return;
    }

    if (!validateFormForDraft()) {
      return;
    }

    await submitDraftData();
  };

  const handleFinalSubmit = async () => {
    if (!validateFormForSubmit()) {
      return;
    }
    await submitFinalData();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleBackPress = () => {
    navigation.navigate("Farmer Agreement");
  };

  // Function to scroll to input field
  const scrollToInput = (yOffset = 100) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yOffset, animated: true });
    }
  };

  return (

    <KeyboardAwareScrollView
      style={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardOpeningTime={0}

    >


      {/* HEADER WITH BACK ARROW */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <MaterialCommunityIcons name="arrow-left" size={30} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sealing & Tagging</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 160, // 🔑 very important
        }}
      >
        {/* Loading indicator for data fetching */}
        {/* {fetchingData && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6ba94bff" />
            <Text style={styles.loadingText}>Checking for existing data...</Text>
          </View>
        )} */}

        {/* Existing Data Indicator */}
        {/* {existingData && !fetchingData && (
          <View style={styles.existingDataContainer}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#1976D2" />
            <View style={styles.existingDataContent}>
              <Text style={styles.existingDataText}>
                Existing draft data found. Form has been auto-filled.
              </Text>
              <Text style={styles.existingDataId}>
                ID: {existingId}
              </Text>
            </View>
          </View>
        )} */}

        {/* Sealing & Tagging Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sealing & Tagging *</Text>
          <View style={styles.card}>


            <Text style={styles.label}>Estimated Seed Yield   (kg)</Text>

            <TextInput
              style={styles.input}
              placeholder="Estimated Seed Yield"
              value={estimatedSeedYield}
              editable={false}


            />




            <Text style={styles.label}>Harvesting Date</Text>
            <TouchableOpacity onPress={() => openDatePicker("harvest")}>
              <TextInput
                style={[
                  styles.input,
                  errors.HarvestingDate && styles.inputError
                ]}
                placeholder="Select date (Optional)"
                value={formState.HarvestingDate ? new Date(formState.HarvestingDate).toLocaleDateString() : ""}
                editable={false}
                onFocus={() => scrollToInput(0)}
              />
            </TouchableOpacity>
            {errors.HarvestingDate ? (
              <Text style={styles.errorText}>{errors.HarvestingDate}</Text>
            ) : null}

            <Text style={styles.label}>Threshing Date</Text>
            <TouchableOpacity onPress={() => openDatePicker("thresh")}>
              <TextInput
                style={[
                  styles.input,
                  errors.ThreshingDate && styles.inputError
                ]}
                placeholder="Select date (Optional)"
                value={formState.ThreshingDate ? new Date(formState.ThreshingDate).toLocaleDateString() : ""}
                editable={false}
                onFocus={() => scrollToInput(100)}
              />
            </TouchableOpacity>
            {errors.ThreshingDate ? (
              <Text style={styles.errorText}>{errors.ThreshingDate}</Text>
            ) : null}

            <Text style={styles.label}>Sealing / Tagging Date</Text>
            <TouchableOpacity onPress={() => openDatePicker("sealing")}>
              <TextInput
                style={[
                  styles.input,
                  errors.SealingTaggingDate && styles.inputError
                ]}
                placeholder="Select date (Optional)"
                value={formState.SealingTaggingDate ? new Date(formState.SealingTaggingDate).toLocaleDateString() : ""}
                editable={false}
                onFocus={() => scrollToInput(200)}
              />
            </TouchableOpacity>
            {errors.SealingTaggingDate ? (
              <Text style={styles.errorText}>{errors.SealingTaggingDate}</Text>
            ) : null}

            <Text style={styles.label}>Tag Numbers *</Text>
            <View style={styles.row}>
              <TextInput
                style={[
                  styles.input,
                  { flex: 1 },
                  errors.tags && styles.inputError
                ]}
                placeholder="Enter tag number"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                returnKeyType="done"
                onFocus={() => scrollToInput(300)}
              />
              <TouchableOpacity style={styles.addBtn} onPress={addTag}>
                <Text style={styles.addText}>＋</Text>
              </TouchableOpacity>
            </View>
            {errors.tags ? (
              <Text style={styles.errorText}>{errors.tags}</Text>
            ) : null}

            {tags.length > 0 && (
              <View style={styles.tagBox}>
                {tags.map((item, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Text style={styles.tagText}>{item.tagno}</Text>
                    <TouchableOpacity onPress={() => removeTag(index)}>
                      <Text style={styles.remove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Seed Lifting Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seed Lifting</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Unprocessed Seed (kg) *</Text>
            <TextInput
              style={[
                styles.input,
                errors.unprocessedseed && styles.inputError
              ]}
              placeholder="Enter quantity"
              value={formState.unprocessedseed}
              onChangeText={(text) => handleInputChange('unprocessedseed', text)}
              keyboardType="decimal-pad"
              returnKeyType="next"
              onFocus={() => scrollToInput(400)}
            />
            {errors.unprocessedseed ? (
              <Text style={styles.errorText}>{errors.unprocessedseed}</Text>
            ) : null}

            <Text style={styles.label}>Number of Bags *</Text>
            <TextInput
              style={[
                styles.input,
                errors.noofbags && styles.inputError
              ]}
              placeholder="Enter number of bags"
              value={formState.noofbags}
              onChangeText={(text) => handleInputChange('noofbags', text)}
              keyboardType="number-pad"
              returnKeyType="next"
              onFocus={() => scrollToInput(500)}
            />
            {errors.noofbags ? (
              <Text style={styles.errorText}>{errors.noofbags}</Text>
            ) : null}

            <Text style={styles.label}>Staff Name *</Text>
            <TextInput
              style={[
                styles.input,
                errors.staffname && styles.inputError
              ]}
              placeholder="Enter staff name"
              value={formState.staffname}
              onChangeText={(text) => handleInputChange('staffname', text)}
              returnKeyType="next"
              onFocus={() => scrollToInput(600)}
            />
            {errors.staffname ? (
              <Text style={styles.errorText}>{errors.staffname}</Text>
            ) : null}

            <Text style={styles.label}>Transportation Mode *</Text>
            <Dropdown
              style={[
                styles.input,
                styles.dropdown,
                errors.transportationmode && styles.inputError
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={transportModes}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select transportation mode"
              searchPlaceholder="Search..."
              value={formState.transportationmode}
              onChange={item => handleInputChange('transportationmode', item.value)}
              onFocus={() => scrollToInput(700)}
            />
            {errors.transportationmode ? (
              <Text style={styles.errorText}>{errors.transportationmode}</Text>
            ) : null}

            <Text style={styles.label}>Vehicle Number *</Text>
            <TextInput
              style={[
                styles.input,
                errors.vehiclenumber && styles.inputError
              ]}
              placeholder="Enter vehicle number"
              value={formState.vehiclenumber}
              onChangeText={(text) => handleInputChange('vehiclenumber', text)}
              autoCapitalize="characters"
              returnKeyType="next"
              onFocus={() => scrollToInput(800)}
            />
            {errors.vehiclenumber ? (
              <Text style={styles.errorText}>{errors.vehiclenumber}</Text>
            ) : null}

            <Text style={styles.label}>Driver Name *</Text>
            <TextInput
              style={[
                styles.input,
                errors.drivername && styles.inputError
              ]}
              placeholder="Enter driver name"
              value={formState.drivername}
              onChangeText={(text) => handleInputChange('drivername', text)}
              returnKeyType="next"
              onFocus={() => scrollToInput(900)}
            />
            {errors.drivername ? (
              <Text style={styles.errorText}>{errors.drivername}</Text>
            ) : null}

            <Text style={styles.label}>Driver Contact Number *</Text>
            <TextInput
              style={[
                styles.input,
                errors.drivercontactno && styles.inputError
              ]}
              placeholder="Enter 10-digit mobile number"
              value={formState.drivercontactno}
              onChangeText={(text) => handleInputChange('drivercontactno', text)}
              keyboardType="phone-pad"
              maxLength={10}
              returnKeyType="next"
              onFocus={() => scrollToInput(1000)}
            />
            {errors.drivercontactno ? (
              <Text style={styles.errorText}>{errors.drivercontactno}</Text>
            ) : null}

            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter any remarks"
              value={formState.remarks}
              onChangeText={(text) => handleInputChange('remarks', text)}
              multiline
              numberOfLines={3}
              returnKeyType="done"
              onFocus={() => scrollToInput(1100)}
            />
          </View>
        </View>


        {/* Spacer to ensure buttons are visible */}
        <View style={styles.spacer} />

        {/* ACTION BUTTONS SECTION */}
        <View style={[
          styles.buttonContainer,

        ]}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.draftButton,
              loading && styles.disabledButton
            ]}
            onPress={handleDraftSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#78909C" />
            ) : (
              <Text style={styles.draftButtonText}>
                Save as Draft
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              (!isSubmitEnabled || loading) && styles.disabledButton
            ]}
            onPress={handleFinalSubmit}
            disabled={loading || !isSubmitEnabled}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.submitButtonText,
                (!isSubmitEnabled || loading) && styles.disabledButtonText
              ]}>
                Submit
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={datePickerVisible}
          mode="datetime"
          onConfirm={handleConfirmDate}
          onCancel={handleCancelDate}
        />
      </ScrollView>

    </KeyboardAwareScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },

  content: { flexGrow: 1, justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6ba94bff',
    paddingHorizontal: 16,
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    height: 120
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  headerRightPlaceholder: {
    width: 32,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100, // Extra padding at bottom
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  existingDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  existingDataContent: {
    flex: 1,
    marginLeft: 10,
  },
  existingDataText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  existingDataId: {
    color: '#0D47A1',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#455A64",
    marginBottom: 12,
    paddingLeft: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#455A64",
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#CFD8DC",
    fontSize: 14,
    marginBottom: 8,
  },
  inputError: {
    borderColor: "#F44336",
    borderWidth: 1,
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
    paddingLeft: 4,
  },
  dropdown: {
    backgroundColor: 'white',
    borderColor: '#CFD8DC',
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#000',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: "#43A047",
    marginLeft: 12,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 24,
  },
  tagBox: {
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tagItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tagText: {
    fontSize: 14,
    color: "#263238",
  },
  remove: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 6,
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  draftButton: {
    backgroundColor: "#ECEFF1",
    borderWidth: 1,
    borderColor: "#CFD8DC",
  },
  submitButton: {
    backgroundColor: "#FF9800",
  },
  disabledButton: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
    opacity: 0.7,
  },
  draftButtonText: {
    color: "#78909C",
    fontSize: 14,
    fontWeight: "600",
    textAlign: 'center',
    lineHeight: 18,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: 'center',
    lineHeight: 18,
  },
  disabledButtonText: {
    color: "#BDBDBD",
  },
  spacer: {
    height: 20,
  },
});