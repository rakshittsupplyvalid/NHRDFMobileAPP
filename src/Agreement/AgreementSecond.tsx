import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView, Modal, PermissionsAndroid, Platform } from "react-native";
import { Button, Text, Card, TextInput, Checkbox, HelperText, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import CommonPicker from "../CommonComponent/CommonDropdown";
import { Onion, Garlic, Potato } from "../Constants/constants";
import { useNavigation } from "@react-navigation/native";
import { Dropdown } from 'react-native-element-dropdown';
import { Image } from "react-native";
import useForm from "../Form/UseForm";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useFormData } from "../Constants/FormContext";
import YearPickerInput from "../CommonComponent/CommonYearPicker";
import { retrieveToken } from '../Service/apiInterceptors'
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BackHandler } from 'react-native';
import { Alert } from "react-native";
import apiClient from "../Service/apiInterceptors";
import { CommonActions } from "@react-navigation/native";
import CustomDateTimePicker from "../CommonComponent/DateTimePicker";
import { launchCamera, CameraOptions } from 'react-native-image-picker';
import * as FileSystem from "expo-file-system";
import axios from "axios";

interface NomineeType {
    nomineename: string;
    gender: string;
    age: string;
    dob: string;
    mobileno: string;
    email: string;
    addrline: string;
    villageid: string;
    villagename: string;
    districtid: string;
    districtname: string;
    subdistrictid: string;
    subdistrictname: string;
    stateid: string;
    statename: string;
    relation: string;
    profdocument: string;
    signature: string; // This will store the file URI
    year: string;
    pincode: string;
}

interface WitnessType {
    witnessname: string;
    witnessmobileno: string;
    witnessemail: string;
    addrline: string;
    villageid: string;
    villagename: string;
    districtid: string;
    districtname: string;
    subdistrictid: string;
    subdistrictname: string;
    stateid: string;
    statename: string;
    profdocument: string;
    signature: string; // This will store the file URI
    pincode: string;
}

const AgreementSecond: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { formData } = useFormData();
    const { state, updateState } = useForm();
    
    // ... (keep all your existing state variables)

    // FIXED: Remove individual signature URI states and handle them within nominee/witness objects
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nomineeDistrictsList, setNomineeDistrictsList] = useState<{ [key: number]: { label: string; value: string }[] }>({});
    const [nomineeCitiesList, setNomineeCitiesList] = useState<{ [key: number]: { label: string; value: string }[] }>({});
    const [signaturePhoto, setSignaturePhoto] = useState<string | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [nomineeAddressErrors, setNomineeAddressErrors] = useState<string[]>([]);
    const [witnessAddressErrors, setWitnessAddressErrors] = useState<string[]>([]);
    const [touched, setTouched] = useState<boolean[]>([]);
    const [witnessDistrictsList, setWitnessDistrictsList] = useState<{ [key: number]: { label: string; value: string }[] }>({});
    const [witnessCitiesList, setWitnessCitiesList] = useState<{ [key: number]: { label: string; value: string }[] }>({});

    // FIXED: Initialize nominees and witnesses with proper signature fields
    const [nominees, setNominees] = useState<NomineeType[]>([
        {
            nomineename: "",
            gender: "",
            age: "",
            dob: "",
            mobileno: "",
            email: "",
            addrline: "",
            villageid: "",
            villagename: "",
            districtid: "",
            districtname: "",
            subdistrictid: "",
            subdistrictname: "",
            stateid: "",
            statename: "",
            relation: "",
            profdocument: "",
            signature: "", // Will store file URI
            year: "",
            pincode: "",
        },
    ]);

    const [witnesses, setWitnesses] = useState<WitnessType[]>([
        {
            witnessname: "",
            witnessmobileno: "",
            witnessemail: "",
            addrline: "",
            villageid: "",
            villagename: "",
            districtid: "",
            districtname: "",
            subdistrictid: "",
            subdistrictname: "",
            stateid: "",
            statename: "",
            profdocument: "",
            signature: "", // Will store file URI
            pincode: "",
        },
    ]);

    const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);

    // FIXED: Handle signature capture from signature screen
    useFocusEffect(
        React.useCallback(() => {
            const params = route.params as { 
                signatureUri?: string; 
                type?: string; 
                index?: number 
            } | undefined;

            if (params?.signatureUri && params?.type && params.index !== undefined) {
                console.log("🖋️ Received Signature:", {
                    uri: params.signatureUri,
                    type: params.type,
                    index: params.index
                });

                if (params.type === "nominee") {
                    // Update specific nominee's signature
                    const updatedNominees = [...nominees];
                    updatedNominees[params.index].signature = params.signatureUri;
                    setNominees(updatedNominees);
                    console.log("✅ Updated nominee signature at index:", params.index);
                } else if (params.type === "witness") {
                    // Update specific witness's signature
                    const updatedWitnesses = [...witnesses];
                    updatedWitnesses[params.index].signature = params.signatureUri;
                    setWitnesses(updatedWitnesses);
                    console.log("✅ Updated witness signature at index:", params.index);
                }
            }
        }, [route.params, nominees, witnesses])
    );

    // FIXED: Enhanced handleSubmit function to properly handle image uploads
    const handleSubmit = async () => {
        console.log("📦 Starting submission process...");
        setIsSubmitting(true);

        if (!isAgreementAccepted) {
            Alert.alert("Agreement", "Please read and accept the agreement terms before submitting.");
            setIsSubmitting(false);
            return;
        }

        try {
            const requestData = new FormData();

            // 🔹 Append main contextual data
            requestData.append("CenterTargetId", formData?.selectedCenterTarget || "");
            requestData.append("FarmerDistributionId", formData?.Farmerdistribution || "");
            requestData.append("FarmerId", formData?.selectedFarmer || "");
            requestData.append("VarietyId", formData?.selectedVariety || "");
            requestData.append("DuringYear", formData?.Year?.toString() || "");
            requestData.append("SeedClass", formData?.seeds?.toString() || "");
            requestData.append("CommodityId", formData?.selectedCommodityType?.toString() || "");
            requestData.append("PlantingMaterial", "SEED");
            requestData.append("Area", formData?.Area || "0");
            requestData.append("CertificateNo", formData?.Certificate || "");
            requestData.append("LandDetailId", formData?.selectedLandId || "");
            requestData.append("SurveyNo", formData?.Survey || "");

            // 🔹 Append Agreement form fields
            requestData.append("AuthorizedName", state.form.authorizedSignatory || "");
            requestData.append("BillNumber", state.form.BillNumber || "");
            requestData.append("TagNumber", state.form.TagNumber || "");
            requestData.append("LotNumber", state.form.LotNumber || "");
            requestData.append("DuringYear", state.form.DuringYear || "");

            // 🔹 Append captured images (Profile + Signature)
            if (signaturePhoto) {
                console.log("📝 Adding farmer signature:", signaturePhoto);
                requestData.append("Signature", {
                    uri: signaturePhoto,
                    type: "image/jpeg",
                    name: "signature.jpg",
                } as any);
            }

            if (profilePhoto) {
                console.log("📷 Adding farmer profile:", profilePhoto);
                requestData.append("ProfFile", {
                    uri: profilePhoto,
                    type: "image/jpeg",
                    name: "profile.jpg",
                } as any);
            }

            // FIXED: Enhanced nominee data appending with proper image handling
            nominees.forEach((nominee, index) => {
                console.log(`👤 Processing nominee ${index}:`, nominee.nomineename);
                
                Object.keys(nominee).forEach((key) => {
                    const value = nominee[key as keyof NomineeType];
                    
                    if (key === "signature" && value) {
                        // 🔹 Handle nominee signature image
                        console.log(`🖋️ Adding nominee ${index} signature:`, value);
                        requestData.append(`NomiNee[${index}][signature]`, {
                            uri: value,
                            type: "image/jpeg",
                            name: `nominee_signature_${index}.jpg`,
                        } as any);
                    } else if (key === "dob" && value) {
                        // 🔹 Format date properly
                        const formattedDate = value.split('T')[0]; // Get only YYYY-MM-DD part
                        requestData.append(`NomiNee[${index}][${key}]`, formattedDate);
                    } else {
                        // 🔹 Append normal text fields
                        requestData.append(
                            `NomiNee[${index}][${key}]`,
                            value?.toString() || ""
                        );
                    }
                });
            });

            // FIXED: Enhanced witness data appending with proper image handling
            witnesses.forEach((witness, index) => {
                console.log(`👥 Processing witness ${index}:`, witness.witnessname);
                
                Object.keys(witness).forEach((key) => {
                    const value = witness[key as keyof WitnessType];
                    
                    if (key === "signature" && value) {
                        // 🔹 Handle witness signature image
                        console.log(`🖋️ Adding witness ${index} signature:`, value);
                        requestData.append(`Witness[${index}][signature]`, {
                            uri: value,
                            type: "image/jpeg",
                            name: `witness_signature_${index}.jpg`,
                        } as any);
                    } else {
                        // 🔹 Append normal text fields
                        requestData.append(
                            `Witness[${index}][${key}]`,
                            value?.toString() || ""
                        );
                    }
                });
            });

            // 🔹 Debug: Log FormData before sending
            console.log("🚀 Final FormData to be sent:");
            for (let [key, value] of (requestData as any).entries()) {
                if (typeof value === 'object' && value.uri) {
                    console.log(`📁 ${key}: [FILE] ${value.name} (${value.uri.substring(0, 50)}...)`);
                } else {
                    console.log(`📝 ${key}:`, value);
                }
            }

            const token = await retrieveToken();
            console.log("🔐 Token retrieved:", token ? "Yes" : "No");

            // 🔹 Make API call
            const response = await apiClient.post("/api/mobile/agreement", requestData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
                timeout: 30000, // 30 seconds timeout
            });

            console.log("✅ API Response Status:", response.status);
            console.log("✅ API Response Data:", response.data);

            if (response.status === 200 || response.status === 201) {
                Alert.alert("✅ Success", "Agreement submitted successfully.", [
                    {
                        text: "OK",
                        onPress: () => {
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: "Dashboard" }],
                                })
                            );
                        },
                    },
                ]);
            } else {
                Alert.alert("❌ Error", "Submission failed with unexpected status.");
            }
        } catch (error: any) {
            console.error("❌ Submission error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            Alert.alert(
                "Submission Failed",
                error.response?.data?.message || error.message || "Something went wrong. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // FIXED: Update nominee function with signature handling
    const updateNominee = (index: number, key: keyof NomineeType, value: string) => {
        const newNominees = [...nominees];

        if (key === "dob") {
            newNominees[index][key] = value;
        } else if (key === "year") {
            const numericYear = value.replace(/[^0-9]/g, "").slice(0, 4);
            newNominees[index][key] = numericYear as any;
        } else {
            newNominees[index][key] = value as any;
        }

        setNominees(newNominees);
    };


    
        const deleteNominee = (index) => {
            Alert.alert(
                "Delete Nominee",
                "Are you sure you want to delete this nominee?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                            const updatedNominees = nominees.filter((_, i) => i !== index);
                            setNominees(updatedNominees);
                        },
                    },
                ]
            );
        };


           const deleteWitness = (index) => {
                Alert.alert(
                    "Delete Witness",
                    "Are you sure you want to delete this witness?",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Delete",
                            style: "destructive",
                            onPress: () => {
                                const updatedWitnesses = witnesses.filter((_, i) => i !== index);
                                setWitnesses(updatedWitnesses);
                            },
                        },
                    ]
                );
            };

    // FIXED: Add nominee with proper signature field
    const addNominee = () => {
        setNominees([
            ...nominees,
            {
                nomineename: "",
                gender: "",
                age: "",
                dob: "",
                mobileno: "",
                email: "",
                addrline: "",
                villageid: "",
                villagename: "",
                districtid: "",
                districtname: "",
                subdistrictid: "",
                subdistrictname: "",
                stateid: "",
                statename: "",
                relation: "",
                profdocument: "",
                signature: "", // Initialize with empty string
                year: "",
                pincode: "",
            },
        ]);
    };

    // FIXED: Add witness with proper signature field
    const addWitness = () => {
        setWitnesses([
            ...witnesses,
            {
                witnessname: "",
                witnessmobileno: "",
                witnessemail: "",
                addrline: "",
                villageid: "",
                villagename: "",
                districtid: "",
                districtname: "",
                subdistrictid: "",
                subdistrictname: "",
                stateid: "",
                statename: "",
                profdocument: "",
                signature: "", // Initialize with empty string
                pincode: "",
            },
        ]);
    };


      const updateWitness = (index: number, key: keyof WitnessType, value: string) => {
        const newWitnesses = [...witnesses];
        newWitnesses[index][key] = value;
        setWitnesses(newWitnesses);
    };

    // FIXED: Navigation to signature screen with index
    const navigateToSignature = (type: "nominee" | "witness", index: number) => {
        console.log(`🖊️ Navigating to signature for ${type} at index:`, index);
        navigation.navigate("Signature", { 
            type: type, 
            index: index 
        });
    };

    // ... (keep all your other existing functions: validateField, calculateAge, etc.)

    return (
        <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
            {/* 🔹 Custom Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate("Agreement Form" as never)}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Nominee details</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* 🔹 Content */}
            <KeyboardAwareScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                enableOnAndroid={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                enableAutomaticScroll={false}
                showsVerticalScrollIndicator={false}
            >
                {/* Nominee Section */}
                <Card style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Nominee Details</Text>
                    {nominees.map((nominee, index) => (
                        <Card key={index} style={styles.sectionCard}>
                            <Card.Content>
                                <Text style={styles.sectionSubTitle}>Nominee {index + 1}</Text>

                                {/* FIXED: Show nominee signature preview from nominee object */}
                                {nominee.signature ? (
                                    <View style={{ marginVertical: 10, alignItems: "center" }}>
                                        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Signature Preview:</Text>
                                        <Image
                                            source={{ uri: nominee.signature }}
                                            style={{ 
                                                width: 250, 
                                                height: 100, 
                                                borderWidth: 1, 
                                                borderColor: "#ccc",
                                                borderRadius: 8 
                                            }}
                                            resizeMode="contain"
                                        />
                                        <Text style={{ fontSize: 12, color: "green", marginTop: 5 }}>
                                            ✓ Signature added
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={{ marginVertical: 10, alignItems: "center" }}>
                                        <Text style={{ fontSize: 12, color: "orange" }}>
                                            No signature added yet
                                        </Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => navigateToSignature("nominee", index)}
                                >
                                    <MaterialCommunityIcons name="signature-freehand" size={26} color="#2C5EFF" />
                                    <Text style={styles.iconText}>
                                        {nominee.signature ? "Update Nominee Signature" : "Add Nominee Signature"}
                                    </Text>
                                </TouchableOpacity>

                                {/* Rest of nominee fields */}
                                <TextInput
                                    mode="outlined"
                                    label="Full Name"
                                    value={nominee.nomineename}
                                    onChangeText={(text) => updateNominee(index, "nomineename", text)}
                                    style={styles.input}
                                    maxLength={25}
                                />

                                {/* ... rest of your nominee fields remain the same ... */}
                                
                                <Button
                                    mode="outlined"
                                    icon="delete"
                                    onPress={() => deleteNominee(index)}
                                    textColor="red"
                                    style={{ marginVertical: 10, borderColor: "red" }}
                                >
                                    Delete Nominee
                                </Button>
                            </Card.Content>
                        </Card>
                    ))}

                    <Button mode="outlined" onPress={addNominee} style={{ marginVertical: 10 }}>
                        Add Another Nominee
                    </Button>
                </Card>

                {/* Witness Section */}
                <Card style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Witness Details</Text>
                    {witnesses.map((witness, index) => (
                        <Card key={index} style={styles.sectionCard}>
                            <Card.Content>
                                <Text style={styles.sectionSubTitle}>Witness {index + 1}</Text>

                                {/* FIXED: Show witness signature preview from witness object */}
                                {witness.signature ? (
                                    <View style={{ marginVertical: 10, alignItems: "center" }}>
                                        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Signature Preview:</Text>
                                        <Image
                                            source={{ uri: witness.signature }}
                                            style={{ 
                                                width: 250, 
                                                height: 100, 
                                                borderWidth: 1, 
                                                borderColor: "#ccc",
                                                borderRadius: 8 
                                            }}
                                            resizeMode="contain"
                                        />
                                        <Text style={{ fontSize: 12, color: "green", marginTop: 5 }}>
                                            ✓ Signature added
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={{ marginVertical: 10, alignItems: "center" }}>
                                        <Text style={{ fontSize: 12, color: "orange" }}>
                                            No signature added yet
                                        </Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => navigateToSignature("witness", index)}
                                >
                                    <MaterialCommunityIcons name="signature-freehand" size={26} color="#2C5EFF" />
                                    <Text style={styles.iconText}>
                                        {witness.signature ? "Update Witness Signature" : "Add Witness Signature"}
                                    </Text>
                                </TouchableOpacity>

                                {/* Rest of witness fields */}
                                <TextInput
                                    mode="outlined"
                                    label="Full Name"
                                    value={witness.witnessname}
                                    onChangeText={(text) => updateWitness(index, "witnessname", text)}
                                    style={styles.input}
                                    maxLength={25}
                                />

                                {/* ... rest of your witness fields remain the same ... */}
                                
                                <Button
                                    mode="outlined"
                                    icon="delete"
                                    onPress={() => deleteWitness(index)}
                                    textColor="red"
                                    style={{ marginVertical: 10, borderColor: "red" }}
                                >
                                    Delete Witness
                                </Button>
                            </Card.Content>
                        </Card>
                    ))}

                    <Button mode="outlined" onPress={addWitness} style={{ marginVertical: 10 }}>
                        Add Another Witness
                    </Button>
                </Card>

                {/* ... rest of your components remain the same ... */}

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={[
                        styles.submitButton,
                        (!isAgreementAccepted || isSubmitting) && styles.submitButtonDisabled,
                    ]}
                    contentStyle={styles.submitButtonContent}
                    icon="check"
                    disabled={!isAgreementAccepted || isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit Agreement"}
                </Button>
            </KeyboardAwareScrollView>
        </View>
    );
};

export default AgreementSecond;

const styles = StyleSheet.create({
    // ... your existing styles remain the same
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#70B04F",
        paddingHorizontal: 16,
        paddingVertical: 14,
        justifyContent: "space-between",
    },
    sectionSubTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
    backButton: {
        paddingHorizontal: 14,
        paddingVertical: 20,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        flex: 1,
        textAlign: "center",
    },
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
    iconButton: {
        backgroundColor: "#EAF0FF",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        elevation: 2,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 10,
        flexDirection: "row",
        gap: 10,
    },
    iconText: {
        fontSize: 14,
        color: "#2C5EFF",
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#70B04F",
        marginBottom: 16,
        textAlign: "center",
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
        height: 50,
        fontSize: 14,
    },
    submitButton: {
        marginTop: 8,
        marginBottom: 30,
        paddingVertical: 8,
        backgroundColor: "#2196F3",
        borderRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: "#BDBDBD",
    },
    submitButtonContent: {
        paddingVertical: 6,
    },
    // ... rest of your styles
});