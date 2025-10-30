import React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { BackHandler } from 'react-native';
import { TextInput, Button, Text, Card, Checkbox, Divider } from "react-native-paper";
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
  const [selectedVariety, setSelectedVariety] = useState("");  // varietyId
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [commodityTypes, setCommodityTypes] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [selectedCommodityType, setSelectedCommodityType] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  const [selectedCenterTarget, setSelectedCenterTargetId] = useState(""); // 👈 ye new state hai
  const [farmersList, setFarmersList] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [seedOptions, setSeedOptions] = useState([]);
  const [farmerLandList, setFarmerLandList] = useState<any[]>([]);
  const [selectedLandId, setSelectedLandId] = useState<string | null>(null);


  const [checked, setChecked] = useState(false);

  const { setFormData } = useFormData();

  const navigation = useNavigation<any>();




  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Dashboard" as never);
        return true; // prevent default behavior
      };

      // ✅ Add the event listener
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      // ✅ Clean up correctly
      return () => subscription.remove();
    }, [navigation])
  );

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

  const landdetails = [
    { label: 'Land Number', value: state.form.landNumber, icon: 'numeric' },
    { label: 'Sub Number', value: state.form.landSubNumber, icon: 'numeric' },
    { label: 'Total Area', value: `${state.form.landTotalArea} ${state.form.landUnit}`, icon: 'square-outline' },
    { label: 'Sowing Area', value: state.form.landSowingArea, icon: 'nature' },
    { label: 'Village', value: state.form.landVillage, icon: 'home-city' },
    { label: 'State', value: state.form.landState, icon: 'map-marker' },
    { label: 'District', value: state.form.landDistrict, icon: 'map-marker-radius' },
    { label: 'Sub-District', value: state.form.landSubDistrict, icon: 'map-outline' },
    {
      label: 'Approval Status',
      value: state.form.landApprovalStatus,
      icon: state.form.landApprovalStatus === 'PENDING'
        ? 'hourglass-empty'
        : state.form.landApprovalStatus === 'APPROVED'
          ? 'check-circle'
          : 'cancel'
    },
  ];

  const [isFocused, setIsFocused] = useState({
    produceseeds: false,
    agreementType: false,
    duration: false,
    FarmerName: false,
  });

  useEffect(() => {
    (async () => {
      const data = await fetchCommodityTypes();
      setCommodityTypes(data);
      console.log("Fetched Commodity Types:", data);
    })();
  }, []);

  useEffect(() => {
    if (!selectedCommodityType) return;
    (async () => {
      const items = await fetchCommoditiesByType(selectedCommodityType);
      setCommodities(items);
      console.log("commodities", items);
    })();
  }, [selectedCommodityType]);

  useEffect(() => {
    if (!selectedCommodity) {
      setFarmersList([]);
      setSelectedFarmer('');
      setFarmerLandList([]);
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
      console.log("🧑‍🌾 Selected Farmer ID:", selectedFarmer);

      const details = await farmerDetails(selectedFarmer);
      const info = details.length > 0 ? details[0] : null;

      const landDetails = await getFarmerLandDetail(selectedFarmer);
      console.log("🌾 All Farmer Land Details:", landDetails);



      // ✅ Update main form state
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

      // ✅ Update both list and selected land ID
      setFarmerLandList(landDetails || []);
    

      console.log("✅ State updated with farmer + land details");
    })();
  }, [selectedFarmer]);



  useEffect(() => {
    axios
      .get('https://stage-master-backend.epravaha.com/api/State/GetAllStates')
      .then(res => {
        const mappedStates = res.data.map(item => ({
          label: item.name,
          value: item.stateCode?.toString(),
        }));
        setStatesList(mappedStates);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (state.form.state) {
      axios
        .get(
          `https://stage-master-backend.epravaha.com/api/District/GetDistrictsByStateCode/${state.form.state}`
        )
        .then(res => {
          const mappedDistricts = res.data.map(item => ({
            label: item.name,
            value: item.districtCode?.toString(),
          }));
          setDistrictsList(mappedDistricts);
        })
        .catch(err => console.error(err));
    } else {
      setDistrictsList([]);
    }
  }, [state.form.state]);



  useEffect(() => {
    (async () => {
      const data = await fetchSeedOptions();
      setSeedOptions(data);
      console.log("Fetched Commodity Types:", data);
    })();
  }, []);






  const isFarmerSelected = !!selectedFarmer;

  const handleFocus = (field: string) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };


  const validateForm = () => {
    if (!selectedCommodityType) {
      alert("Please select a Commodity Type");
      return false;
    }
    if (!selectedCommodity) {
      alert("Please select a Commodity");
      return false;
    }
    if (!selectedFarmer) {
      alert("Please select a Farmer");
      return false;
    }
    if (!state.form.produceseeds) {
      alert("Please select Produce Seeds");
      return false;
    }
    if (!selectedLandId) {
      alert("Please select at least one Land");
      return false;
    }



    if (!state.form.seeds) {
      alert("Please select Seeds");
      return false;
    }
    if (!selectedDate) {
      alert("Please select Duration From date");
      return false;
    }

    // ✅ Area validation
    const areaValue = Number(state.form.Area);
    if (!areaValue || areaValue <= 0) {
      alert("Please enter a valid Area (in acres)");
      return false;
    }
    if (areaValue > 1000000) {
      alert("Maximum Area allowed is 10,00,000 acres");
      return false;
    }

    return true;
  };


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
          <CommonPicker
            label="Commodity Type"
            selectedValue={selectedCommodityType}
            onValueChange={(value) => {
              setSelectedCommodityType(value);
              console.log("commodity id", value);
              setSelectedCommodity('');
            }}
            items={commodityTypes}
          />

          <CommonPicker
            label="Commodity"
            selectedValue={selectedCommodity}
            onValueChange={(value) => setSelectedCommodity(value)}
            items={commodities}
          />

          {/* {selectedCommodity === "CMM2025091506361750433849034" && (
            <View style={styles.infoContainer}>
              <Text style={styles.subTitle}>Onion Information</Text>
              <Text style={styles.description}>
                • Onion is one of the most important commercial vegetable crops grown in Indias.
              </Text>
            </View>
          )} */}

          <CommonPicker
            label="Farmer"
            selectedValue={selectedFarmer}
            onValueChange={(value) => {
              setSelectedFarmer(value); // ✅ farmerId store ho gaya
              const selectedItem = farmersList.find(item => item.value === value);
              if (selectedItem) {
                setSelectedVariety(selectedItem.varietyId); // ✅ varietyId store
                console.log("✅ Selected Variety ID:", selectedItem.varietyId);
                setSelectedFarmerId(selectedItem.Id);       // ✅ id bhi store ho gaya
                setSelectedCenterTargetId(selectedItem.centertargetid);
              }
            }}
            items={farmersList}
          />


          {/* Certificate No */}
            <Text style={styles.label}>Certificate No</Text>
          <TextInput
            label="Certificate No"
            mode="outlined"
            placeholder="Enter certificate number"
            value={state.form.CertificateNo || ""} // ✅ empty string if not filled
            onChangeText={(value) =>
              updateState({
                ...state,
                form: { ...state.form, CertificateNo: value },
              })
            }
            style={[styles.input, { backgroundColor: "white" }]}
            maxLength={10}
          />

          {/* Survey No */}
           <Text style={styles.label}>Survey No</Text>
          <TextInput
            label="Survey No"
            mode="outlined"
            placeholder="Enter survey number"
            value={state.form.SurveyNo || ""} // ✅ empty string if not filled
            onChangeText={(value) =>
              updateState({
                ...state,
                form: { ...state.form, SurveyNo: value },
              })
            }
            style={[styles.input, { backgroundColor: "white" }]}
            maxLength={10}
          />



        </Card.Content>
      </Card>

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
            <Text variant="bodySmall" style={styles.noFarmerSelected}>No farmer selected</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.farmerCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Farmer Land Details</Text>
          <Divider style={styles.headerDivider} />

          {farmerLandList.length > 0 ? (
            farmerLandList.map((land, index) => (
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
                    onPress={() =>
                      setSelectedLandId(land.id === selectedLandId ? null : land.id)
                    }
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
            ))
          ) : (
            <Text style={styles.noFarmerSelected}>No land details available</Text>
          )}
        </Card.Content>
      </Card>


      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Seed Production Details</Text>
          <Text style={styles.label}>Produce Seeds</Text>
          <CommonPicker
            selectedValue={state.form.produceseeds || ""}
            onValueChange={value => {
              console.log("✅ Selected Produce Seeds:", value); // 👈 yeh aapko selected value dikhayega
              updateState({ ...state, form: { ...state.form, produceseeds: value } });
            }}
            items={produceseeds}
            isFocused={isFocused.produceseeds}
            onFocus={() => handleFocus("produceseeds")}
            onBlur={() => handleBlur("produceseeds")}
          />

          <Text style={styles.label}>Seeds</Text>
          <CommonPicker
            selectedValue={state.form.seeds || ""}
            onValueChange={(value) => {
              console.log("Selected seed name:", value); // 👈 yeh print karega selected name

              updateState({
                ...state,
                form: { ...state.form, seeds: value }, // 👈 backend pe name save hoga
              });
            }}
            items={seedOptions}
          />

        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Contract Terms</Text>

          {/* Duration Year */}
          <YearPickerInput
            value={state.form.Year}
            onChange={(year) =>
              updateState({ ...state, form: { ...state.form, Year: year } })
            }
          />


          {/* Area in Acres */}
          <TextInput
            label="Area (in hectares)"
            mode="outlined"
            placeholder="Enter area in "
            value={state.form.Area || ""}
            maxLength={8}
            keyboardType="numeric"
            left={<TextInput.Icon icon="arrow-expand" />}
            onChangeText={(value) =>
              updateState({ ...state, form: { ...state.form, Area: value } })
            }
            style={[styles.input, { backgroundColor: 'white' }]}
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
        onPress={() => {
          // if (!validateForm()) {
          //   console.log("❌ Validation failed — please fill all required fields");
          //   return;
          // }

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
            selectedLandId: selectedLandId, // ✅ land id added dynamically
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

// styles remain the same as your original code

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  headerCard: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    elevation: 6, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    overflow: "hidden",
  },
  headerContent: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#E0F2F1",
    lineHeight: 20,
  },



  rowone: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // checkbox left, text right
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  labelone: {
    fontSize: 16,
    fontWeight: "500",
  },
  landLabel: {
    fontWeight: "600",
    color: "#2E7D32",
    fontSize: 14,
  },

  pending: {
    color: "#FFA000",
    fontWeight: "700",
  },
  approved: {
    color: "#388E3C",
    fontWeight: "700",
  },
  rejected: {
    color: "#D32F2F",
    fontWeight: "700",
  },
  noLandText: {
    textAlign: "center",
    color: "#9E9E9E",
    marginTop: 10,
    fontStyle: "italic",
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "white",
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
    fontWeight: "400",
  color: "#455A64",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
    height: 38,
    fontSize: 14,
    paddingHorizontal: 10,
    borderRadius: 30
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  halfInput: {
    width: "48%",
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 30,
    paddingVertical: 4,  // kam kar diya
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    elevation: 4,
  },
  submitButtonContent: {
    paddingVertical: 2, // aur bhi kam
  },
  infoContainer: {
    marginTop: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#70B04F",
  },

  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007BFF",
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    textAlign: "justify",
  },
  // farmerCard: {
  //   margin: 16,
  //   borderRadius: 16,
  //   elevation: 6,
  //   backgroundColor: 'red',
  //   shadowColor: '#000',
  //   shadowOpacity: 0.1,
  //   shadowRadius: 10,
  // },


  farmerCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cardHeader: {
    fontWeight: '700',
    marginBottom: 10,
    color: '#70B04',
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
  iconStyle: {
    fontFamily: 'MaterialIcons', // Paper icons
    fontSize: 20,
    color: '#F79B00',
    marginRight: 6,
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