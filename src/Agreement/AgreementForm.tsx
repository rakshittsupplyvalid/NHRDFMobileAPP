import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import CommonPicker from "../CommonComponent/CommonDropdown";
import { FarmerName, seedType, produceseeds, District, State, Seeds } from "../Constants/constants";
import useForm from "../Form/UseForm";
import CustomDateTimePicker from '../CommonComponent/DateTimePicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from "@react-navigation/native";

const AgreementForm: React.FC = () => {
    const { state, updateState } = useForm();
    const [selectedDate, setSelectedDate] = useState(new Date());
     const navigation = useNavigation<any>();
    

    const [isFocused, setIsFocused] = useState({
        produceseeds: false,
        agreementType: false,
        duration: false,
        FarmerName: false,
    });

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
                    <Text style={styles.sectionTitle}>Agreement Details</Text>

                    <Text style={styles.label}>Seeds Type</Text>
                    <CommonPicker
                        selectedValue={state.form.agreementType || ""}
                        onValueChange={value =>
                            updateState({ ...state, form: { ...state.form, agreementType: value } })
                        }
                        items={seedType}
                        isFocused={isFocused.agreementType}
                        onFocus={() => handleFocus("agreementType")}
                        onBlur={() => handleBlur("agreementType")}
                    />

                    <Text style={styles.label}>Farmer Name</Text>
                    <CommonPicker
                        selectedValue={state.form.duration || ""}
                        onValueChange={value => {
                            updateState({ ...state, form: { ...state.form, duration: value } });
                        }}
                        items={FarmerName}
                        isFocused={isFocused.FarmerName}
                        onFocus={() => handleFocus("FarmerName")}
                        onBlur={() => handleBlur("FarmerName")}
                    />
                </Card.Content>
            </Card>

            {/* Farmer Information Section */}
            <Card style={styles.sectionCard}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Farmer Information</Text>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
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
                        </View>
                        <View style={styles.halfInput}>
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
                        </View>
                    </View>

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
                                value={state.form.village || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="home" />}
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, village: value } })
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
                                value={state.form.state || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="earth" />}
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, state: value } })
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

            {/* Location Details Section */}
            <Card style={styles.sectionCard}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Production Location</Text>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <TextInput
                                label="Village"
                                value={state.form.village || ""}
                                mode="outlined"
                                left={<TextInput.Icon icon="home" />}
                                onChangeText={value =>
                                    updateState({ ...state, form: { ...state.form, village: value } })
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


                    <Text style={styles.label}>District</Text>
                    <CommonPicker
                        selectedValue={state.form.District || ""}
                        onValueChange={value =>
                            updateState({ ...state, form: { ...state.form, District: value } })
                        }
                        items={District}
                    />


                    <Text style={styles.label}>State</Text>
                    <CommonPicker
                        selectedValue={state.form.State || ""}
                        onValueChange={value =>
                            updateState({ ...state, form: { ...state.form, State: value } })
                        }
                        items={State}
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
        height: 38,       // TextInput ki height
        fontSize: 14,     // Text ka size
        paddingHorizontal: 10, // thoda padding left/right
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