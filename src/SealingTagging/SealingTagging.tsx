import React, { useState, useCallback, useEffect } from "react";
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

export default function CombinedSeedOperations() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { formData } = useFormData();
  const [loading, setLoading] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isDraftEnabled, setIsDraftEnabled] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

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
  
  // Error states for inline validation
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

  /* ---------------- KEYBOARD LISTENER ---------------- */
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
    
    switch(field) {
      case 'unprocessedseed':
        if (!value.trim()) {
          error = "Unprocessed seed is required";
        } else if (!/^\d+$/.test(value)) {
          error = "Must be a number";
        }
        break;
        
      case 'noofbags':
        if (!value.trim()) {
          error = "Number of bags is required";
        } else if (!/^\d+$/.test(value)) {
          error = "Must be a number";
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
        if (!value.trim()) {
          error = "Date is required";
        }
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
      'transportationmode', 'vehiclenumber', 'drivername', 'drivercontactno'
    ];
    
    // Check if all required seed lifting fields are filled
    const areSeedLiftingFieldsFilled = requiredSeedLiftingFields.every(
      field => formState[field]?.toString().trim() !== ""
    );
    
    // Check numeric fields validation
    const areNumericFieldsValid = 
      /^\d+$/.test(formState.unprocessedseed) && 
      /^\d+$/.test(formState.noofbags);
    
    // Check phone number validation
    const isPhoneValid = /^\d{10}$/.test(formState.drivercontactno);
    
    // Check sealing/tagging fields for submit
    const areSealingFieldsFilled = 
      formState.HarvestingDate !== "" && 
      formState.ThreshingDate !== "" && 
      formState.SealingTaggingDate !== "" && 
      tags.length > 0;
    
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
    
    // Clear error for this date field
    setErrors(prev => ({
      ...prev,
      [fieldName]: ""
    }));
    
    setDatePickerVisible(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate on change and update error
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

  
  const validateFormForSubmit = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    // Validate all fields
    Object.keys(formState).forEach(field => {
      if (field !== 'remarks') { // Remarks is optional
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
    
    // Validate sealing & tagging dates
    if (!formState.HarvestingDate) {
      newErrors.HarvestingDate = "Harvesting date is required";
      isValid = false;
    }
    if (!formState.ThreshingDate) {
      newErrors.ThreshingDate = "Threshing date is required";
      isValid = false;
    }
    if (!formState.SealingTaggingDate) {
      newErrors.SealingTaggingDate = "Sealing/Tagging date is required";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  /* ---------------- VALIDATION FOR DRAFT ---------------- */
  const validateFormForDraft = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    // For draft, only check sealing & tagging fields
    const sealingFields = [
      { field: 'HarvestingDate', value: formState.HarvestingDate, name: 'Harvesting date' },
      { field: 'ThreshingDate', value: formState.ThreshingDate, name: 'Threshing date' },
      { field: 'SealingTaggingDate', value: formState.SealingTaggingDate, name: 'Sealing/Tagging date' }
    ];
    
    sealingFields.forEach(({ field, value, name }) => {
      if (!value.trim()) {
        newErrors[field] = `${name} is required for draft`;
        isValid = false;
      }
    });
    
    // Check tags
    if (tags.length === 0) {
      newErrors.tags = "At least one tag is required for draft";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  /* ---------------- CHECK IF FIELD IS FILLED ---------------- */
  const isFieldFilled = (value: any) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number') return value !== 0;
    return true;
  };

  /* ---------------- BUILD FORM DATA FOR DRAFT ---------------- */
  const buildDraftFormData = () => {
    const fd = new FormData();
    fd.append("AgreementId", formData?.agreementId || "");
    fd.append("AgreementLandId", "0");
    
    // Only add fields that have data
    if (isFieldFilled(formState.HarvestingDate)) {
      fd.append("HarvestingDate", formState.HarvestingDate);
    }
    
    if (isFieldFilled(formState.ThreshingDate)) {
      fd.append("ThreshingDate", formState.ThreshingDate);
    }
    
    if (isFieldFilled(formState.SealingTaggingDate)) {
      fd.append("SealingTaggingDate", formState.SealingTaggingDate);
    } else {
      // For draft, always send current date as sealing date
      fd.append("SealingTaggingDate", new Date().toISOString());
    }
    
    // Check if any seed lifting field is filled
    const seedLiftingFields = [
      'unprocessedseed', 'noofbags', 'staffname', 
      'transportationmode', 'vehiclenumber', 'drivername', 
      'drivercontactno', 'remarks'
    ];
    
    const hasAnySeedLiftingData = seedLiftingFields.some(field => 
      isFieldFilled(formState[field])
    );
    
    if (hasAnySeedLiftingData) {
      // Add index [0] only if there's data
      if (isFieldFilled(formState.unprocessedseed)) {
        fd.append("SeedLifting[0].unprocessedseed", formState.unprocessedseed);
      }
      if (isFieldFilled(formState.noofbags)) {
        fd.append("SeedLifting[0].noofbags", formState.noofbags);
      }
      if (isFieldFilled(formState.staffname)) {
        fd.append("SeedLifting[0].staffname", formState.staffname);
      }
      if (isFieldFilled(formState.transportationmode)) {
        fd.append("SeedLifting[0].transportationmode", formState.transportationmode);
      }
      if (isFieldFilled(formState.vehiclenumber)) {
        fd.append("SeedLifting[0].vehiclenumber", formState.vehiclenumber);
      }
      if (isFieldFilled(formState.drivername)) {
        fd.append("SeedLifting[0].drivername", formState.drivername);
      }
      if (isFieldFilled(formState.drivercontactno)) {
        fd.append("SeedLifting[0].drivercontactno", formState.drivercontactno);
      }
      if (isFieldFilled(formState.remarks)) {
        fd.append("SeedLifting[0].remarks", formState.remarks);
      }
    }
    
    // Add tags if any
    if (tags.length > 0) {
      tags.forEach((item, index) => {
        fd.append(`Tag[${index}].tagno`, item.tagno);
      });
    }
    
    return fd;
  };

  /* ---------------- BUILD FORM DATA FOR SUBMIT ---------------- */
  const buildSubmitFormData = () => {
    const fd = new FormData();
    fd.append("AgreementId", formData?.agreementId || "");
    fd.append("AgreementLandId", "0");
    
    // Submit: ALL fields must be sent
    fd.append("HarvestingDate", formState.HarvestingDate);
    fd.append("ThreshingDate", formState.ThreshingDate);
    fd.append("SealingTaggingDate", formState.SealingTaggingDate || new Date().toISOString());
    
    // Submit: ALL seed lifting fields must be sent
    fd.append("SeedLifting[0].unprocessedseed", formState.unprocessedseed);
    fd.append("SeedLifting[0].noofbags", formState.noofbags);
    fd.append("SeedLifting[0].staffname", formState.staffname);
    fd.append("SeedLifting[0].transportationmode", formState.transportationmode);
    fd.append("SeedLifting[0].vehiclenumber", formState.vehiclenumber);
    fd.append("SeedLifting[0].drivername", formState.drivername);
    fd.append("SeedLifting[0].drivercontactno", formState.drivercontactno);
    fd.append("SeedLifting[0].remarks", formState.remarks || ""); // Empty string if no remarks
    
    // Submit: ALL tags must be sent
    tags.forEach((item, index) => {
      fd.append(`Tag[${index}].tagno`, item.tagno);
    });
    
    return fd;
  };

  /* ---------------- API SUBMIT FUNCTION ---------------- */
  const submitData = async (isDraft: boolean = false) => {
    try {
      setLoading(true);
      
      const formDataToSend = isDraft ? buildDraftFormData() : buildSubmitFormData();
      
      console.log(`📤 Submitting ${isDraft ? 'DRAFT' : 'FINAL'} data...`);
      console.log("Mode:", isDraft ? "Draft - Only filled fields" : "Submit - All fields");
      
      const response = await apiClient.post("/api/harvesting/add", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Show success message
      Alert.alert(
        "Success", 
        `Data ${isDraft ? 'saved as draft' : 'submitted successfully'}`,
        [
          {
            text: "OK",
            onPress: () => {
              if (isDraft) {
                // Navigate to Sealing Tagging List screen after draft save
                navigation.navigate("Sealing Tagging List");
              } else {
                // Clear form and go to dashboard after submit
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
                setTags([]);
                setTagInput("");
                
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Dashboard" }],
                });
              }
            },
          },
        ]
      );
    } catch (error) {
      console.log(`❌ API ERROR (${isDraft ? 'Draft' : 'Submit'}):`, error?.response?.data || error);
      
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.error || 
        `Failed to ${isDraft ? 'save draft' : 'submit data'}`;
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- BUTTON HANDLERS ---------------- */
  const handleDraftSubmit = async () => {
    // Validate draft requirements
    if (!validateFormForDraft()) {
      return;
    }
    
    await submitData(true);
  };

  const handleFinalSubmit = async () => {
    if (!validateFormForSubmit()) {
      return;
    }
    await submitData(false);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Farmer Agreement");
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[styles.container]}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContainer, { minHeight: screenHeight }]}
          keyboardShouldPersistTaps="handled"
       
        >
          {/* Sealing & Tagging Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sealing & Tagging *</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Harvesting Date *</Text>
              <TouchableOpacity onPress={() => openDatePicker("harvest")}>
                <TextInput
                  style={[
                    styles.input,
                    errors.HarvestingDate && styles.inputError
                  ]}
                  placeholder="Select date"
                  value={formState.HarvestingDate ? new Date(formState.HarvestingDate).toLocaleDateString() : ""}
                  editable={false}
                />
              </TouchableOpacity>
              {errors.HarvestingDate ? (
                <Text style={styles.errorText}>{errors.HarvestingDate}</Text>
              ) : null}

              <Text style={styles.label}>Threshing Date *</Text>
              <TouchableOpacity onPress={() => openDatePicker("thresh")}>
                <TextInput
                  style={[
                    styles.input,
                    errors.ThreshingDate && styles.inputError
                  ]}
                  placeholder="Select date"
                  value={formState.ThreshingDate ? new Date(formState.ThreshingDate).toLocaleDateString() : ""}
                  editable={false}
                />
              </TouchableOpacity>
              {errors.ThreshingDate ? (
                <Text style={styles.errorText}>{errors.ThreshingDate}</Text>
              ) : null}

              <Text style={styles.label}>Sealing / Tagging Date *</Text>
              <TouchableOpacity onPress={() => openDatePicker("sealing")}>
                <TextInput
                  style={[
                    styles.input,
                    errors.SealingTaggingDate && styles.inputError
                  ]}
                  placeholder="Select date"
                  value={formState.SealingTaggingDate ? new Date(formState.SealingTaggingDate).toLocaleDateString() : ""}
                  editable={false}
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
                keyboardType="numeric"
                returnKeyType="next"
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
                keyboardType="numeric"
                returnKeyType="next"
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
              />
            </View>
          </View>

          {/* Spacer to ensure buttons are visible */}
          <View style={styles.spacer} />

          {/* ACTION BUTTONS SECTION */}
          <View style={[
            styles.buttonContainer,
            keyboardVisible && { marginBottom: 20 }
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
            onCancel={() => setDatePickerVisible(false)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
 
   container: { flex: 1, backgroundColor: '#ffffff' },
     scrollContainer: { flexGrow: 1, justifyContent: 'center', backgroundColor: '#ffffff' , paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40},
  
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
    gap: 16,
    backgroundColor: '#F4F6F8',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButtonText: {
    color: "#BDBDBD",
  },
  statusContainer: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 100,
  },
  statusNote: {
    color: "#F57C00",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  statusInfo: {
    color: "#1976D2",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 6,
    lineHeight: 18,
  },
  statusInfoBold: {
    fontWeight: "700",
  },
  statusSubmit: {
    color: "#388E3C",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  statusWarning: {
    color: "#F57C00",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  spacer: {
    height: 20,
  },
});