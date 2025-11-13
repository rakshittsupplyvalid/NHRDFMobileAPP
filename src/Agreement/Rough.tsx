import React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { BackHandler } from 'react-native';
import { TextInput, Button, Text, Card, Checkbox, Divider, HelperText } from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import CommonPicker from "../CommonComponent/CommonDropdown";
import { produceseeds, Seeds } from "../Constants/constants";
import useForm from "../Form/UseForm";
import YearPickerInput from "../CommonComponent/CommonYearPicker";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from "@react-navigation/native";
import { fetchCommodityTypes, fetchCommoditiesByType, farmer, farmerDetails, getFarmerLandDetail, fetchSeedOptions } from "../Service/fetchCommodity";
import axios from 'axios';
import { useFormData } from "../Constants/FormContext";

const AgreementForm: React.FC = () => {
  const { state, updateState } = useForm();
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedVariety, setSelectedVariety] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [commodityTypes, setCommodityTypes] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [selectedCommodityType, setSelectedCommodityType] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  const [selectedCenterTarget, setSelectedCenterTargetId] = useState("");
  const [farmersList, setFarmersList] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [seedOptions, setSeedOptions] = useState([]);
  const [farmerLandList, setFarmerLandList] = useState<any[]>([]);
  const [selectedLandId, setSelectedLandId] = useState<string | null>(null);

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});
  const [checked, setChecked] = useState(false);

  const { setFormData } = useFormData();
  const navigation = useNavigation<any>();

  // Validation functions
  const validateField = (field: string, value: any): string => {
    let error = '';

    switch (field) {
      case 'selectedCommodityType':
        if (!value || value.toString().trim() === '') {
          error = 'Commodity Type is required';
        }
        break;
      
      case 'selectedCommodity':
        if (!value || value.toString().trim() === '') {
          error = 'Commodity is required';
        }
        break;
      
      case 'selectedFarmer':
        if (!value || value.toString().trim() === '') {
          error = 'Farmer selection is required';
        }
        break;
      
      case 'produceseeds':
        if (!value || value.toString().trim() === '') {
          error = 'Produce Seeds selection is required';
        }
        break;
      
      case 'seeds':
        if (!value || value.toString().trim() === '') {
          error = 'Seeds selection is required';
        }
        break;
      
      case 'Year':
        if (!value || value.toString().trim() === '') {
          error = 'Year is required';
        }
        break;
      
      case 'Area':
        if (!value || value.toString().trim() === '') {
          error = 'Area is required';
        } else if (isNaN(Number(value)) || parseFloat(value) <= 0) {
          error = 'Please enter a valid area';
        } else if (parseFloat(value) > 1000000) {
          error = 'Maximum area allowed is 10,00,000 hectares';
        }
        break;
      
      case 'CertificateNo':
        if (!value || value.toString().trim() === '') {
          error = 'Certificate No is required';
        } else if (value.length > 10) {
          error = 'Certificate No cannot exceed 10 characters';
        }
        break;
      
      case 'SurveyNo':
        if (!value || value.toString().trim() === '') {
          error = 'Survey No is required';
        } else if (value.length > 10) {
          error = 'Survey No cannot exceed 10 characters';
        }
        break;
      
      case 'selectedLandId':
        if (!value || value.toString().trim() === '') {
          error = 'Please select at least one land';
        }
        break;
      
      default:
        break;
    }

    return error;
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate all required fields
    newErrors.selectedCommodityType = validateField('selectedCommodityType', selectedCommodityType);
    newErrors.selectedCommodity = validateField('selectedCommodity', selectedCommodity);
    newErrors.selectedFarmer = validateField('selectedFarmer', selectedFarmer);
    newErrors.produceseeds = validateField('produceseeds', state.form.produceseeds);
    newErrors.seeds = validateField('seeds', state.form.seeds);
    newErrors.Year = validateField('Year', state.form.Year);
    newErrors.Area = validateField('Area', state.form.Area);
    newErrors.CertificateNo = validateField('CertificateNo', state.form.CertificateNo);
    newErrors.SurveyNo = validateField('SurveyNo', state.form.SurveyNo);
    newErrors.selectedLandId = validateField('selectedLandId', selectedLandId);

    setErrors(newErrors);
    
    // Mark all fields as touched to show all errors
    const allFields = [
      'selectedCommodityType', 'selectedCommodity', 'selectedFarmer', 
      'produceseeds', 'seeds', 'Year', 'Area', 'CertificateNo', 
      'SurveyNo', 'selectedLandId'
    ];
    const newTouched: {[key: string]: boolean} = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    return Object.values(newErrors).every(error => error === '');
  };

  const handleFieldChange = (field: string, value: any) => {
  console.log(`🔄 Field ${field} changed to:`, value);

  // Update state
  if (field === 'selectedCommodityType') {
    setSelectedCommodityType(value);
    setSelectedCommodity('');
    setFarmersList([]);
    setSelectedFarmer('');
    setFarmerLandList([]);
    setSelectedLandId(null);
  } else if (field === 'selectedCommodity') {
    setSelectedCommodity(value);
  } else if (field === 'selectedFarmer') {
    setSelectedFarmer(value);
    const selectedItem = farmersList.find(item => item.value === value);
    if (selectedItem) {
      setSelectedVariety(selectedItem.varietyId);
      setSelectedFarmerId(selectedItem.Id);
      setSelectedCenterTargetId(selectedItem.centertargetid);
    }
  } else if (field === 'selectedLandId') {
    setSelectedLandId(value);
  } else {
    updateState({
      ...state,
      form: { ...state.form, [field]: value },
    });
  }

  // Mark touched
  setTouched(prev => ({ ...prev, [field]: true }));

  // ✅ If value selected -> remove error immediately
  if (value && value !== "") {
    setErrors(prev => ({ ...prev, [field]: '' }));
  } else {
    // Only validate if value empty
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }
};


const handlePickerFocus = (field: string) => {
  console.log(`🎯 Picker ${field} focused`);
  setFocusedFields(prev => ({ ...prev, [field]: true }));
  setTouched(prev => ({ ...prev, [field]: true }));
};


const handlePickerBlur = (field: string) => {
  let value =
    field === "selectedCommodityType" ? selectedCommodityType :
    field === "selectedCommodity" ? selectedCommodity :
    field === "selectedFarmer" ? selectedFarmer :
    field === "selectedLandId" ? selectedLandId :
    state.form[field];

  // Only validate if empty
  if (!value) {
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }
};

  // FIXED: Proper handler for text inputs
  const handleTextInputBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = state.form[field];
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Helper to check if error should be shown
 const shouldShowError = (field: string) => {
  const value =
    field === "selectedCommodityType" ? selectedCommodityType :
    field === "selectedCommodity" ? selectedCommodity :
    field === "selectedFarmer" ? selectedFarmer :
    field === "selectedLandId" ? selectedLandId :
    state.form[field];

  return touched[field] && errors[field] && (!value || value === "");
};


  // Rest of your useEffect functions remain the same...
  useEffect(() => {
    (async () => {
      const data = await fetchCommodityTypes();
      setCommodityTypes(data);
    })();
  }, []);

  useEffect(() => {
    if (!selectedCommodityType) return;
    (async () => {
      const items = await fetchCommoditiesByType(selectedCommodityType);
      setCommodities(items);
    })();
  }, [selectedCommodityType]);

  useEffect(() => {
    if (!selectedCommodity) {
      setFarmersList([]);
      setSelectedFarmer('');
      setFarmerLandList([]);
      setSelectedLandId(null);
      return;
    }
    (async () => {
      const items = await farmer(selectedCommodity);
      setFarmersList(items);
    })();
  }, [selectedCommodity]);

  useEffect(() => {
    if (!selectedFarmer) return;

    (async () => {
      const details = await farmerDetails(selectedFarmer);
      const info = details.length > 0 ? details[0] : null;
      const landDetails = await getFarmerLandDetail(selectedFarmer);

      updateState({
        ...state,
        form: {
          ...state.form,
          id: info?.id || "",
          name: info?.name || "",
          age: "25",
          occupation: info?.occupation || "",
          relation: info?.relation || "",
          relativename: info?.relativename || "",
          gender: info?.gender || "",
          statename: info?.statename || "",
          villagename: info?.villagename || "",
          districtname: info?.districtname || "",
          village: info?.village || "",
          post: info?.post || "",
          taluka: info?.taluka || "",
          dist: info?.district || "",
          state: info?.state || "",
          pincode: info?.pincode?.toString() || "",
          phone: info?.phone || "",
          mobile: info?.mobile || "",
        },
      });

      setFarmerLandList(landDetails || []);
    })();
  }, [selectedFarmer]);


    useEffect(() => {
      (async () => {
        const data = await fetchSeedOptions();
        setSeedOptions(data);
        console.log("Fetched Commodity Types:", data);
      })();
    }, []);

  const fields = [
    { label: 'Full Name', value: state.form.name, icon: 'account' },
    { label: 'Age', value: '25', icon: 'calendar' },
    { label: 'Gender', value: state.form.gender, icon: 'gender-male-female' },
    { label: 'Relation', value: state.form.relation, icon: 'account-group' },
    { label: 'Relative Name', value: state.form.relativename, icon: 'account' },
    { label: 'Village', value: state.form.villagename, icon: 'home-city' },
    { label: 'District', value: state.form.districtname, icon: 'map-marker' },
    { label: 'State', value: state.form.statename, icon: 'map' },
    { label: 'Pincode', value: state.form.pincode, icon: 'numeric' },
    { label: 'Mobile Number', value: state.form.mobile, icon: 'phone' },
  ];

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      enableAutomaticScroll={true}
      showsVerticalScrollIndicator={false}
    >
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.label}>Commodity Type *</Text>
          <CommonPicker
            selectedValue={selectedCommodityType}
            onValueChange={(value) => handleFieldChange('selectedCommodityType', value)}
            onFocus={() => handlePickerFocus('selectedCommodityType')}
            onBlur={() => handlePickerBlur('selectedCommodityType')}
            items={commodityTypes}
            isFocused={focusedFields.selectedCommodityType}
          />
          <HelperText type="error" visible={shouldShowError('selectedCommodityType')}>
            {errors.selectedCommodityType}
          </HelperText>

          <Text style={styles.label}>Commodity *</Text>
          <CommonPicker
            selectedValue={selectedCommodity}
            onValueChange={(value) => handleFieldChange('selectedCommodity', value)}
            onFocus={() => handlePickerFocus('selectedCommodity')}
            onBlur={() => handlePickerBlur('selectedCommodity')}
            items={commodities}
            isFocused={focusedFields.selectedCommodity}
          />
          <HelperText type="error" visible={shouldShowError('selectedCommodity')}>
            {errors.selectedCommodity}
          </HelperText>

          <Text style={styles.label}>Farmer *</Text>
          <CommonPicker
            selectedValue={selectedFarmer}
            onValueChange={(value) => handleFieldChange('selectedFarmer', value)}
            onFocus={() => handlePickerFocus('selectedFarmer')}
            onBlur={() => handlePickerBlur('selectedFarmer')}
            items={farmersList}
            isFocused={focusedFields.selectedFarmer}
          />
          <HelperText type="error" visible={shouldShowError('selectedFarmer')}>
            {errors.selectedFarmer}
          </HelperText>

          <Text style={styles.label}>Certificate No *</Text>
          <TextInput
            label="Certificate No"
            mode="outlined"
            placeholder="Enter certificate number"
            value={state.form.CertificateNo || ""}
            onChangeText={(value) => handleFieldChange('CertificateNo', value)}
            onBlur={() => handleTextInputBlur('CertificateNo')}
            style={[styles.input, { backgroundColor: "white" }]}
            maxLength={10}
            error={shouldShowError('CertificateNo')}
          />
          <HelperText type="error" visible={shouldShowError('CertificateNo')}>
            {errors.CertificateNo}
          </HelperText>

          <Text style={styles.label}>Survey No *</Text>
          <TextInput
            label="Survey No"
            mode="outlined"
            placeholder="Enter survey number"
            value={state.form.SurveyNo || ""}
            onChangeText={(value) => handleFieldChange('SurveyNo', value)}
            onBlur={() => handleTextInputBlur('SurveyNo')}
            style={[styles.input, { backgroundColor: "white" }]}
            maxLength={10}
            error={shouldShowError('SurveyNo')}
          />
          <HelperText type="error" visible={shouldShowError('SurveyNo')}>
            {errors.SurveyNo}
          </HelperText>
        </Card.Content>
      </Card>

      {/* Farmer Information Card - Same as before */}
      <Card style={styles.farmerCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Farmer Information</Text>
          <Divider style={styles.headerDivider} />
          {selectedFarmer ? (
            <View style={styles.detailsContainer}>
              {fields.map((item, index) => (
                <View key={index}>
                  <View style={styles.detailRow}>
                    <View style={styles.labelContainer}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={20}
                        color="#4CAF50"
                        style={{ marginRight: 8 }}
                      />
                      <Text variant="bodyMedium" style={styles.detailLabel}>{item.label}:</Text>
                    </View>
                    <Text variant="bodyMedium" style={styles.detailValue}>
                      {item.value?.toString() || '-'}
                    </Text>
                  </View>
                  {index < fields.length - 1 && <Divider style={styles.rowDivider} />}
                </View>
              ))}
            </View>
          ) : (
            <Text variant="bodySmall" style={styles.noFarmerSelected}>
              {shouldShowError('selectedFarmer') ? errors.selectedFarmer : 'No farmer selected'}
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Farmer Land Details Card - Same as before */}
      <Card style={styles.farmerCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Farmer Land Details *</Text>
          <Divider style={styles.headerDivider} />
          {farmerLandList.length > 0 ? (
            <>
              {farmerLandList.map((land, index) => (
                <View
                  key={index}
                  style={[
                    styles.landCard,
                    selectedLandId === land.id && styles.selectedLandCard,
                  ]}
                >
                  <View style={styles.checkboxRow}>
                    <Checkbox
                      status={selectedLandId === land.id ? "checked" : "unchecked"}
                      onPress={() => handleFieldChange('selectedLandId', land.id === selectedLandId ? null : land.id)}
                      color="#1976D2"
                    />
                    <Text style={styles.landLabel}>Select Land {index + 1}</Text>
                  </View>
                  <Divider />
                  <View style={styles.detailsContainer}>
                                 
                                     <View style={styles.detailRow}>
                                       <View style={styles.labelContainer}>
                                         <MaterialCommunityIcons
                                           name="numeric"
                                           size={20}
                                           color="#4CAF50"
                                           style={{ marginRight: 8 }}
                                         />
                                         <Text style={styles.detailLabel}>Land Number:</Text>
                                       </View>
                                       <Text style={styles.detailValue}>{land.number || "-"}</Text>
                                     </View>
                 
                                     <View style={styles.detailRow}>
                                       <View style={styles.labelContainer}>
                                         <MaterialCommunityIcons
                                           name="numeric-2-box-outline"
                                           size={20}
                                           color="#4CAF50"
                                           style={{ marginRight: 8 }}
                                         />
                                         <Text style={styles.detailLabel}>Sub Number:</Text>
                                       </View>
                                       <Text style={styles.detailValue}>{land.subnumber || "-"}</Text>
                                     </View>
                 
                                     <View style={styles.detailRow}>
                                       <View style={styles.labelContainer}>
                                         <MaterialCommunityIcons
                                           name="square-outline"
                                           size={20}
                                           color="#4CAF50"
                                           style={{ marginRight: 8 }}
                                         />
                                         <Text style={styles.detailLabel}>Total Area:</Text>
                                       </View>
                                       <Text style={styles.detailValue}>
                                         {land.totalarea || "-"} {land.unit}
                                       </Text>
                                     </View>
                 
                                     <View style={styles.detailRow}>
                                       <View style={styles.labelContainer}>
                                         <MaterialCommunityIcons
                                           name="nature"
                                           size={20}
                                           color="#4CAF50"
                                           style={{ marginRight: 8 }}
                                         />
                                         <Text style={styles.detailLabel}>Sowing Area:</Text>
                                       </View>
                                       <Text style={styles.detailValue}>{land.sowingarea || "-"}</Text>
                                     </View>
                 
                                     <View style={styles.detailRow}>
                                       <View style={styles.labelContainer}>
                                         <MaterialCommunityIcons
                                           name="home-city"
                                           size={20}
                                           color="#4CAF50"
                                           style={{ marginRight: 8 }}
                                         />
                                         <Text style={styles.detailLabel}>Village:</Text>
                                       </View>
                                       <Text style={styles.detailValue}>{land.village || "-"}</Text>
                                     </View>
                 
                                     <View style={styles.detailRow}>
                                       <View style={styles.labelContainer}>
                                         <MaterialCommunityIcons
                                           name={
                                             land.approvalstatus === "PENDING"
                                               ? "clock-time-four-outline"
                                               : land.approvalstatus === "APPROVED"
                                                 ? "check-circle-outline"
                                                 : "close-circle-outline"
                                           }
                                           size={20}
                                           color={
                                             land.approvalstatus === "PENDING"
                                               ? "#FFC107"
                                               : land.approvalstatus === "APPROVED"
                                                 ? "#4CAF50"
                                                 : "#F44336"
                                           }
                                           style={{ marginRight: 8 }}
                                         />
                                         <Text style={styles.detailLabel}>Approval Status:</Text>
                                       </View>
                                       <Text
                                         style={[
                                           styles.detailValue,
                                           {
                                             color:
                                               land.approvalstatus === "PENDING"
                                                 ? "#FFC107"
                                                 : land.approvalstatus === "APPROVED"
                                                   ? "#4CAF50"
                                                   : "#F44336",
                                           },
                                         ]}
                                       >
                                         {land.approvalstatus || "-"}
                                       </Text>
                                     </View>
                                   </View>
                </View>
              ))}
              <HelperText type="error" visible={shouldShowError('selectedLandId')}>
                {errors.selectedLandId}
              </HelperText>
            </>
          ) : (
            <Text style={styles.noFarmerSelected}>
              {selectedFarmer ? 'No land details available' : 'Select a farmer to view land details'}
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Seed Production Details</Text>
          
          <Text style={styles.label}>Produce Seeds *</Text>
          <CommonPicker
            selectedValue={state.form.produceseeds || ""}
            onValueChange={value => handleFieldChange('produceseeds', value)}
            onFocus={() => handlePickerFocus('produceseeds')}
            onBlur={() => handlePickerBlur('produceseeds')}
            items={produceseeds}
            isFocused={focusedFields.produceseeds}
          />
          <HelperText type="error" visible={shouldShowError('produceseeds')}>
            {errors.produceseeds}
          </HelperText>

          <Text style={styles.label}>Seeds *</Text>
          <CommonPicker
            selectedValue={state.form.seeds || ""}
            onValueChange={(value) => handleFieldChange('seeds', value)}
            onFocus={() => handlePickerFocus('seeds')}
            onBlur={() => handlePickerBlur('seeds')}
            items={seedOptions}
            isFocused={focusedFields.seeds}
          />
          <HelperText type="error" visible={shouldShowError('seeds')}>
            {errors.seeds}
          </HelperText>
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Contract Terms</Text>

          <Text style={styles.label}>Duration Year *</Text>
          <YearPickerInput
            value={state.form.Year}
            onChange={(year) => handleFieldChange('Year', year)}
          />
          <HelperText type="error" visible={shouldShowError('Year')}>
            {errors.Year}
          </HelperText>

          <Text style={styles.label}>Area (in hectares) *</Text>
          <TextInput
            label="Area (in hectares)"
            mode="outlined"
            placeholder="Enter area"
            value={state.form.Area || ""}
            maxLength={8}
            keyboardType="numeric"
            left={<TextInput.Icon icon="arrow-expand" />}
            onChangeText={(value) => handleFieldChange('Area', value)}
            onBlur={() => handleTextInputBlur('Area')}
            style={[styles.input, { backgroundColor: 'white' }]}
            error={shouldShowError('Area')}
          />
          <HelperText type="error" visible={shouldShowError('Area')}>
            {errors.Area}
          </HelperText>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
        onPress={() => {
          if (!validateForm()) {
            console.log("❌ Validation failed — please fix all errors");
            return;
          }

          const dataToSend = {
            formData: state.form,
            selectedCommodityType: selectedCommodity,
            selectedFarmer: selectedFarmer,
            Farmerdistribution: selectedFarmerId,
            selectedVariety: selectedVariety,
            selectedCenterTarget: selectedCenterTarget,
            seeds: state.form.seeds,
            Area: state.form.Area,
            Year: state.form.Year,
            selectedLandId: selectedLandId,
            Certificate: state.form.CertificateNo || "",
            Survey: state.form.SurveyNo || "",
          };

          console.log("🚀 Data sent via Context:", dataToSend);
          setFormData(dataToSend);
          navigation.navigate("Agreement" as never);
        }}
      >
        Next
      </Button>
    </KeyboardAwareScrollView>
  );
};

export default AgreementForm;

// Styles remain the same as previous implementation
const styles = StyleSheet.create({
  // ... your existing styles
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
   landLabel: {
    fontWeight: "600",
    color: "#2E7D32",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#E8F5E8",
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#455A64",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    marginBottom: 4,
    backgroundColor: "white",
    height: 50,
    fontSize: 14,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 30,
    paddingVertical: 4,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    elevation: 4,
  },
  submitButtonContent: {
    paddingVertical: 2,
  },
  farmerCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  landCard: {
    marginVertical: 8,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedLandCard: {
    borderColor: "#1976D2",
    backgroundColor: "#E3F2FD",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  headerDivider: {
    marginVertical: 8,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    marginVertical: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  rowDivider: {
    backgroundColor: '#E0E0E0',
    height: 1,
    marginVertical: 2,
  },
  noFarmerSelected: {
    marginTop: 16,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
});