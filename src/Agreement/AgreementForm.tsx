import React from "react";
import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { TextInput, Button, Text, Card, Checkbox, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import CommonPicker from "../CommonComponent/CommonDropdown";
import { produceseeds, Seeds } from "../Constants/constants";
import useForm from "../Form/UseForm";
import CustomDateTimePicker from '../CommonComponent/DateTimePicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from "@react-navigation/native";
import { fetchCommodityTypes, fetchCommoditiesByType, farmer, farmerDetails, getFarmerLandDetail , fetchSeedOptions } from "../Service/fetchCommodity";
import axios from 'axios';

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

  const [checked, setChecked] = useState(false);

  const navigation = useNavigation<any>();

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
      const land = landDetails && landDetails.length > 0 ? landDetails[0] : null;

      console.log("Selected Farmer:", selectedFarmer);
      console.log("Farmer Details:", info);
      console.log("Land Details:", land);

      updateState({
        ...state,
        form: {
          ...state.form,
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
          landTotalArea: land?.totalarea?.toString() || "",
          landUnit: land?.unit || "",
          landSowingArea: land?.sowingarea?.toString() || "",
          landNumber: land?.number?.toString() || "",
          landSubNumber: land?.subnumber?.toString() || "",
          landDocument: land?.document || "",
          landVillage: land?.village || "",
          landState: land?.statename || "",
          landDistrict: land?.districtname || "",
          landSubDistrict: land?.subdistrictname || "",
          landApprovalStatus: land?.approvalstatus || "",
        },
      });
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

  const handleSubmit = () => {
    console.log("Form Data:", state.form);
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
              console.log("commodity id" , value);
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

          {selectedCommodity === "CMM2025091506361750433849034" && (
            <View style={styles.infoContainer}>
              <Text style={styles.subTitle}>Onion Information</Text>
              <Text style={styles.description}>
                • Onion is one of the most important commercial vegetable crops grown in Indias.
              </Text>
            </View>
          )}

           <CommonPicker
  label="Farmer"
  selectedValue={selectedFarmer}
  onValueChange={(value) => {
    setSelectedFarmer(value); // ✅ farmerId store ho gaya
    const selectedItem = farmersList.find(item => item.value === value);
    if (selectedItem) {
      setSelectedVariety(selectedItem.varietyId); // ✅ varietyId store
      setSelectedFarmerId(selectedItem.Id);       // ✅ id bhi store ho gaya
      setSelectedCenterTargetId(selectedItem.centertargetid);
    }
  }}
  items={farmersList}
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
          <Text  style={styles.sectionTitle}>Farmer Land Details</Text>
          <Divider style={styles.headerDivider} />

          <View style={styles.rowone}>
            <Checkbox
              status={checked ? "checked" : "unchecked"}
              onPress={() => setChecked(!checked)}
            />
            <Text style={styles.labelone}>Select Farmerlist</Text>
          </View>

          {state.form.landNumber ? (
            <View style={styles.detailsContainer}>
              {landdetails.map((item, index) => (
                <View key={index}>
                  <View style={styles.detailRow}>
                    <View style={styles.labelContainer}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={20}
                        color={item.label === 'Approval Status' ? (
                          item.value === 'PENDING' ? '#FFC107' :
                          item.value === 'APPROVED' ? '#4CAF50' : '#F44336'
                        ) : '#4CAF50'}
                        style={{ marginRight: 8 }}
                      />
                      <Text variant="bodyMedium" style={styles.detailLabel}>{item.label}:</Text>
                    </View>
                    <Text variant="bodyMedium" style={styles.detailValue}>
                      {item.value?.toString() || '-'}
                    </Text>
                  </View>
                  {index < landdetails.length - 1 && <Divider style={styles.rowDivider} />}
                </View>
              ))}
            </View>
          ) : (
            <Text variant="bodySmall" style={styles.noFarmerSelected}>No land details available</Text>
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
  onValueChange={value =>
    updateState({ ...state, form: { ...state.form, seeds: value } })
  }
  items={seedOptions}
/>

        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Contract Terms</Text>
          <Text style={styles.label}>Duration From</Text>
          <CustomDateTimePicker
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            mode="date"
          />

          <TextInput
            label="Area (in acres)"
            value={state.form.Area || ""}
            keyboardType="numeric"
            mode="outlined"
            left={<TextInput.Icon icon="arrow-expand" />}
            onChangeText={value =>
              updateState({ ...state, form: { ...state.form, Area: value } })
            }
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
        onPress={() => navigation.navigate("Agreement" as never, { 
          formData: state.form,
            selectedCommodityType: selectedCommodity,
            selectedFarmer : selectedFarmer,
            Farmerdistribution : selectedFarmerId,
            selectedVariety : selectedVariety,
            selectedCenterTarget : selectedCenterTarget
         })}
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
    fontWeight: "600",
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