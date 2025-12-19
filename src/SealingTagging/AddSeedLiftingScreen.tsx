import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation, NavigationProp, useRoute, RouteProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from 'react-native-element-dropdown';
import { HelperText } from "react-native-paper";
import apiClient from "../Service/apiInterceptors";
import { useFormData } from "../Constants/FormContext";
import useForm from "../Form/UseForm";


interface RouteParams {
  harvestingId: string;
  commodityname?: string;
  varietyname?: string;
}

interface SeedLiftingFormData {
  DriverName: string;
  DriverContactNo: string;
  VehicleNumber: string;
  TransportationMode: string;
  NoOfBags: string;
  UnProcessedSeed: string;
  StaffName: string;
  Remarks: string;
  Date: string;
}

const transportationModes = [
  { label: "Transport", value: "Transport" },
  { label: "Hired Vehicle", value: "HiredVechile" },
  { label: "Office Vehicle", value: "OfficeVechile" },
  { label: "Farmer Own Vehicle", value: "FarmerOwnVechile" },
];

export default function AddSeedLiftingScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { harvestingId, commodityname, varietyname } = route.params || {};
  
  // Use your custom form hook
  const { state, updateState } = useForm();
  
  // Extract form data from state
  const formData = state.form as SeedLiftingFormData || {
    DriverName: "",
    DriverContactNo: "",
    VehicleNumber: "",
    TransportationMode: "Transport",
    NoOfBags: "",
    UnProcessedSeed: "",
    StaffName: "",
    Remarks: "",
    Date: new Date().toISOString(),
  };
  
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle back press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  // Update form data using your hook
  const updateFormData = (field: keyof SeedLiftingFormData, value: string) => {
    updateState({
      form: { ...formData, [field]: value }
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field: keyof SeedLiftingFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field: keyof SeedLiftingFormData, value: string): boolean => {
    let error = "";
    
    switch (field) {
      case 'DriverName':
        if (!value.trim()) error = "Driver Name is required";
        break;
      case 'DriverContactNo':
        if (!value.trim()) error = "Driver Contact Number is required";
        else if (!/^\d{10}$/.test(value.trim())) error = "Please enter a valid 10-digit phone number";
        break;
      case 'VehicleNumber':
        if (!value.trim()) error = "Vehicle Number is required";
        break;
      case 'TransportationMode':
        if (!value.trim()) error = "Transportation Mode is required";
        break;
      case 'NoOfBags':
        if (!value.trim()) error = "Number of Bags is required";
        else if (!/^\d+$/.test(value)) error = "Must be a valid number";
        else if (parseInt(value) < 0) error = "Must be 0 or greater";
        break;
      case 'UnProcessedSeed':
        if (!value.trim()) error = "Unprocessed Seed quantity is required";
        else if (!/^\d+$/.test(value)) error = "Must be a valid number";
        else if (parseInt(value) < 0) error = "Must be 0 or greater";
        break;
      case 'StaffName':
        if (!value.trim()) error = "Staff Name is required";
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate all fields
    if (!formData.DriverName.trim()) {
      newErrors.DriverName = "Driver Name is required";
      isValid = false;
    }
    
    if (!formData.DriverContactNo.trim()) {
      newErrors.DriverContactNo = "Driver Contact Number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.DriverContactNo.trim())) {
      newErrors.DriverContactNo = "Please enter a valid 10-digit phone number";
      isValid = false;
    }
    
    if (!formData.VehicleNumber.trim()) {
      newErrors.VehicleNumber = "Vehicle Number is required";
      isValid = false;
    }
    
    if (!formData.TransportationMode.trim()) {
      newErrors.TransportationMode = "Transportation Mode is required";
      isValid = false;
    }
    
    if (!formData.NoOfBags.trim()) {
      newErrors.NoOfBags = "Number of Bags is required";
      isValid = false;
    } else if (!/^\d+$/.test(formData.NoOfBags)) {
      newErrors.NoOfBags = "Must be a valid number";
      isValid = false;
    } else if (parseInt(formData.NoOfBags) < 0) {
      newErrors.NoOfBags = "Must be 0 or greater";
      isValid = false;
    }
    
    if (!formData.UnProcessedSeed.trim()) {
      newErrors.UnProcessedSeed = "Unprocessed Seed quantity is required";
      isValid = false;
    } else if (!/^\d+$/.test(formData.UnProcessedSeed)) {
      newErrors.UnProcessedSeed = "Must be a valid number";
      isValid = false;
    } else if (parseInt(formData.UnProcessedSeed) < 0) {
      newErrors.UnProcessedSeed = "Must be 0 or greater";
      isValid = false;
    }
    
    if (!formData.StaffName.trim()) {
      newErrors.StaffName = "Staff Name is required";
      isValid = false;
    }

    setErrors(newErrors);
    
    // Mark all fields as touched for error display
    const allFields = ['DriverName', 'DriverContactNo', 'VehicleNumber', 'TransportationMode', 'NoOfBags', 'UnProcessedSeed', 'StaffName'];
    const newTouched = { ...touched };
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!harvestingId) {
      Alert.alert("Error", "Harvesting ID is required");
      return;
    }

    try {
      setSubmitting(true);

      // Using FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('DriverName', formData.DriverName.trim());
      formDataToSend.append('DriverContactNo', formData.DriverContactNo.trim());
      formDataToSend.append('VehicleNumber', formData.VehicleNumber.trim());
      formDataToSend.append('TransportationMode', formData.TransportationMode);
      formDataToSend.append('NoOfBags', formData.NoOfBags);
      formDataToSend.append('UnProcessedSeed', formData.UnProcessedSeed);
      formDataToSend.append('StaffName', formData.StaffName.trim());
      formDataToSend.append('Date', formData.Date);
      if (formData.Remarks.trim()) {
        formDataToSend.append('Remarks', formData.Remarks.trim());
      }

      console.log("Submitting to:", `/api/seedlifting/harvesting/${harvestingId}`);
      console.log("Form data:", {
        DriverName: formData.DriverName,
        DriverContactNo: formData.DriverContactNo,
        VehicleNumber: formData.VehicleNumber,
        TransportationMode: formData.TransportationMode,
        NoOfBags: formData.NoOfBags,
        UnProcessedSeed: formData.UnProcessedSeed,
        StaffName: formData.StaffName,
        Remarks: formData.Remarks,
        Date: formData.Date,
      });

      const response = await apiClient.post(
        `/api/seedlifting/harvesting/${harvestingId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Response:", response.data);

      Alert.alert(
        "Success",
        "Seed lifting record added successfully",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );


    } catch (error: any) 
    {
      console.error("Error submitting seed lifting:", error);
      console.error("Error response:", error.response?.data);
      
      let errorMessage = "Failed to submit seed lifting record";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Header component
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Add Seed Lifting</Text>
      <View style={styles.headerRightPlaceholder} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />
      <Header />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.contentContainer}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Harvesting Info Banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle-outline" size={20} color="#2E7D32" />
              <Text style={styles.infoText}>
                {commodityname || "Commodity"} • {varietyname || "Variety"}
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Seed Lifting Details</Text>
              
              {/* Transportation Details Section */}
              <Text style={styles.sectionLabel}>Transportation Details</Text>
              
              {/* Driver Name */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    touched.DriverName && errors.DriverName && styles.inputError
                  ]}
                  placeholder="Driver Name *"
                  value={formData.DriverName}
                  onChangeText={(text) => updateFormData('DriverName', text)}
                  onBlur={() => handleBlur('DriverName')}
                  autoCapitalize="words"
                />
                {touched.DriverName && errors.DriverName ? (
                  <HelperText type="error" visible={true}>
                    {errors.DriverName}
                  </HelperText>
                ) : null}
              </View>
              
              {/* Driver Contact Number */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    touched.DriverContactNo && errors.DriverContactNo && styles.inputError
                  ]}
                  placeholder="Driver Contact Number *"
                  value={formData.DriverContactNo}
                  onChangeText={(text) => updateFormData('DriverContactNo', text.replace(/[^0-9]/g, ''))}
                  onBlur={() => handleBlur('DriverContactNo')}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {touched.DriverContactNo && errors.DriverContactNo ? (
                  <HelperText type="error" visible={true}>
                    {errors.DriverContactNo}
                  </HelperText>
                ) : null}
              </View>
              
              {/* Vehicle Number */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    touched.VehicleNumber && errors.VehicleNumber && styles.inputError
                  ]}
                  placeholder="Vehicle Number *"
                  value={formData.VehicleNumber}
                  onChangeText={(text) => updateFormData('VehicleNumber', text)}
                  onBlur={() => handleBlur('VehicleNumber')}
                  autoCapitalize="characters"
                />
                {touched.VehicleNumber && errors.VehicleNumber ? (
                  <HelperText type="error" visible={true}>
                    {errors.VehicleNumber}
                  </HelperText>
                ) : null}
              </View>

              {/* Transportation Mode Dropdown */}
              <View style={styles.inputContainer}>
                <Text style={styles.pickerLabel}>Transportation Mode *</Text>
                <View style={[
                  styles.pickerWrapper,
                  touched.TransportationMode && errors.TransportationMode && styles.pickerWrapperError
                ]}>
                  <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    data={transportationModes}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Transportation Mode"
                    value={formData.TransportationMode}
                    onChange={item => {
                      updateFormData('TransportationMode', item.value);
                      validateField('TransportationMode', item.value);
                    }}
                  />
                </View>
                {touched.TransportationMode && errors.TransportationMode ? (
                  <HelperText type="error" visible={true}>
                    {errors.TransportationMode}
                  </HelperText>
                ) : null}
              </View>

              {/* Seed Details Section */}
              <Text style={styles.sectionLabel}>Seed Details</Text>
              
              {/* Number of Bags */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    touched.NoOfBags && errors.NoOfBags && styles.inputError
                  ]}
                  placeholder="Number of Bags *"
                  value={formData.NoOfBags}
                  onChangeText={(text) => updateFormData('NoOfBags', text.replace(/[^0-9]/g, ''))}
                  onBlur={() => handleBlur('NoOfBags')}
                  keyboardType="numeric"
                />
                {touched.NoOfBags && errors.NoOfBags ? (
                  <HelperText type="error" visible={true}>
                    {errors.NoOfBags}
                  </HelperText>
                ) : null}
              </View>
              
              {/* Unprocessed Seed Quantity */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    touched.UnProcessedSeed && errors.UnProcessedSeed && styles.inputError
                  ]}
                  placeholder="Unprocessed Seed Quantity *"
                  value={formData.UnProcessedSeed}
                  onChangeText={(text) => updateFormData('UnProcessedSeed', text.replace(/[^0-9]/g, ''))}
                  onBlur={() => handleBlur('UnProcessedSeed')}
                  keyboardType="numeric"
                />
                {touched.UnProcessedSeed && errors.UnProcessedSeed ? (
                  <HelperText type="error" visible={true}>
                    {errors.UnProcessedSeed}
                  </HelperText>
                ) : null}
              </View>

              {/* Staff Details Section */}
              <Text style={styles.sectionLabel}>Staff Details</Text>
              
              {/* Staff Name */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    touched.StaffName && errors.StaffName && styles.inputError
                  ]}
                  placeholder="Staff Name *"
                  value={formData.StaffName}
                  onChangeText={(text) => updateFormData('StaffName', text)}
                  onBlur={() => handleBlur('StaffName')}
                  autoCapitalize="words"
                />
                {touched.StaffName && errors.StaffName ? (
                  <HelperText type="error" visible={true}>
                    {errors.StaffName}
                  </HelperText>
                ) : null}
              </View>

              {/* Remarks Section */}
              <Text style={styles.sectionLabel}>Remarks (Optional)</Text>
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional remarks..."
                value={formData.Remarks}
                onChangeText={(text) => updateFormData('Remarks', text)}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Submit Seed Lifting</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingBottom: 70,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2E7D32",
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    color: "#333",
  },
  inputError: {
    borderColor: "#D32F2F",
    backgroundColor: "#FFEBEE",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    marginBottom: 6,
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#F5F5F5",
  },
  pickerWrapperError: {
    borderColor: "#D32F2F",
    backgroundColor: "#FFEBEE",
  },
  dropdown: {
    height: 48,
  },
  placeholderStyle: {
    color: '#999',
    fontSize: 14,
  },
  selectedTextStyle: {
    color: '#333',
    fontSize: 14,
  },
  itemTextStyle: {
    color: '#333',
    fontSize: 14,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});