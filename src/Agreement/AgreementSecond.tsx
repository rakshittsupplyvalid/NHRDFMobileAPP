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
import CustomDateTimePicker from "../CommonComponent/DateTimePicker";
import axios from "axios";
import * as FileSystem from 'expo-file-system';



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
    signature: string;
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
    signature: string;
    pincode: string;
}

const AgreementSecond: React.FC = () => {
    const { state, updateState } = useForm();
    const [statesList, setStatesList] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [commonState, setCommonState] = useState("");
    const [cityState, setCityState] = useState("");



    const route = useRoute();
    const [signatureUri, setSignatureUri] = useState<string | null>(null);
    const { formData, selectedCommodityType, selectedFarmer, selectedVariety, Farmerdistribution, selectedCenterTarget } = route.params as { formData: any, selectedCommodityType: any, selectedFarmer: any, selectedVariety: any, Farmerdistribution: any, selectedCenterTarget: any };
    const navigation = useNavigation<any>();
    const [nomineeSignatureUri, setNomineeSignatureUri] = useState<string | null>(null);
    const [witnessSignatureUri, setWitnessSignatureUri] = useState<string | null>(null);
    const [nomineeDistrictsList, setNomineeDistrictsList] = useState<{ [key: number]: { label: string; value: string }[] }>({});
    const [nomineeCitiesList, setNomineeCitiesList] = useState<{ [key: number]: { label: string; value: string }[] }>({});

    const [witnessDistrictsList, setWitnessDistrictsList] = useState<{ [key: number]: { label: string; value: string }[] }>({});
    const [witnessCitiesList, setWitnessCitiesList] = useState<{ [key: number]: { label: string; value: string }[] }>({});
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
            signature: "",
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
            signature: "",
            pincode: "",
        },
    ]);

    const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);


    useEffect(() => {
        axios
            .get("https://stage-master-backend.epravaha.com/api/State/GetAllStates")
            .then((res) => {
                console.log("📜 States API Raw Response:", res.data);
                const mappedStates = res.data.map((item) => ({
                    label: item.name,
                    value: item.stateCode?.toString(),
                }));
                console.log("✅ Mapped States:", mappedStates);
                setStatesList(mappedStates);
            })
            .catch((err) => console.error("❌ State API Error:", err));
    }, []);

    // // 🏢 Get Districts when state.form.state changes
    // useEffect(() => {
    //     if (commonState) {
    //         console.log("🌐 Selected State Code:", commonState);

    //         axios
    //             .get(
    //                 `https://stage-master-backend.epravaha.com/api/District/GetDistrictsByStateCode/${commonState}`
    //             )
    //             .then((res) => {
    //                 console.log("📜 Districts API Raw Response:", res.data);
    //                 const mappedDistricts = res.data.map((item) => ({
    //                     label: item.name,
    //                     value: item.districtCode?.toString(),
    //                 }));
    //                 console.log("✅ Mapped Districts:", mappedDistricts);
    //                 setDistrictsList(mappedDistricts);
    //             })
    //             .catch((err) => console.error("❌ District API Error:", err));
    //     } else {
    //         setDistrictsList([]);
    //     }
    // }, [commonState]);



    // useEffect(() => {
    //     if (cityState) {
    //         console.log("📌 Selected District ID:", cityState);
    //         axios
    //             .get(
    //                 `https://stage-master-backend.epravaha.com/api/City/GetCityBy${cityState}`
    //             )
    //             .then((res) => {

    //                 const mappedCities = res.data.map((item) => ({
    //                     label: item.name,
    //                     value: item.cityCode?.toString(),
    //                 }));
    //                 setCitiesList(mappedCities);
    //             })
    //             .catch((err) => console.error("❌ Cities API Error:", err));
    //     } else {
    //         setCitiesList([]);
    //     }
    // }, [cityState]);

    const handleStateChange = (value: string, type: "Nominee" | "Witness", index: number) => {
        const selectedLabel = statesList.find((item) => item.value === value)?.label || "";

        if (type === "Nominee") {
            const updatedNominees = [...nominees];
            updatedNominees[index].stateid = value;
            updatedNominees[index].statename = selectedLabel;
            updatedNominees[index].districtid = "";
            updatedNominees[index].districtname = "";
            updatedNominees[index].subdistrictid = "";
            updatedNominees[index].subdistrictname = "";
            setNominees(updatedNominees);

            // Fetch districts for this nominee only
            axios
                .get(`https://stage-master-backend.epravaha.com/api/District/GetDistrictsByStateCode/${value}`)
                .then((res) => {
                    const mappedDistricts = res.data.map((item) => ({
                        label: item.name,
                        value: item.districtCode?.toString(),
                    }));
                    setNomineeDistrictsList(prev => ({ ...prev, [index]: mappedDistricts }));
                    setNomineeCitiesList(prev => ({ ...prev, [index]: [] })); // reset cities
                })
                .catch(err => console.error("Nominee District API Error:", err));
        }

        if (type === "Witness") {
            const updatedWitnesses = [...witnesses];
            updatedWitnesses[index].stateid = value;
            updatedWitnesses[index].statename = selectedLabel;
            updatedWitnesses[index].districtid = "";
            updatedWitnesses[index].districtname = "";
            updatedWitnesses[index].subdistrictid = "";
            updatedWitnesses[index].subdistrictname = "";
            setWitnesses(updatedWitnesses);

            // Fetch districts for this witness only
            axios
                .get(`https://stage-master-backend.epravaha.com/api/District/GetDistrictsByStateCode/${value}`)
                .then((res) => {
                    const mappedDistricts = res.data.map((item) => ({
                        label: item.name,
                        value: item.districtCode?.toString(),
                    }));
                    setWitnessDistrictsList(prev => ({ ...prev, [index]: mappedDistricts }));
                    setWitnessCitiesList(prev => ({ ...prev, [index]: [] })); // reset cities
                })
                .catch(err => console.error("Witness District API Error:", err));
        }
    };

    // ------------------ Nominee District Change ------------------
    const handleDistrictChange = (value: string, type: "Nominee" | "Witness", index: number) => {
        const selectedLabel = (type === "Nominee" ? nomineeDistrictsList[index] : witnessDistrictsList[index])?.find(item => item.value === value)?.label || "";

        if (type === "Nominee") {
            const updatedNominees = [...nominees];
            updatedNominees[index].districtid = value;
            updatedNominees[index].districtname = selectedLabel;
            updatedNominees[index].subdistrictid = "";
            updatedNominees[index].subdistrictname = "";
            setNominees(updatedNominees);

            // Fetch cities for this nominee only
            axios
                .get(`https://stage-master-backend.epravaha.com/api/City/GetCityBy${value}`)
                .then(res => {
                    const mappedCities = res.data.map(item => ({
                        label: item.name,
                        value: item.cityCode?.toString(),
                    }));
                    setNomineeCitiesList(prev => ({ ...prev, [index]: mappedCities }));
                })
                .catch(err => console.error("Nominee City API Error:", err));
        }

        if (type === "Witness") {
            const updatedWitnesses = [...witnesses];
            updatedWitnesses[index].districtid = value;
            updatedWitnesses[index].districtname = selectedLabel;
            updatedWitnesses[index].subdistrictid = "";
            updatedWitnesses[index].subdistrictname = "";
            setWitnesses(updatedWitnesses);

            // Fetch cities for this witness only
            axios
                .get(`https://stage-master-backend.epravaha.com/api/City/GetCityBy${value}`)
                .then(res => {
                    const mappedCities = res.data.map(item => ({
                        label: item.name,
                        value: item.cityCode?.toString(),
                    }));
                    setWitnessCitiesList(prev => ({ ...prev, [index]: mappedCities }));
                })
                .catch(err => console.error("Witness City API Error:", err));
        }
    };

    const handleCityChange = (value: string, type: "Nominee" | "Witness", index: number) => {
        const selectedLabel = citiesList.find((item) => item.value === value)?.label || "";


        if (type === "Nominee") {
            const updatedNominees = [...nominees];
            updatedNominees[index].subdistrictid = value;
            updatedNominees[index].subdistrictname = selectedLabel;
            setNominees(updatedNominees);
        }

        if (type === "Witness") {
            const updatedWitnesses = [...witnesses];
            updatedWitnesses[index].subdistrictid = value;
            updatedWitnesses[index].subdistrictname = selectedLabel;
            setWitnesses(updatedWitnesses);
        }
    };






    // ------------------ Nominee Handlers ------------------
    const updateNominee = (index: number, key: keyof NomineeType, value: string) => {
        const newNominees = [...nominees];
        newNominees[index][key] = value;
        setNominees(newNominees);
    };

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
                signature: "",
                year: "",
                pincode: "",
            },
        ]);
    };

    // ------------------ Witness Handlers ------------------
    const updateWitness = (index: number, key: keyof WitnessType, value: string) => {
        const newWitnesses = [...witnesses];
        newWitnesses[index][key] = value;
        setWitnesses(newWitnesses);
    };

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
                signature: "",
                pincode: "",
            },
        ]);
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
            formData.append("AuthorizedName", state.form.authorizedSignatory  || "");
            formData.append("SeedClass", state.form.SeedClass || "");
            formData.append("CommodityId", selectedCommodityType);
            formData.append("Area", state.form.Area?.toString() ?? "0");
            formData.append("BillNumber", state.form.BillNumber || "");
            formData.append("TagNumber", state.form.TagNumber || "");
            formData.append("LotNumber", state.form.LotNumber || "");
            formData.append("DuringYear", state.form.DuringYear || "");

           
            nominees.forEach((nominee, index) => {
                Object.keys(nominee).forEach((key) => {
                    formData.append(`NomiNee[${index}][${key}]`, nominee[key as keyof NomineeType].toString());
                });
            });

            witnesses.forEach((witness, index) => {
                Object.keys(witness).forEach((key) => {
                    formData.append(`Witness[${index}][${key}]`, witness[key as keyof WitnessType].toString());
                });
            });




        

            for (let [key, value] of (formData as any).entries()) {
                console.log(`📦 ${key}:`, value);
            }

            const token = await retrieveToken();


            const response = await apiClient.post("/api/mobile/agreement", formData);

            // console.log("✅ Submit response:", response.data);

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


    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString(); // TextInput ke liye string me
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
                    <Text style={styles.sectionTitle}>Nominee Details</Text>
                    {nominees.map((nominee, index) => (
                        <Card key={index} style={styles.sectionCard}>
                            <Card.Content>
                                <Text style={styles.sectionSubTitle}>Nominee {index + 1}</Text>

                                <TextInput
                                    mode="outlined"
                                    label="Full Name"
                                    value={nominee.nomineename}
                                    onChangeText={(text) => updateNominee(index, "nomineename", text)}
                                    style={styles.input}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Gender"
                                    value={nominee.gender}
                                    onChangeText={(text) => updateNominee(index, "gender", text)}
                                    style={styles.input}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Age"
                                    keyboardType="numeric"
                                    value={nominee.age}
                                    onChangeText={(text) => updateNominee(index, "age", text)}
                                    style={styles.input}
                                />


                                <Text style={styles.label}>Date of Birth</Text>
                                <CustomDateTimePicker
                                    value={nominee.dob ? new Date(nominee.dob) : new Date()}
                                    onChange={(date) => {
                                        const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
                                        updateNominee(index, "dob", formattedDate);

                                        // Age calculate karke update kar do
                                        const age = calculateAge(formattedDate);
                                        updateNominee(index, "age", age);
                                    }}
                                    mode="date"
                                />

                                <TextInput
                                    mode="outlined"
                                    label="Mobile No"
                                    keyboardType="phone-pad"
                                    value={nominee.mobileno}
                                    onChangeText={(text) => updateNominee(index, "mobileno", text)}
                                    style={styles.input}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Email"
                                    keyboardType="email-address"
                                    value={nominee.email}
                                    onChangeText={(text) => updateNominee(index, "email", text)}
                                    style={styles.input}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Address Line"
                                    value={nominee.addrline}
                                    onChangeText={(text) => updateNominee(index, "addrline", text)}
                                    style={styles.input}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Village Name"
                                    value={nominee.villagename}
                                    onChangeText={(text) => updateNominee(index, "villagename", text)}
                                    style={styles.input}
                                />

                                <TextInput
                                    mode="outlined"
                                    label="Pincode"
                                    keyboardType="numeric"
                                    value={nominee.pincode}
                                    onChangeText={(text) => updateNominee(index, "pincode", text)}
                                    style={styles.input}
                                />

                                {/* State Dropdown */}
                                {/* 🏙️ State Dropdown */}
                                <Text style={styles.label}>State</Text>
                                <CommonPicker
                                    selectedValue={nominee.stateid || ""}
                                    onValueChange={(value) => handleStateChange(value, "Nominee", index)}
                                    items={statesList}
                                />

                                {/* 🏢 District Dropdown */}
                                <Text style={styles.label}>District</Text>
                                <CommonPicker
                                    selectedValue={nominee.districtid || ""}
                                    onValueChange={(value) => handleDistrictChange(value, "Nominee", index)}
                                    items={nomineeDistrictsList[index] || []}
                                />



                                {/* ✅ City Dropdown */}
                                <Text style={styles.label}>City</Text>
                                <CommonPicker
                                    selectedValue={nominee.subdistrictid || ""}
                                    onValueChange={(value) => handleCityChange(value, "Nominee", index)}
                                    items={nomineeCitiesList[index] || []}
                                />





                                <TextInput
                                    mode="outlined"
                                    label="Relation"
                                    value={nominee.relation}
                                    onChangeText={(text) => updateNominee(index, "relation", text)}
                                    style={styles.input}
                                />

                                {/* Signature placeholder */}
                                <TouchableOpacity
                                    style={styles.signatureBtn}
                                    onPress={() => Alert.alert("Signature", "Capture nominee signature here")}
                                >
                                    <MaterialCommunityIcons name="signature-freehand" size={26} color="#2C5EFF" />
                                    <Text>Add Signature</Text>
                                </TouchableOpacity>
                            </Card.Content>
                        </Card>
                    ))}
                    <Button mode="outlined" onPress={addNominee} style={{ marginVertical: 10 }}>
                        Add Another Nominee
                    </Button>
                </Card>

                {/* Witness Section */}
                <Card style={styles.sectionCard}>
                    {/* ----------------- Witnesses ----------------- */}
                    <Text style={styles.sectionTitle}>Witness Details</Text>
                    {witnesses.map((witness, index) => (
                        <Card key={index} style={styles.sectionCard}>
                            <Card.Content>
                                <Text style={styles.sectionSubTitle}>Witness {index + 1}</Text>


                                <Text style={styles.label}>Full Name</Text>
                                <TextInput
                                    mode="outlined"
                                    label="Full Name"
                                    value={witness.witnessname}
                                    onChangeText={(text) => updateWitness(index, "witnessname", text)}
                                    style={styles.input}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Mobile No"
                                    keyboardType="phone-pad"
                                    value={witness.witnessmobileno}
                                    onChangeText={(text) => updateWitness(index, "witnessmobileno", text)}
                                    style={styles.input}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Email"
                                    keyboardType="email-address"
                                    value={witness.witnessemail}
                                    onChangeText={(text) => updateWitness(index, "witnessemail", text)}
                                    style={styles.input}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Address Line"
                                    value={witness.addrline}
                                    onChangeText={(text) => updateWitness(index, "addrline", text)}
                                    style={styles.input}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Pincode"
                                    keyboardType="numeric"
                                    value={witness.pincode}
                                    onChangeText={(text) => updateWitness(index, "pincode", text)}
                                    style={styles.input}
                                />


                                <Text style={styles.label}>State</Text>
                                <CommonPicker
                                    selectedValue={witness.stateid || ""}

                                    onValueChange={(value) => handleStateChange(value, "Witness", index)}
                                    items={statesList}
                                />



                                {/* 🏢 District Dropdown */}
                                <Text style={styles.label}>District</Text>
                                <CommonPicker
                                    selectedValue={witness.districtid || ""}
                                    onValueChange={(value) => handleDistrictChange(value, "Witness", index)}
                                    items={witnessDistrictsList[index] || []}
                                />


                                {/* ✅ City Dropdown */}
                                <Text style={styles.label}>City</Text>
                                <CommonPicker
                                    selectedValue={witness.subdistrictid || ""}
                                    onValueChange={(value) => handleCityChange(value, "Witness", index)}
                                    items={witnessCitiesList[index] || []}
                                />

                                <TextInput
                                    mode="outlined"
                                    label="Village Name"
                                    value={witness.villagename}
                                    onChangeText={(text) => updateWitness(index, "villagename", text)}
                                    style={styles.input}
                                />


                                {/* Signature placeholder */}
                                <TouchableOpacity
                                    style={styles.signatureBtn}
                                    onPress={() => Alert.alert("Signature", "Capture witness signature here")}
                                >
                                    <MaterialCommunityIcons name="signature-freehand" size={26} color="#2C5EFF" />
                                    <Text>Add Signature</Text>
                                </TouchableOpacity>
                            </Card.Content>
                        </Card>
                    ))}
                    <Button mode="outlined" onPress={addWitness} style={{ marginVertical: 10 }}>
                        Add Another Witness
                    </Button>
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
                        {/* <Text style={styles.label}>NHRDF Address</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.nhrdfAddress || "NATIONAL HORTICULTURAL RESEARCH AND DEVELOPMENT FOUNDATION, JANAKPURI, NEW DELHI"}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, nhrdfAddress: text } })}
                            style={styles.input}
                            placeholder="Enter NHRDF address"
                            multiline={true}
                            numberOfLines={2}
                        /> */}

                        {/* Plot Number */}
                        <Text style={styles.label}>Lot Number</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.LotNumber || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, LotNumber: text } })}
                            style={styles.input}
                            placeholder="Enter Lot number"
                        />



                        <Text style={styles.label}>Tag Number</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.TagNumber || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, TagNumber: text } })}
                            style={styles.input}
                            placeholder="Enter Tag number"
                        />


                        <Text style={styles.label}>Bill Number</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.BillNumber || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, BillNumber: text } })}
                            style={styles.input}
                            placeholder="Enter Bill number"
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
                        {/* <Text style={styles.label}>Village/Town</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.nhrdfVillage || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, nhrdfVillage: text } })}
                            style={styles.input}
                            placeholder="Enter village/town"
                        /> */}

                        {/* Post Office */}
                        {/* <Text style={styles.label}>Post Office</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.nhrdfPostOffice || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, nhrdfPostOffice: text } })}
                            style={styles.input}
                            placeholder="Enter post office"
                        /> */}

                        {/* Taluka */}
                        {/* <Text style={styles.label}>Taluka</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.nhrdfTaluka || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, nhrdfTaluka: text } })}
                            style={styles.input}
                            placeholder="Enter taluka"
                        /> */}

                        {/* District */}
                        {/* <Text style={styles.label}>District</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.nhrdfDistrict || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, nhrdfDistrict: text } })}
                            style={styles.input}
                            placeholder="Enter district"
                        /> */}

                        {/* Pincode */}
                        {/* <Text style={styles.label}>Pincode</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.nhrdfPincode || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, nhrdfPincode: text } })}
                            style={styles.input}
                            placeholder="Enter pincode"
                            keyboardType="numeric"
                            maxLength={6}
                        /> */}
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
    signatureBtn: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderWidth: 1,
        borderColor: "#2C5EFF",
        borderRadius: 5,
        marginTop: 10,
    },
});