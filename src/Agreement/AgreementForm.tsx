import React from "react";
import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import CommonPicker from "../CommonComponent/CommonDropdown";
import { FarmerName, seedType, produceseeds, District, State, Seeds } from "../Constants/constants";
import useForm from "../Form/UseForm";
import CustomDateTimePicker from '../CommonComponent/DateTimePicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from "@react-navigation/native";
import { fetchCommodityTypes, fetchCommoditiesByType, farmer, farmerDetails } from "../Service/fetchCommodity";
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


    useEffect(() => {
    if (!selectedFarmer) return;

    (async () => {
        const details = await farmerDetails(selectedFarmer);
        if (details.length > 0) {
            const info = details[0]; // API single object return

            // Populate form fields
            updateState({
                ...state,
                form: {
                    ...state.form,
                    name: info.name || "",
                    age: info.age?.toString() || "",
                    occupation: info.occupation || "",
                    relation : info.relation || "",
                    relativename : info.relativename || "",
                    statename : info.statename || "",
                    villagename : info.villagename || "",
                    village: info.village || "",
                    post: info.post || "",
                    taluka: info.taluka || "",
                    dist: info.district || "",
                     gender: info.gender || "",
                    state: info.state || "",
                    pincode: info.pincode?.toString() || "",
                    phone: info.phone || "",
                    mobile: info.mobile || "",
                },
            });
        }
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



    const isFarmerSelected = state.form.duration === "FarmerName1" || state.form.duration === "FarmerName2" || state.form.duration === "FarmerName3" || state.form.duration === "FarmerName4";

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
                        onValueChange={(value) => {setSelectedCommodity(value)
                           console.log("Selected Commodity first value:", value);
                        }}
                        items={commodities}
                    />


                    <CommonPicker
                        label="Farmer"
                        selectedValue={selectedFarmer}
                        onValueChange={(value) => {setSelectedFarmer(value)
                               console.log("Farmer Value", value);

                        }}
                        items={farmersList}
                    />


                </Card.Content>
            </Card>

        
            <Card style={styles.sectionCard}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Farmer Information</Text>

                    
                            <TextInput
                                label="Full Name"
                                value={state.form.name || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="account" />}
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, name: value } })
                                }
                                style={styles.input}
                                disabled={!isFarmerSelected}
                            />
                      
                   
                            <TextInput
                                label="Age"
                                value={state.form.age || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="calendar" />}
                                keyboardType="numeric"
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, age: value } })
                                }
                                style={styles.input}
                                disabled={!isFarmerSelected}
                            />
                    


                      <TextInput
                        label="Gender"
                        value={state.form.gender || ""}
                        mode="outlined"
                        left={<TextInput.Icon icon="briefcase" />}
                        onChangeText={value =>
                            updateState({ ...state, form: { ...state.form, gender: value } })
                        }
                        style={styles.input}
                        disabled={!isFarmerSelected}
                    />


                          <TextInput
                        label="Relation"
                        value={state.form.relation || ""}
                        mode="outlined"
                        left={<TextInput.Icon icon="briefcase" />}
                        onChangeText={value =>
                            updateState({ ...state, form: { ...state.form, relation: value } })
                        }
                        style={styles.input}
                        disabled={!isFarmerSelected}
                    />



                     <TextInput
                        label="Relative name"
                        value={state.form.relativename || ""}
                        mode="outlined"
                        left={<TextInput.Icon icon="briefcase" />}
                        onChangeText={value =>
                            updateState({ ...state, form: { ...state.form,  relativename: value } })
                        }
                        style={styles.input}
                        disabled={!isFarmerSelected}
                    />

                    <TextInput
                        label="Occupation"
                        value={state.form.occupation || ""}
                        mode="outlined"
                        left={<TextInput.Icon icon="briefcase" />}
                        onChangeText={value =>
                            updateState({ ...state, form: { ...state.form, occupation: value } })
                        }
                        style={styles.input}
                        disabled={!isFarmerSelected}
                    />

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <TextInput
                                label="Village"
                                value={state.form.villagename|| ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="home" />}
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, villagename: value } })
                                }
                                style={styles.input}
                                disabled={!isFarmerSelected}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <TextInput
                                label="Post"
                                value={state.form.post || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="office-building" />}
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, post: value } })
                                }
                                style={styles.input}
                                disabled={!isFarmerSelected}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <TextInput
                                label="Taluka"
                                value={state.form.taluka || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="map-marker" />}
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, taluka: value } })
                                }
                                style={styles.input}
                                disabled={!isFarmerSelected}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <TextInput
                                label="District"
                                value={state.form.dist || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="map" />}
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, dist: value } })
                                }
                                style={styles.input}
                                disabled={!isFarmerSelected}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <TextInput
                                label="State"
                                value={state.form.statename || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="earth" />}
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, statename: value } })
                                }
                                style={styles.input}
                                disabled={!isFarmerSelected}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <TextInput
                                label="Pincode"
                                value={state.form.pincode || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="pin" />}
                                keyboardType="numeric"
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, pincode: value } })
                                }
                                style={styles.input}
                                disabled={!isFarmerSelected}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <TextInput
                                label="Phone (with STD code)"
                                value={state.form.phone || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="phone" />}
                                keyboardType="phone-pad"
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, phone: value } })
                                }
                                style={styles.input}
                                disabled={!isFarmerSelected}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <TextInput
                                label="Mobile Number"
                                value={state.form.mobile || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="cellphone" />}
                                keyboardType="phone-pad"
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, mobile: value } })
                                }
                                style={styles.input}
                                disabled={!isFarmerSelected}
                            />
                        </View>
                    </View>
                </Card.Content>
            </Card>


             {/* Location Details Section */}
            <Card style={styles.sectionCard}>
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

                onPress={() => navigation.navigate("Agreement" as never)}
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

});