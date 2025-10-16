import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Button, Text, Card, TextInput, Checkbox } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import CommonPicker from "../CommonComponent/CommonDropdown";
import { commodity, Onion, Garlic, Potato, relations, states, districts, years } from "../Constants/constants";
import { useNavigation } from "@react-navigation/native";
import { Image } from "react-native";
import useForm from "../Form/UseForm";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { retrieveToken } from '../Service/apiInterceptors'
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert } from "react-native";
import apiClient from "../Service/apiInterceptors";
import { CommonActions } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';

const AgreementSecond: React.FC = () => {
    const { state, updateState } = useForm();

    const route = useRoute();
    const [signatureUri, setSignatureUri] = useState<string | null>(null);
    const { formData, selectedCommodityType, selectedFarmer, selectedVariety, Farmerdistribution, selectedCenterTarget } = route.params as { formData: any, selectedCommodityType: any, selectedFarmer: any, selectedVariety: any, Farmerdistribution: any, selectedCenterTarget: any };
    const navigation = useNavigation<any>();
    const [nomineeSignatureUri, setNomineeSignatureUri] = useState<string | null>(null);
    const [witnessSignatureUri, setWitnessSignatureUri] = useState<string | null>(null);
    const [nominees, setNominees] = useState<any[]>([]); // initially empty array
    const [witnesses, setWitnesses] = useState<any[]>([]); // initially empty array

    const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);


    useEffect(() => {
        console.log("📦 Received Form Data:", formData);
        console.log("📦 commidity id", selectedCommodityType);
        console.log("📦 variety id ", selectedVariety);
        console.log("📦 selectedCenterTarget id ", selectedCenterTarget);
    }, []);



    // Handle adding nominee
    const addNominee = () => {
        if (!state.form.name) {
            Alert.alert("Error", "Nominee name is required");
            return;
        }

        const newNominee = {
            nomineename: state.form.name,
            age: state.form.age || 0,
            year: state.form.year || 0,
            relation: state.form.relation || "",
            dependentName: state.form.dependentName || "",
            addrline: state.form.addrline || "",
            pincode: state.form.pincode || "",
            statename: state.form.statename || "",       // ✅ add StateName
            districtname: state.form.districtname || "", // ✅ add DistrictName
            subdistrictname: state.form.subdistrictname || "", // ✅ add SubDistrictName
            villageid: state.form.villageid || 0,
            districtid: state.form.districtid || 0,
            subdistrictid: state.form.subdistrictid || 0,
            stateid: state.form.stateid || 0,
            signatureUri: nomineeSignatureUri || "",
            email: state.form.email || "",
            gender: state.form.gender || "NONE",
            mobileno: state.form.mobileno || "",
            dob: state.form.dob || "",
            profdocument: state.form.profdocument || "",
            villagename: state.form.villagename || ""
        };

        setNominees([...nominees, newNominee]);
        updateState({
            ...state,
            form: {
                ...state.form,
                name: "",
                age: "",
                year: "",
                relation: "",
                dependentName: "",
                addrline: "",
                pincode: "",
                statename: "",
                districtname: "",
                subdistrictname: "",
                villageid: 0,
                districtid: 0,
                subdistrictid: 0,
                stateid: 0,
                email: "",
                gender: "NONE",
                mobileno: "",
                dob: "",
                profdocument: "",
                villagename: ""
            }
        });
        setNomineeSignatureUri(null);
    };

    // Handle adding witness
    const addWitness = () => {
        if (!state.form.witnessname) {
            Alert.alert("Error", "Witness name is required");
            return;
        }

        const newWitness = {
            witnessname: state.form.witnessname,
            addrline: state.form.witnessaddress || "",
            pincode: state.form.witnesspincode || "",
            statename: state.form.witnessstatename || "",       // ✅ add StateName
            districtname: state.form.witnessdistrictname || "", // ✅ add DistrictName
            subdistrictname: state.form.witnesssubdistrictname || "", // ✅ add SubDistrictName
            villageid: state.form.witnessvillageid || 0,
            districtid: state.form.witnessdistrictid || 0,
            subdistrictid: state.form.witnesssubdistrictid || 0,
            stateid: state.form.witnessstateid || 0,
            witnessmobileno: state.form.witnessmobileno || "",
            witnessemail: state.form.witnessemail || "",
            signatureUri: witnessSignatureUri || "",
            profdocument: state.form.witnessprofdocument || "",
            villagename: state.form.witnessvillagename || ""
        };

        setWitnesses([...witnesses, newWitness]);
        updateState({
            ...state,
            form: {
                ...state.form,
                witnessname: "",
                witnessaddress: "",
                witnesspincode: "",
                witnessstatename: "",
                witnessdistrictname: "",
                witnesssubdistrictname: "",
                witnessvillageid: 0,
                witnessdistrictid: 0,
                witnesssubdistrictid: 0,
                witnessstateid: 0,
                witnessmobileno: "",
                witnessemail: "",
                witnessprofdocument: "",
                witnessvillagename: ""
            }
        });
        setWitnessSignatureUri(null);
    };




    useFocusEffect(
        React.useCallback(() => {
            const params = route.params as { signature?: string; type?: string } | undefined;
            if (params?.signature && params?.type) {
                if (params.type === "nominee") setNomineeSignatureUri(params.signature);
                else if (params.type === "witness") setWitnessSignatureUri(params.signature);
            }
        }, [route.params])
    );




    const handleSubmit = async () => {
        if (!isAgreementAccepted) {
            Alert.alert(
                "Agreement",
                "Please read and accept the agreement terms before submitting."
            );
            return;
        }

        try {
            const formData = new FormData();

            // ✅ Main form fields dynamically from state/selection
            formData.append("CenterTargetId", selectedCenterTarget || "");
            formData.append("FarmerDistributionId", Farmerdistribution);
            formData.append("FarmerId", selectedFarmer);
            formData.append("VarietyId", selectedVariety);
            formData.append("PlantingMaterial", "SEED");
            formData.append("TagNumber", state.form.TagNumber || "");
            formData.append("AuthorizedName", state.form.AuthorizedName || "");
            formData.append("SeedClass", state.form.SeedClass || "");
            formData.append("CommodityId", selectedCommodityType);
            formData.append("Area", state.form.Area?.toString() ?? "0");
            formData.append("BillNumber", state.form.BillNumber || "");
            formData.append("LotNumber", state.form.LotNumber || "");
            formData.append("DuringYear", state.form.DuringYear || "");

            nominees.forEach((nominee, index) => {
                formData.append(`NomiNee[${index}][NomiNeeName]`, nominee.nomineename || "");
                formData.append(`NomiNee[${index}][Age]`, nominee.age?.toString() || "0");
                formData.append(`NomiNee[${index}][Relation]`, nominee.relation || "");
                formData.append(`NomiNee[${index}][Addrline]`, nominee.addrline || "");
                formData.append(`NomiNee[${index}][Pincode]`, nominee.pincode || "");
                formData.append(`NomiNee[${index}][StateName]`, nominee.statename || "");
                formData.append(`NomiNee[${index}][DistrictName]`, nominee.districtname || "");
                formData.append(`NomiNee[${index}][SubDistrictName]`, nominee.subdistrictname || "");
                formData.append(`NomiNee[${index}][VillageId]`, nominee.villageid?.toString() || "0");
                formData.append(`NomiNee[${index}][DistrictId]`, nominee.districtid?.toString() || "0");
                formData.append(`NomiNee[${index}][SubDistrictId]`, nominee.subdistrictid?.toString() || "0");
                formData.append(`NomiNee[${index}][StateId]`, nominee.stateid?.toString() || "0");

                if (nominee.signatureUri) {
                    const fileName = nominee.signatureUri.split("/").pop();
                    formData.append(`NomiNee[${index}][Signature]`, {
                        uri: nominee.signatureUri,
                        type: "image/png",
                        name: fileName,
                    } as any);
                }
            });




            witnesses.forEach((witness, index) => {
                formData.append(`Witness[${index}][WitnessName]`, witness.witnessname || "");
                formData.append(`Witness[${index}][Addrline]`, witness.addrline || "");
                formData.append(`Witness[${index}][Pincode]`, witness.pincode || "");
                formData.append(`Witness[${index}][StateName]`, witness.statename || "");
                formData.append(`Witness[${index}][DistrictName]`, witness.districtname || "");
                formData.append(`Witness[${index}][SubDistrictName]`, witness.subdistrictname || "");
                formData.append(`Witness[${index}][VillageId]`, witness.villageid?.toString() || "0");
                formData.append(`Witness[${index}][DistrictId]`, witness.districtid?.toString() || "0");
                formData.append(`Witness[${index}][SubDistrictId]`, witness.subdistrictid?.toString() || "0");
                formData.append(`Witness[${index}][StateId]`, witness.stateid?.toString() || "0");
                formData.append(`Witness[${index}][MobileNo]`, witness.witnessmobileno || "");
                formData.append(`Witness[${index}][Email]`, witness.witnessemail || "");

                if (witness.signatureUri) {
                    const fileName = witness.signatureUri.split("/").pop();
                    formData.append(`Witness[${index}][Signature]`, {
                        uri: witness.signatureUri,
                        type: "image/png",
                        name: fileName,
                    } as any);
                }
            });



            // ✅ Debug: show what will be sent
            for (let [key, value] of (formData as any).entries()) {
                console.log(`📦 ${key}:`, value);
            }

            const token = await retrieveToken();
            console.log("📜 Token before submit:", token);

            const response = await apiClient.post("/api/mobile/agreement", formData);

            console.log("✅ Submit response:", response.data);

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Success", "Agreement submitted successfully.", [
                    {
                        text: "OK",
                        onPress: () => {
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: "DashboardScreen" }],
                                })
                            );
                        },
                    },
                ]);
            } else {
                Alert.alert("Error", "Submission failed.");
            }
        } catch (error: any) {
            console.error("❌ Submit error:", error);
            Alert.alert(
                "Error",
                error.response?.data?.message || "Something went wrong."
            );
        }
    };







    useFocusEffect(
        React.useCallback(() => {
            const params = route.params as { signature?: string; type?: string } | undefined;
            if (params?.signature && params?.type) {
                if (params.type === "nominee") {
                    setNomineeSignatureUri(params.signature);
                } else if (params.type === "witness") {
                    setWitnessSignatureUri(params.signature);
                }
            }
        }, [route.params])
    );


    // Function to render commodity-specific dropdown
    const renderCommodityDropdown = () => {
        const selectedCommodity = state.form.commodity;

        switch (selectedCommodity) {
            case "onion":
                return (
                    <Card style={styles.sectionCard}>
                        <Card.Content>
                            <Text style={styles.label}>Onion Varieties</Text>
                            <CommonPicker
                                selectedValue={state.form.onionVariety || ""}
                                onValueChange={(value) =>
                                    updateState({ ...state, form: { ...state.form, onionVariety: value } })
                                }
                                items={Onion}
                            />
                        </Card.Content>
                    </Card>
                );

            case "Garlic":
                return (
                    <Card style={styles.sectionCard}>
                        <Card.Content>
                            <Text style={styles.label}>Garlic Varieties</Text>
                            <CommonPicker
                                selectedValue={state.form.garlicVariety || ""}
                                onValueChange={(value) =>
                                    updateState({ ...state, form: { ...state.form, garlicVariety: value } })
                                }
                                items={Garlic}
                            />
                        </Card.Content>
                    </Card>
                );

            case "Potato":
                return (
                    <Card style={styles.sectionCard}>
                        <Card.Content>
                            <Text style={styles.label}>Potato Varieties</Text>
                            <CommonPicker
                                selectedValue={state.form.potatoVariety || ""}
                                onValueChange={(value) =>
                                    updateState({ ...state, form: { ...state.form, potatoVariety: value } })
                                }
                                items={Potato}
                            />
                        </Card.Content>
                    </Card>
                );
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
            {/* 🔹 Custom Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate("AgreementForm" as never)}
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
                enableAutomaticScroll={true}
                showsVerticalScrollIndicator={false}
            >


                {/* Nominee Section */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Nominee Details</Text>
                        <TextInput
                            label="Full Name"
                            value={state.form.name || ""}
                            style={styles.input}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, name: text } })}
                        />
                        <TextInput
                            label="Age"
                            value={state.form.age || ""}
                            style={styles.input}
                            keyboardType="numeric"
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, age: text } })}
                        />
                        <CommonPicker
                            selectedValue={state.form.relation || ""}
                            onValueChange={(value) => updateState({ ...state, form: { ...state.form, relation: value } })}
                            items={relations}
                        />
                        <TextInput
                            label="Dependent Name"
                            style={styles.input}
                            value={state.form.dependentName || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, dependentName: text } })}
                        />
                        <TextInput
                            label="Address"
                            style={styles.input}
                            value={state.form.addrline || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, addrline: text } })}
                        />
                        <TextInput
                            label="Pincode"
                            style={styles.input}
                            value={state.form.pincode || ""}
                            keyboardType="numeric"
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, pincode: text } })}
                        />


                        <TextInput
                            label="Statecode"
                            style={styles.input}
                            value={state.form.statename || ""}
                            keyboardType="numeric"
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, statename: text } })}
                        />

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.navigate("Signature", { type: "nominee" })}
                        >
                            <MaterialCommunityIcons name="signature-freehand" size={26} color="#2C5EFF" />
                            <Text>Add Nominee Signature</Text>
                        </TouchableOpacity>

                        <Button mode="outlined" onPress={addNominee} style={{ marginTop: 10 }}>
                            Add Nominee
                        </Button>

                        {nominees.map((nominee, index) => (
                            <Card key={index} style={{ marginTop: 10, padding: 10, backgroundColor: "#f0f0f0" }}>
                                <Text>Name: {nominee.name}</Text>
                                <Text>Age: {nominee.age}</Text>
                                <Text>Relation: {nominee.relation}</Text>
                                <Text>Address: {nominee.addrline}</Text>
                                <Text>Pincode: {nominee.pincode}</Text>
                                <Text>Statecode: {nominee.statename}</Text>
                                {nominee.signatureUri && <Image source={{ uri: nominee.signatureUri }} style={{ width: 100, height: 50, marginTop: 5 }} />}
                            </Card>
                        ))}
                    </Card.Content>
                </Card>

                {/* Witness Section */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Witness Details</Text>
                        <TextInput
                            label="Name"
                            value={state.form.witnessname || ""}
                            style={styles.input}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, witnessname: text } })}
                        />
                        <TextInput
                            label="Address"
                            value={state.form.witnessaddress || ""}
                            style={styles.input}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, witnessaddress: text } })}
                        />
                        <TextInput
                            label="Pincode"
                            value={state.form.witnesspincode || ""}
                            style={styles.input}
                            keyboardType="numeric"
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, witnesspincode: text } })}
                        />
                        <TextInput
                            label="Mobile No"
                            value={state.form.witnessmobileno || ""}
                            style={styles.input}
                            keyboardType="numeric"
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, witnessmobileno: text } })}
                        />


                        <TextInput
                            label="state name "
                            value={state.form.witnessstatename || ""}
                            style={styles.input}
                            keyboardType="numeric"
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, witnessstatename: text } })}
                        />

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.navigate("Signature", { type: "witness" })}
                        >
                            <MaterialCommunityIcons name="signature-freehand" size={26} color="#2C5EFF" />
                            <Text>Add Witness Signature</Text>
                        </TouchableOpacity>

                        <Button mode="outlined" onPress={addWitness} style={{ marginTop: 10 }}>
                            Add Witness
                        </Button>

                        {witnesses.map((witness, index) => (
                            <Card key={index} style={{ marginTop: 10, padding: 10, backgroundColor: "#f0f0f0" }}>
                                <Text>Name: {witness.name}</Text>
                                <Text>Address: {witness.addrline}</Text>
                                <Text>Pincode: {witness.pincode}</Text>
                                <Text>Mobile: {witness.witnessmobileno}</Text>
                                <Text>Statecode: {witness.witnessstatename}</Text>
                                {witness.signatureUri && <Image source={{ uri: witness.signatureUri }} style={{ width: 100, height: 50, marginTop: 5 }} />}
                            </Card>
                        ))}
                    </Card.Content>
                </Card>







                {/* Address Information Section */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Address Information</Text>

                        {/* Village */}
                        <Text style={styles.label}>Village</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.village || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, village: text } })}
                            style={styles.input}
                            placeholder="Enter village name"
                        />

                        {/* Post Office */}
                        <Text style={styles.label}>Post Office</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.postOffice || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, postOffice: text } })}
                            style={styles.input}
                            placeholder="Enter post office"
                        />

                        {/* Taluka */}
                        <Text style={styles.label}>Taluka</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.taluka || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, taluka: text } })}
                            style={styles.input}
                            placeholder="Enter taluka"
                        />

                        {/* District Dropdown */}
                        <Text style={styles.label}>District</Text>
                        <CommonPicker
                            selectedValue={state.form.district || ""}
                            onValueChange={(value) =>
                                updateState({ ...state, form: { ...state.form, district: value } })
                            }
                            items={districts}
                        />

                        {/* State Dropdown */}
                        <Text style={styles.label}>State</Text>
                        <CommonPicker
                            selectedValue={state.form.state || ""}
                            onValueChange={(value) =>
                                updateState({ ...state, form: { ...state.form, state: value } })
                            }
                            items={states}
                        />

                        {/* Pincode */}
                        <Text style={styles.label}>Pincode</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.pincode || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, pincode: text } })}
                            style={styles.input}
                            placeholder="Enter pincode"
                            keyboardType="numeric"
                            maxLength={6}
                        />

                        {/* Mobile Number */}
                        <Text style={styles.label}>Mobile Number</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.mobileNumber || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, mobileNumber: text } })}
                            style={styles.input}
                            placeholder="Enter mobile number"
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </Card.Content>
                </Card>



                {/* Dynamic Commodity-Specific Dropdown */}
                {renderCommodityDropdown()}

                {/* NHRDF Authorized Signatory Section */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>NHRDF Authorized Signatory</Text>

                        {/* Authorized Signatory Name */}
                        <Text style={styles.label}>Authorized Signatory Name</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.authorizedSignatory || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, authorizedSignatory: text } })}
                            style={styles.input}
                            placeholder="Enter authorized signatory name"
                        />

                        {/* NHRDF Address */}
                        <Text style={styles.label}>NHRDF Address</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.nhrdfAddress || "NATIONAL HORTICULTURAL RESEARCH AND DEVELOPMENT FOUNDATION, JANAKPURI, NEW DELHI"}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, nhrdfAddress: text } })}
                            style={styles.input}
                            placeholder="Enter NHRDF address"
                            multiline={true}
                            numberOfLines={2}
                        />

                        {/* Plot Number */}
                        <Text style={styles.label}>Plot Number</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.plotNumber || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, plotNumber: text } })}
                            style={styles.input}
                            placeholder="Enter plot number"
                        />

                        {/* Location Details */}
                        <Text style={styles.label}>Location Details</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.locationDetails || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, locationDetails: text } })}
                            style={styles.input}
                            placeholder="Enter location details (e.g., Behind Hotel Murkishari)"
                            multiline={true}
                            numberOfLines={2}
                        />

                        {/* Village/Town */}
                        <Text style={styles.label}>Village/Town</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.nhrdfVillage || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, nhrdfVillage: text } })}
                            style={styles.input}
                            placeholder="Enter village/town"
                        />

                        {/* Post Office */}
                        <Text style={styles.label}>Post Office</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.nhrdfPostOffice || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, nhrdfPostOffice: text } })}
                            style={styles.input}
                            placeholder="Enter post office"
                        />

                        {/* Taluka */}
                        <Text style={styles.label}>Taluka</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.nhrdfTaluka || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, nhrdfTaluka: text } })}
                            style={styles.input}
                            placeholder="Enter taluka"
                        />

                        {/* District */}
                        <Text style={styles.label}>District</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.nhrdfDistrict || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, nhrdfDistrict: text } })}
                            style={styles.input}
                            placeholder="Enter district"
                        />

                        {/* Pincode */}
                        <Text style={styles.label}>Pincode</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.nhrdfPincode || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, nhrdfPincode: text } })}
                            style={styles.input}
                            placeholder="Enter pincode"
                            keyboardType="numeric"
                            maxLength={6}
                        />
                    </Card.Content>
                </Card>

                {/* Agreement Terms and Conditions Section */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Agreement Terms & Conditions</Text>

                        <ScrollView style={styles.agreementContainer} nestedScrollEnabled={true}>
                            <Text style={styles.agreementText}>
                                <Text style={styles.agreementHeading}>Important Terms:{'\n\n'}</Text>

                                • The NHRDF reserves the right to terminate this Contract Agreement without giving any notice under circumstances beyond their control.{'\n\n'}

                                • In case of termination, the Grower will be fully responsible for disposal of seeds/bulbs/tubers produced.{'\n\n'}

                                • This Agreement has been read & explained to the Grower in his/her own mother tongue.{'\n\n'}

                                • The Grower hereby declares that he/she has understood fully the contents thereof.{'\n\n'}

                                • This Agreement is signed and implemented as it is mutually understood and agreed by Grower and the NHRDF.{'\n\n'}

                                • If any dispute arises in this matter as per this Agreement, jurisdiction will be Delhi Court, Delhi, India only.{'\n\n'}

                                <Text style={styles.agreementNote}>
                                    Note: The Grower is not allowed to sell the produce other than those approved under the programmes or from the fields not inspected by the NHRDF.
                                </Text>
                            </Text>
                        </ScrollView>

                        {/* Agreement Acceptance Checkbox */}
                        <View style={styles.checkboxContainer}>
                            <Checkbox.Android
                                status={isAgreementAccepted ? 'checked' : 'unchecked'}
                                onPress={() => setIsAgreementAccepted(!isAgreementAccepted)}
                                color="#70B04F"
                            />
                            <Text style={styles.checkboxLabel}>
                                I have read and understood all the terms and conditions of this agreement and hereby accept them.
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* Submit Button */}
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={[
                        styles.submitButton,
                        !isAgreementAccepted && styles.submitButtonDisabled
                    ]}
                    contentStyle={styles.submitButtonContent}
                    icon="check"
                    disabled={!isAgreementAccepted}
                >
                    Submit Agreement
                </Button>
            </KeyboardAwareScrollView>
        </View>
    );
};

export default AgreementSecond;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#70B04F",
        paddingHorizontal: 16,
        paddingVertical: 14,
        justifyContent: "space-between",
    },
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
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        elevation: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    iconText: {
        marginTop: 4,
        fontSize: 12,
        color: "#2C5EFF",
        fontWeight: "600",
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

        height: 38,
        fontSize: 14,
        paddingHorizontal: 10,

    },
    multilineinput: {
        backgroundColor: '#fff',
        marginBottom: 12,
        fontSize: 14,

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
    agreementContainer: {
        maxHeight: 300,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        backgroundColor: "#FAFAFA",
    },
    agreementText: {
        fontSize: 12,
        lineHeight: 18,
        color: "#455A64",
    },
    agreementHeading: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#D32F2F",
    },
    agreementNote: {
        fontStyle: "italic",
        color: "#FF9800",
        fontWeight: "600",
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    checkboxLabel: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: "#455A64",
    },
});