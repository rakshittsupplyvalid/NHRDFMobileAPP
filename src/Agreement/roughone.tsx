


import React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TextInput, Modal } from "react-native";
import { BackHandler } from 'react-native';
import { Button, Text, Card, Checkbox, Divider, HelperText } from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import CommonPicker from "../CommonComponent/CommonDropdown";
import { produceseeds, Seeds } from "../Constants/constants";
import useForm from "../Form/UseForm";
import YearPickerInput from "../CommonComponent/CommonYearPicker";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from "@react-navigation/native";
import { fetchCommodityTypes, fetchCommodity, fetchVariety, farmer, farmerDetails, getFarmerLandDetail, fetchSeedOptions } from "../Service/fetchCommodity";
import axios from 'axios';
import { useFormData } from "../Constants/FormContext";
import { TouchableOpacity } from "react-native";
import apiClient from "../Service/apiInterceptors";
import { ScrollView } from "react-native";

const AgreementForm: React.FC = () => {
  const { state, updateState } = useForm();
  interface AadharFields {
    VarietyId: string;
    CommodityId: string;
    CenterTargetId: string;
    Area: string;
    LotNumber: string;
    TagNumber: string;
    BillNumber: string;
    distributiontype: string;
    DistrubutedFarnerId: string;
    Cropclass: string;
  }

  const [aadharExtraFields, setAadharExtraFields] = useState<AadharFields>({
    VarietyId: '',
    CommodityId: '',
    CenterTargetId: '',
    Area: '',
    LotNumber: '',
    TagNumber: '',
    BillNumber: '',
    distributiontype: '',
    DistrubutedFarnerId: '',
    Cropclass: ''

  });


  const [aadharNumber, setAadharNumber] = useState<string>("");
  const [commodityTypes, setCommodityTypes] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [Variety, setVariety] = useState([])
  const [selectedVariety, setSelectedVariety] = useState('');
  const [aadharData, setAadharData] = useState<any[]>([]);

  const [selectedCommodityType, setSelectedCommodityType] = useState<string>('');
  const [Commodity, setCommodity] = useState<any[]>([]);
  const [commodities, setCommodities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);


  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("");
  const [selectedCenterTarget, setSelectedCenterTargetId] = useState<string>("");
  const [farmersList, setFarmersList] = useState<any[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null);
  const [seedOptions, setSeedOptions] = useState<any[]>([]);
  const [farmerLandList, setFarmerLandList] = useState<any[]>([]);
  const [selectedLandId, setSelectedLandId] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [focusedFields, setFocusedFields] = useState<{ [key: string]: boolean }>({});
  const [checked, setChecked] = useState(false);


  const [seasonData, setSeasonData] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [subSeasonList, setSubSeasonList] = useState<any[]>([]);
  const [selectedSubSeason, setSelectedSubSeason] = useState<string>("");
  const [loading, setLoading] = useState(false);


  const { setFormData } = useFormData();
  const navigation = useNavigation<any>();



  const validateField = (field: string, value: any): string => {
    let error = '';

    switch (field) {

      case 'selectedLandId':
        if (!value || value.toString().trim() === '') {
          error = 'Please select at least one land';
        }
        break;

      case 'Year':
        if (!value || value.toString().trim() === '') {
          error = 'Duration Year is required';
        }
        break;

      default:
        break;
    }

    return error;
  };



  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    newErrors.selectedLandId = validateField('selectedLandId', selectedLandId);
    newErrors.Year = validateField('Year', state.form.Year);
    newErrors.seeds = validateField('seeds', state.form.seeds);

    setErrors(newErrors);

    const allFields = [
      'CertificateNo',
      'SurveyNo',
      'selectedLandId',
      'Year',
      'seeds'
    ];

    const newTouched: { [key: string]: boolean } = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    return Object.values(newErrors).every(error => error === '');
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
      const items = await fetchCommodity(selectedCommodityType);
      setCommodities(items);
    })();
  }, [selectedCommodityType]);


  useEffect(() => {
    if (!selectedCommodity) return;
    (async () => {
      const items = await fetchVariety(selectedCommodity);
      setVariety(items);
    })();
  }, [selectedCommodity]);


  useEffect(() => {
    fetchSeasonData();
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







  const fetchAadharData = async (aadhar: string, commodity?: string) => {
    console.log("commodity", commodity);
    if (!aadhar || aadhar.length !== 12) return;

    try {
      const encodedCommodity = encodeURIComponent(commodity || state.form.seeds || "");

      const res = await apiClient.get(
        `/api/mobile/farmer/distribution/list?CommodityName=${encodedCommodity}&AadharNo=${aadhar}&ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED`
      );




      if (res.data && res.data.length > 0) {
        setAadharData(res.data);
        console.log("✅ Farmers Found:", res.data);

        // ✅ Auto-select if only one farmer
        if (res.data.length === 1) {
          setSelectedFarmer(res.data[0]);
          setSelectedFarmerId(res.data[0].farmerid);
          handleFieldChange("farmername", res.data[0].farmername);
          handleFieldChange("commodity", res.data[0].commodityname);
          handleFieldChange("variety", res.data[0].varietyname);
        }
      } else {
        setAadharData([]);
        setSelectedFarmer(null);
      }
    } catch (error) {
      console.error("Aadhar API Error:", error);
      setAadharData([]);
      setSelectedFarmer(null);
    }
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
    } else if (field === 'selectedVariety') {
      setSelectedVariety(value);
      const selectedItem = farmersList.find(item => item.value === value);
      if (selectedItem) {

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





  useEffect(() => {
    if (!selectedFarmerId) return;

    (async () => {
      const details = await farmerDetails(selectedFarmerId);
      const info = details.length > 0 ? details[0] : null;
      const landDetails = await getFarmerLandDetail(selectedFarmerId);

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
  }, [selectedFarmerId]);




  type MCIIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];



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



          <Text style={styles.label}>Aadhar Number *</Text>

          <TextInput
            placeholder="Enter Aadhar Number"
            value={state.form.AadharNumber || ""}
            onChangeText={(value) => {
              handleFieldChange("AadharNumber", value);

              // Only fetch if Aadhar is 12 digits AND commodity is selected
              if (value.length === 12 && state.form.seeds) {
                fetchAadharData(value, state.form.seeds);
              } else {
                setAadharData([]); // clear if invalid
              }
            }}
            style={[styles.simpleInput, shouldShowError("AadharNumber") && styles.inputError]}
            keyboardType="number-pad"
            maxLength={12}
          />

          <Text style={styles.label}>Commodity Type </Text>
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

          <Text style={styles.label}>Commodity </Text>
          <CommonPicker
            selectedValue={selectedCommodity}
            onValueChange={(value) => handleFieldChange('selectedCommodity', value)}
            onFocus={() => handlePickerFocus('selectedCommodity')}
            onBlur={() => handlePickerBlur('selectedCommodity')}
            items={commodities}
            isFocused={focusedFields.selectedCommodity}
          />


          <Text style={styles.label}>Variety </Text>
          <CommonPicker
            selectedValue={selectedVariety}
            onValueChange={(value) => handleFieldChange('selectedVariety', value)}
            onFocus={() => handlePickerFocus('selectedVariety')}
            onBlur={() => handlePickerBlur('selectedVariety')}
            items={Variety}
            isFocused={focusedFields.selectedCommodity}
          />


          <Text style={styles.label}>Year </Text>
          <CommonPicker
            selectedValue={selectedSeason}
            onValueChange={(value) => handleSeasonSelect(value)}
            onFocus={() => handlePickerFocus("selectedSeason")}
            onBlur={() => handlePickerBlur("selectedSeason")}
            items={seasonData}
            isFocused={focusedFields.selectedSeason}
          />
          <HelperText type="error" visible={shouldShowError("selectedSeason")}>
            {errors.selectedSeason}
          </HelperText>

          <Text style={styles.label}>Season </Text>
          <CommonPicker
            selectedValue={selectedSubSeason}
            onValueChange={(value) => {
              setSelectedSubSeason(value);
              handleFieldChange("selectedSubSeason", value);
            }}
            onFocus={() => handlePickerFocus("selectedSubSeason")}
            onBlur={() => handlePickerBlur("selectedSubSeason")}
            items={subSeasonList}
            isFocused={focusedFields.selectedSubSeason}
          />
          <HelperText type="error" visible={shouldShowError("selectedSubSeason")}>
            {errors.selectedSubSeason}
          </HelperText>









          {/*  */}
        </Card.Content>
      </Card>


      <Card style={styles.farmerCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Farmer Details</Text>
          <Divider style={styles.headerDivider} />

          {selectedFarmer ? (
            <>
              {/* Farmer Name */}
              <View style={styles.detailRow}>
                <View style={styles.labelContainer}>
                  <MaterialCommunityIcons
                    name="account"
                    size={20}
                    color="#4CAF50"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.detailLabel}>Farmer Name:</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailValue}>{selectedFarmer.farmername}</Text>
                </View>
              </View>
              <Divider style={styles.rowDivider} />

              {/* Commodity */}
              <View style={styles.detailRow}>
                <View style={styles.labelContainer}>
                  <MaterialCommunityIcons
                    name="seed"
                    size={20}
                    color="#4CAF50"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.detailLabel}>Commodity:</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailValue}>{selectedFarmer.commodityname}</Text>
                </View>
              </View>
              <Divider style={styles.rowDivider} />


              <View style={styles.detailRow}>
                <View style={styles.labelContainer}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={20}
                    color="#4CAF50"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.detailLabel}>Crop Class</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailValue}>{selectedFarmer.cropclass}</Text>
                </View>
              </View>
              <Divider style={styles.rowDivider} />

              {/* Variety */}
              <View style={styles.detailRow}>
                <View style={styles.labelContainer}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={20}
                    color="#4CAF50"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.detailLabel}>Variety:</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailValue}>{selectedFarmer.varietyname}</Text>
                </View>
              </View>
              <Divider style={styles.rowDivider} />

              {/* Relation */}
              <View style={styles.detailRow}>
                <View style={styles.labelContainer}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={20}
                    color="#4CAF50"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.detailLabel}>Relation:</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailValue}>
                    {selectedFarmer.relation} of {selectedFarmer.relative}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={{ color: "#555", textAlign: "center", marginTop: 10 }}>
              No farmer selected or data available
            </Text>
          )}

          {/* ✅ Button to open modal */}
          {selectedFarmer && (
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
                View More Details
              </Text>
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Farmer Full Details</Text>

            {selectedFarmer ? (
              <ScrollView style={{ maxHeight: 400 }}>
                {/* Each detail row */}
                {[
                  { label: "Name", value: selectedFarmer.farmername, icon: "account" },
                  { label: "Relation", value: `${selectedFarmer.relation} of ${selectedFarmer.relative}`, icon: "account-group" },
                  { label: "Commodity", value: selectedFarmer.commodityname, icon: "seed" },
                  { label: "Variety", value: selectedFarmer.varietyname, icon: "leaf" },
                  { label: "Bill Amount", value: selectedFarmer.billamount, icon: "currency-inr" },
                  { label: "Lot No", value: selectedFarmer.lotno, icon: "numeric" },
                  { label: "Supply Qty", value: selectedFarmer.supplyqty, icon: "cube-outline" },
                  { label: "Rate", value: selectedFarmer.rate, icon: "cash" },
                  { label: "Sowing Date", value: selectedFarmer.sowingdate, icon: "calendar" },

                ].map((item, index) => (
                  <View key={index} style={styles.modalRow}>
                    <MaterialCommunityIcons
                      name={item.icon as MCIIconName}
                      size={20}
                      color="#4CAF50"
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.modalLabel}>{item.label}:</Text>
                    <Text style={styles.modalValue}>{item.value || "-"}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={{ textAlign: "center", color: "#555" }}>No farmer selected</Text>
            )}

            <TouchableOpacity
              style={[styles.modalButton, { marginTop: 20 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>




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
                        <Text style={styles.detailLabel}>Land Number</Text>
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
          <Text style={styles.sectionTitle}>Contract Terms</Text>

          <Text style={styles.label}>Duration Year *</Text>
          <YearPickerInput
            value={state.form.Year}
            onChange={(year) => handleFieldChange('Year', year)}
          />
          <HelperText type="error" visible={shouldShowError('Year')}>
            {errors.Year}
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
            // formData: state.form,

            seeds: selectedFarmer.cropclass,
            DistributedFarmerid: aadharExtraFields.DistrubutedFarnerId,
            Farmerid: selectedFarmerId,
            selectedCenterTarget: selectedCenterTarget,
            selectedLandId: selectedLandId,
            Certificate: state.form.CertificateNo || "",
            Survey: state.form.SurveyNo || "",
            VarietyId: aadharExtraFields.VarietyId,
            CommodityId: aadharExtraFields.CommodityId,
            CenterTargetId: aadharExtraFields.CenterTargetId,
            AreaFromAadhar: aadharExtraFields.Area,
            LotNumber: aadharExtraFields.LotNumber,
            TagNumber: aadharExtraFields.TagNumber,
            BillNumber: aadharExtraFields.BillNumber,
            distributiontype: aadharExtraFields.distributiontype,
            Year: state.form.Year

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

const styles = StyleSheet.create({
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
  // Simple TextInput styles
  simpleInput: {
    marginBottom: 4,
    fontSize: 14,
    height: 38,
    borderWidth: 1,
    borderColor: '#a6a8acff',

    borderRadius: 10,   // ✅ Add this line
    paddingHorizontal: 17,
    backgroundColor: '#FFFFFF'
  },
  inputError: {
    borderColor: "#f44336",
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
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    marginVertical: 4
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 140, // ✅ Fixed width for labels
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
    flexShrink: 1,
    flexWrap: "wrap",
  },
  farmerBox: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
  },
  selectedFarmerBox: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalLabel: {
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  modalValue: {
    color: "#555",
    flex: 1,
    textAlign: "right",
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
  },
});





      
