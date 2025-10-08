import React from "react";
import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, Card, Checkbox } from "react-native-paper";
import CommonPicker from "../CommonComponent/CommonDropdown";
import { produceseeds, Seeds } from "../Constants/constants";
import useForm from "../Form/UseForm";
import CustomDateTimePicker from '../CommonComponent/DateTimePicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from "@react-navigation/native";
import { fetchCommodityTypes, fetchCommoditiesByType, farmer, farmerDetails, getFarmerLandDetail } from "../Service/fetchCommodity";
import axios from 'axios';


const AgreementForm: React.FC = () => {
  const { state, updateState } = useForm();
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [commodityTypes, setCommodityTypes] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [selectedCommodityType, setSelectedCommodityType] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [farmersList, setFarmersList] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [checked, setChecked] = useState(false);



  const navigation = useNavigation<any>();


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
      console.log("comiddites", items);
    })();
  }, [selectedCommodityType]);


  useEffect(() => {
    if (!selectedCommodity) {
      setFarmersList([]);
      setSelectedFarmer(null);
      return;
    }

    (async () => {
      const items = await farmer(selectedCommodity);
      setFarmersList(items);

    })();
  }, [selectedCommodity]);


  //     useEffect(() => {
  //     if (!selectedFarmer) return;

  //     (async () => {
  //         const details = await farmerDetails(selectedFarmer);
  //         if (details.length > 0) {
  //             const info = details[0]; // API single object return

  //             // Populate form fields
  //             updateState({
  //                 ...state,
  //                 form: {
  //                     ...state.form,
  //                     name: info.name || "",
  //                     age: info.age?.toString() || "",
  //                     occupation: info.occupation || "",
  //                     relation : info.relation || "",
  //                     relativename : info.relativename || "",
  //                     statename : info.statename || "",
  //                     villagename : info.villagename || "",
  //                     village: info.village || "",
  //                     post: info.post || "",
  //                     taluka: info.taluka || "",
  //                     dist: info.district || "",
  //                      gender: info.gender || "",
  //                     state: info.state || "",
  //                     pincode: info.pincode?.toString() || "",
  //                     phone: info.phone || "",
  //                     mobile: info.mobile || "",
  //                 },
  //             });
  //         }
  //     })();
  // }, [selectedFarmer]);




  useEffect(() => {
    if (!selectedFarmer) return;

    (async () => {
      // Farmer personal details
      const details = await farmerDetails(selectedFarmer);
      const info = details.length > 0 ? details[0] : null;

      // Farmer land details
      const landDetails = await getFarmerLandDetail(selectedFarmer);
      const land = landDetails && landDetails.length > 0 ? landDetails[0] : null;

      console.log("Selected Farmer:", selectedFarmer);
      console.log("Farmer Details:", info);
      console.log("Land Details:", land); // ✅ yahan land ka data milega

      // Update form state
      updateState({
        ...state,
        form: {
          ...state.form,
          // Farmer Info
          name: info?.name || "",
          // age: info?.age?.dateofbirth || "",
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

          // Land Info
          landTotalArea: land?.totalarea || "",
          landUnit: land?.unit || "",
          landSowingArea: land?.sowingarea?.toString() || "",
          landNumber: land?.number || "",
          landSubNumber: land?.subnumber || "",
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
          value: item.stateCode, // integer
        }));
        setStatesList(mappedStates);
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (state.form.state) {
      axios
        .get(
          `https://stage-master-backend.epravaha.com/api/District/GetDistrictsByStateCode/${state.form.state}`
        )
        .then(res => {
          const mappedDistricts = res.data.map(item => ({
            label: item.name,
            value: item.districtCode, // store districtCode
          }));
          setDistrictsList(mappedDistricts);
        })
        .catch(err => console.error(err));
    } else {
      setDistrictsList([]);
    }
  }, [state.form.state]);



  // const isFarmerSelected = state.form.duration === "FarmerName1" || state.form.duration === "FarmerName2" || state.form.duration === "FarmerName3" || state.form.duration === "FarmerName4";
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
      {/* Header Section */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.title}>Seed Production Agreement Form</Text>
          <Text style={styles.subtitle}>Fill in the details to create a new agreement</Text>
        </Card.Content>
      </Card>

      {/* Agreement Details Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>



          <CommonPicker
            label="Commodity Type"
            selectedValue={selectedCommodityType}
            onValueChange={(value) => {
              setSelectedCommodityType(value);

              setSelectedCommodity(''); // reset commodity
            }}
            items={commodityTypes}
          />



          <CommonPicker
            label="Commodity"
            selectedValue={selectedCommodity}
            onValueChange={(value) => {
              setSelectedCommodity(value)
              console.log("Selected Commodity first value:", value);
            }}
            items={commodities}
          />



          {selectedCommodity === "CMM2025091506361750433849034" && (
            <View style={styles.infoContainer}>
              <Text style={styles.subTitle}>Onion Information</Text>
              <Text style={styles.description}>
                • Onion is one of the most important commercial vegetable crops grown in India.{"\n"}
                • It is rich in vitamins and antioxidants.{"\n"}
                • Well-drained, fertile soils are ideal for good bulb formation.{"\n"}
                • Major onion producing states include Maharashtra, Karnataka, and Gujarat.
              </Text>
            </View>
          )}

        <CommonPicker
  label="Farmer"
  selectedValue={selectedFarmer}
  onValueChange={(value) => {
    setSelectedFarmer(value);
    console.log("Selected Farmer ID:", value);
  }}
  items={farmersList}   // 👈 yahan API se aaya hua dropdownData pass hoga
/>



        </Card.Content>
      </Card>



      <Card style={styles.landCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Farmer Information</Text>


          <View style={styles.rowone}>
            <Checkbox
              status={checked ? "checked" : "unchecked"}
              onPress={() => setChecked(!checked)}
            />
            <Text style={styles.labelone}>Select Farmerlist</Text>
          </View>


          {selectedFarmer ? (
            <View style={styles.landContainer}>
              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Full Name:</Text>
                <Text style={styles.landValue}>{state.form.name || '-'}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Age:</Text>
                <Text style={styles.landValue}>25</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Gender:</Text>
                <Text style={styles.landValue}>{state.form.gender || '-'}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Relation:</Text>
                <Text style={styles.landValue}>{state.form.relation || '-'}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Relative Name:</Text>
                <Text style={styles.landValue}>{state.form.relativename || '-'}</Text>
              </View>

              {/* <View style={styles.landRow}>
          <Text style={styles.landLabel}>Occupation:</Text>
          <Text style={styles.landValue}>{state.form.occupation || '-'}</Text>
        </View> */}

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Village:</Text>
                <Text style={styles.landValue}>{state.form.villagename || '-'}</Text>
              </View>

              {/* <View style={styles.landRow}>
          <Text style={styles.landLabel}>Post:</Text>
          <Text style={styles.landValue}>{state.form.post || '-'}</Text>
        </View> */}

              {/* <View style={styles.landRow}>
          <Text style={styles.landLabel}>Taluka:</Text>
          <Text style={styles.landValue}>{state.form.taluka || '-'}</Text>
        </View> */}

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>District:</Text>
                <Text style={styles.landValue}>{state.form.districtname || '-'}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>State:</Text>
                <Text style={styles.landValue}>{state.form.statename || '-'}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Pincode:</Text>
                <Text style={styles.landValue}>{state.form.pincode || '-'}</Text>
              </View>

              {/* <View style={styles.landRow}>
          <Text style={styles.landLabel}>Phone (with STD code):</Text>
          <Text style={styles.landValue}>{state.form.phone || '-'}</Text>
        </View> */}

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Mobile Number:</Text>
                <Text style={styles.landValue}>{state.form.mobile || '-'}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noLandText}>No farmer selected</Text>
          )}
        </Card.Content>
      </Card>



      {/* Location Details Section */}
      {/* <Card style={styles.sectionCard}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Production Location</Text>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <TextInput
                                label="Village"
                                value={state.form.villagename || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="home" />}
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form,   villagename: value } })
                                }
                                style={styles.input}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <TextInput
                                label="Post Office"
                                value={state.form.PostOffice || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="office-building" />}
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, PostOffice: value } })
                                }
                                style={styles.input}
                            />
                        </View>

                        </View>




                    <TextInput
                        label="Taluka"
                        value={state.form.Taluka || ""}
                        mode="outlined"
                        left={<TextInput.Icon icon="map-marker" />}
                        onChangeText={value =>
                            updateState({ ...state, form: { ...state.form, Taluka: value } })
                        }
                        style={styles.input}
                    />

                    <CommonPicker
                        label="State"
                        selectedValue={state.form.state || ''}
                        items={statesList}
                        onValueChange={value =>
                            updateState({
                                ...state,
                                form: { ...state.form, state: value, district: '' }, // reset district
                            })
                        }

                    />

                    <CommonPicker
                        label="District"
                        selectedValue={state.form.district || ''}
                        items={districtsList}
                        onValueChange={value =>
                            updateState({
                                ...state,
                                form: { ...state.form, district: value },
                            })
                        }

                    />
                    <TextInput
                        label="Pincode"
                        value={state.form.Pincode || ""}
                        keyboardType="numeric"
                        mode="outlined"
                        left={<TextInput.Icon icon="pin" />}
                        onChangeText={value =>
                            updateState({ ...state, form: { ...state.form, Pincode: value } })
                        }
                        style={styles.input}
                    />
                </Card.Content>
            </Card> */}




      <Card style={styles.landCard}>


        <Card.Content>
          <Text style={styles.sectionTitle}>Farmer Land Details</Text>

          {state.form.landNumber ? (
            <View style={styles.landContainer}>
              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Land Number:</Text>
                <Text style={styles.landValue}>{state.form.landNumber}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Sub Number:</Text>
                <Text style={styles.landValue}>{state.form.landSubNumber}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Total Area:</Text>
                <Text style={styles.landValue}>{state.form.landTotalArea} {state.form.landUnit}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Sowing Area:</Text>
                <Text style={styles.landValue}>{state.form.landSowingArea}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Village:</Text>
                <Text style={styles.landValue}>{state.form.landVillage}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>State:</Text>
                <Text style={styles.landValue}>{state.form.landState}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>District:</Text>
                <Text style={styles.landValue}>{state.form.landDistrict}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Sub-District:</Text>
                <Text style={styles.landValue}>{state.form.landSubDistrict}</Text>
              </View>

              <View style={styles.landRow}>
                <Text style={styles.landLabel}>Approval Status:</Text>
                <Text style={[styles.landValue, state.form.landApprovalStatus === 'PENDING' ? styles.pending :
                  state.form.landApprovalStatus === 'APPROVED' ? styles.approved : styles.rejected]}>
                  {state.form.landApprovalStatus}
                </Text>
              </View>


            </View>
          ) : (
            <Text style={styles.noLandText}>No land details available</Text>
          )}
        </Card.Content>
      </Card>


      {/* Seed Production Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Seed Production Details</Text>

          <Text style={styles.label}>Produce Seeds</Text>
          <CommonPicker
            selectedValue={state.form.produceseeds || ""}
            onValueChange={value =>
              updateState({ ...state, form: { ...state.form, produceseeds: value } })
            }
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
            items={Seeds}
          />
        </Card.Content>
      </Card>



      {/* Contract Terms Section */}
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

      {/* Submit Button */}
      <Button
        mode="contained"

        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
        onPress={() => navigation.navigate("Agreement" as never, { formData: state.form })}

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
  headerCard: {
    backgroundColor: "#4CAF50",
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    opacity: 0.9,
  },
  landCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  landContainer: {
    marginTop: 10,
  },
  landRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#F1F8E9",
    borderRadius: 8,
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
  landValue: {
    fontWeight: "500",
    color: "#455A64",
    fontSize: 14,
  },
  landImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 12,
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
  }

});