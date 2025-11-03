import React, { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ScrollView,
    Modal,
    PermissionsAndroid,
    Platform,
    Alert,
    Image,
    TextInput as RNTextInput
} from "react-native";
import { Button, Text, Card, Checkbox, HelperText, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import CommonPicker from "../CommonComponent/CommonDropdown";
import { Onion, Garlic, Potato } from "../Constants/constants";
import { useNavigation } from "@react-navigation/native";
import { Dropdown } from 'react-native-element-dropdown';
import useForm from "../Form/UseForm";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useFormData } from "../Constants/FormContext";
import YearPickerInput from "../CommonComponent/CommonYearPicker";
import { retrieveToken } from '../Service/apiInterceptors'
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BackHandler } from 'react-native';
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
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { formData } = useFormData();
    const { state, updateState } = useForm();

    // Nominees and witnesses state
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

    // State variables
    const [statesList, setStatesList] = useState([]);
    const [nomineeErrors, setNomineeErrors] = useState<{ [key: string]: string }[]>([]);
    const [witnessErrors, setWitnessErrors] = useState<{ [key: string]: string }[]>([]);
    const [formErrors, setFormErrors] = useState({
        authorizedSignatory: '',
        LotNumber: '',
        TagNumber: '',
        BillNumber: '',
        agreement: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nomineeDistrictsList, setNomineeDistrictsList] = useState<{ [key: number]: { label: string; value: string }[] }>({});
    const [nomineeCitiesList, setNomineeCitiesList] = useState<{ [key: number]: { label: string; value: string }[] }>({});
    const [signaturePhoto, setSignaturePhoto] = useState<string | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [witnessDistrictsList, setWitnessDistrictsList] = useState<{ [key: number]: { label: string; value: string }[] }>({});
    const [witnessCitiesList, setWitnessCitiesList] = useState<{ [key: number]: { label: string; value: string }[] }>({});
    const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);

    // ✅ FIXED: Improved signature data handler with functional updates
    useFocusEffect(
        useCallback(() => {
            if (route.params?.signatureData) {
                const { type, signatureUri, signaturePreview, index = 0 } = route.params.signatureData;

                console.log("📝 Received signature data:", {
                    type,
                    index,
                    hasSignature: !!signatureUri,
                    signatureLength: signatureUri?.length
                });

                if (type === 'nominee') {
                    setNominees(prevNominees => {
                        const updatedNominees = [...prevNominees];
                        if (updatedNominees[index]) {
                            updatedNominees[index].signature = signatureUri;
                            console.log("✅ Nominee signature updated at index:", index);
                        }
                        return updatedNominees;
                    });
                } else if (type === 'witness') {
                    setWitnesses(prevWitnesses => {
                        const updatedWitnesses = [...prevWitnesses];
                        if (updatedWitnesses[index]) {
                            updatedWitnesses[index].signature = signatureUri;
                            console.log("✅ Witness signature updated at index:", index);
                        }
                        return updatedWitnesses;
                    });
                }

                // Clear params to avoid reprocessing
                navigation.setParams({ signatureData: null });
            }
        }, [route.params?.signatureData, navigation])
    );

    // Initialize errors when nominees/witnesses are added
    useEffect(() => {
        setNomineeErrors(nominees.map(() => ({})));
    }, [nominees.length]);

    useEffect(() => {
        setWitnessErrors(witnesses.map(() => ({})));
    }, [witnesses.length]);

    // Validation functions
    const isValidEmail = (email: string) => {
        if (!email) return false;
        const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
        return emailPattern.test(email.trim());
    };

    const isValidMobile = (mobile: string) => {
        if (!mobile) return false;
        return /^[6-9]\d{9}$/.test(mobile);
    };

    const isValidName = (name: string) => {
        if (!name) return false;
        return /^[a-zA-Z\s]{1,100}$/.test(name.trim());
    };

    const isValidAddress = (address: string) => {
        const trimmed = address?.trim() || "";
        return trimmed.length >= 1 && trimmed.length <= 200;
    };

    const isValidPincode = (pincode: string) => {
        if (!pincode) return true;
        return /^\d{6}$/.test(pincode);
    };

    const isValidRelation = (relation: string) => {
        if (!relation) return false;
        return /^[a-zA-Z\s]{2,15}$/.test(relation.trim());
    };

    const isValidYear = (year: string) => {
        if (!year) return true;
        const currentYear = new Date().getFullYear();
        const yearNum = parseInt(year);
        return yearNum >= 1900 && yearNum <= currentYear;
    };

    const isValidRequiredField = (value: string) => {
        return value && value.trim().length > 0;
    };

    // Real-time validation functions
    const validateNomineeField = (index: number, field: string, value: string) => {
        const newErrors = [...nomineeErrors];
        let error = '';

        switch (field) {
            case 'nomineename':
                if (!isValidName(value)) {
                    error = 'Name must be 1-100 letters only';
                }
                break;
            case 'mobileno':
                if (!isValidMobile(value)) {
                    error = 'Valid 10-digit mobile number starting with 6-9';
                }
                break;
            case 'email':
                if (value && !isValidEmail(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'relation':
                if (!isValidRelation(value)) {
                    error = 'Relation must be 2-15 letters only';
                }
                break;
            case 'addrline':
                if (!isValidAddress(value)) {
                    error = 'Address must be at least 1 character';
                }
                break;
            case 'pincode':
                if (value && !isValidPincode(value)) {
                    error = 'Pincode must be 6 digits';
                }
                break;
            case 'villagename':
                if (value && !/^[a-zA-Z\s]{1,100}$/.test(value)) {
                    error = 'Village name must be 1-100 letters only';
                }
                break;
            case 'gender':
                if (!value) {
                    error = 'Gender is required';
                }
                break;
            case 'stateid':
                if (!value) {
                    error = 'State is required';
                }
                break;
            case 'districtid':
                if (!value) {
                    error = 'District is required';
                }
                break;
            case 'subdistrictid':
                if (!value) {
                    error = 'City is required';
                }
                break;
            case 'year':
                if (value && !isValidYear(value)) {
                    error = 'Please enter a valid year';
                }
                break;
        }

        newErrors[index] = { ...newErrors[index], [field]: error };
        setNomineeErrors(newErrors);
    };

    const validateWitnessField = (index: number, field: string, value: string) => {
        const newErrors = [...witnessErrors];
        let error = '';

        switch (field) {
            case 'witnessname':
                if (!isValidName(value)) {
                    error = 'Name must be 2-25 letters only';
                }
                break;
            case 'witnessmobileno':
                if (!isValidMobile(value)) {
                    error = 'Valid 10-digit mobile number starting with 6-9';
                }
                break;
            case 'witnessemail':
                if (value && !isValidEmail(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'addrline':
                if (!isValidAddress(value)) {
                    error = 'Address must be at least 1 character';
                }
                break;
            case 'pincode':
                if (value && !isValidPincode(value)) {
                    error = 'Pincode must be 6 digits';
                }
                break;
            case 'villagename':
                if (value && !/^[a-zA-Z\s]{2,25}$/.test(value)) {
                    error = 'Village name must be 2-25 letters only';
                }
                break;
            case 'stateid':
                if (!value) {
                    error = 'State is required';
                }
                break;
            case 'districtid':
                if (!value) {
                    error = 'District is required';
                }
                break;
            case 'subdistrictid':
                if (!value) {
                    error = 'City is required';
                }
                break;
        }

        newErrors[index] = { ...newErrors[index], [field]: error };
        setWitnessErrors(newErrors);
    };

    const validateFormField = (field: string, value: string) => {
        const newErrors = { ...formErrors };
        let error = '';

        switch (field) {
            case 'authorizedSignatory':
                if (!isValidName(value)) {
                    error = 'Name must be 2-20 letters only';
                }
                break;
            case 'LotNumber':
                if (!isValidRequiredField(value)) {
                    error = 'Lot number is required';
                }
                break;
            case 'TagNumber':
                if (!isValidRequiredField(value)) {
                    error = 'Tag number is required';
                }
                break;
            case 'BillNumber':
                if (!isValidRequiredField(value)) {
                    error = 'Bill number is required';
                }
                break;
        }

        newErrors[field] = error;
        setFormErrors(newErrors);
    };

    // Check if all validations pass
    const isFormValid = () => {
        const nomineeValid = nominees.every((nominee, index) => {
            return Object.keys(nomineeErrors[index] || {}).every(key =>
                !nomineeErrors[index][key]
            ) &&
                isValidName(nominee.nomineename) &&
                isValidMobile(nominee.mobileno) &&
                isValidRelation(nominee.relation) &&
                isValidAddress(nominee.addrline) &&
                nominee.gender &&
                nominee.stateid &&
                nominee.districtid &&
                nominee.subdistrictid &&
                (!nominee.email || isValidEmail(nominee.email)) &&
                (!nominee.pincode || isValidPincode(nominee.pincode)) &&
                (!nominee.villagename || /^[a-zA-Z\s]{2,25}$/.test(nominee.villagename)) &&
                (!nominee.year || isValidYear(nominee.year));
        });

        const witnessValid = witnesses.every((witness, index) => {
            return Object.keys(witnessErrors[index] || {}).every(key =>
                !witnessErrors[index][key]
            ) &&
                isValidName(witness.witnessname) &&
                isValidMobile(witness.witnessmobileno) &&
                isValidAddress(witness.addrline) &&
                witness.stateid &&
                witness.districtid &&
                witness.subdistrictid &&
                (!witness.witnessemail || isValidEmail(witness.witnessemail)) &&
                (!witness.pincode || isValidPincode(witness.pincode)) &&
                (!witness.villagename || /^[a-zA-Z\s]{2,25}$/.test(witness.villagename));
        });

        const formValid =
            isValidName(state.form.authorizedSignatory || '') &&
            isValidRequiredField(state.form.LotNumber || '') &&
            isValidRequiredField(state.form.TagNumber || '') &&
            isValidRequiredField(state.form.BillNumber || '') &&
            isAgreementAccepted;

        return nomineeValid && witnessValid && formValid;
    };

    // Back handler
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate("Agreement Form" as never);
                return true;
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress
            );

            return () => subscription.remove();
        }, [navigation])
    );

    // Camera permission and functions
    const requestCameraPermission = async () => {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Camera Permission",
                        message: "App needs access to your camera to take pictures.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK",
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const openCamera = async (setPhoto: (uri: string | null) => void) => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert("Permission Denied", "Camera permission is required.");
            return;
        }

        const options: CameraOptions = {
            mediaType: "photo",
            cameraType: "back",
            includeBase64: false,
            saveToPhotos: true,
        };

        launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log("User cancelled image picker");
            } else if (response.errorCode) {
                console.log("ImagePicker Error: ", response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const uri = response.assets[0].uri;
                console.log("Captured image:", uri);
                setPhoto(uri || null);
            }
        });
    };

    // API calls for states, districts, cities
    useEffect(() => {
        axios
            .get("https://stage-master-backend.epravaha.com/api/State/GetAllStates")
            .then((res) => {
                const mappedStates = res.data.map((item) => ({
                    label: item.name,
                    value: item.stateCode?.toString(),
                }));
                setStatesList(mappedStates);
            })
            .catch((err) => console.error("❌ State API Error:", err));
    }, []);

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
            validateNomineeField(index, 'stateid', value);

            axios
                .get(`https://stage-master-backend.epravaha.com/api/District/GetDistrictsByStateCode/${value}`)
                .then((res) => {
                    const mappedDistricts = res.data.map((item) => ({
                        label: item.name,
                        value: item.districtCode?.toString(),
                    }));
                    setNomineeDistrictsList((prev) => ({ ...prev, [index]: mappedDistricts }));
                    setNomineeCitiesList((prev) => ({ ...prev, [index]: [] }));
                })
                .catch((err) => console.error("❌ Nominee District API Error:", err));
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
            validateWitnessField(index, 'stateid', value);

            axios
                .get(`https://stage-master-backend.epravaha.com/api/District/GetDistrictsByStateCode/${value}`)
                .then((res) => {
                    const mappedDistricts = res.data.map((item) => ({
                        label: item.name,
                        value: item.districtCode?.toString(),
                    }));
                    setWitnessDistrictsList((prev) => ({ ...prev, [index]: mappedDistricts }));
                    setWitnessCitiesList((prev) => ({ ...prev, [index]: [] }));
                })
                .catch((err) => console.error("❌ Witness District API Error:", err));
        }
    };

    const handleDistrictChange = (value: string, type: "Nominee" | "Witness", index: number) => {
        const selectedLabel =
            (type === "Nominee"
                ? nomineeDistrictsList[index]
                : witnessDistrictsList[index]
            )?.find((item) => item.value === value)?.label || "";

        if (type === "Nominee") {
            const updatedNominees = [...nominees];
            updatedNominees[index].districtid = value;
            updatedNominees[index].districtname = selectedLabel;
            updatedNominees[index].subdistrictid = "";
            updatedNominees[index].subdistrictname = "";
            setNominees(updatedNominees);
            validateNomineeField(index, 'districtid', value);

            axios
                .get(`https://stage-master-backend.epravaha.com/api/City/GetCityBy/${value}`)
                .then((res) => {
                    const mappedCities = res.data.map((item) => ({
                        label: item.name,
                        value: item.cityCode?.toString(),
                    }));
                    setNomineeCitiesList((prev) => ({ ...prev, [index]: mappedCities }));
                })
                .catch((err) => console.error("❌ Nominee City API Error:", err));
        }

        if (type === "Witness") {
            const updatedWitnesses = [...witnesses];
            updatedWitnesses[index].districtid = value;
            updatedWitnesses[index].districtname = selectedLabel;
            updatedWitnesses[index].subdistrictid = "";
            updatedWitnesses[index].subdistrictname = "";
            setWitnesses(updatedWitnesses);
            validateWitnessField(index, 'districtid', value);

            axios
                .get(`https://stage-master-backend.epravaha.com/api/City/GetCityBy${value}`)
                .then((res) => {
                    const mappedCities = res.data.map((item) => ({
                        label: item.name,
                        value: item.cityCode?.toString(),
                    }));
                    setWitnessCitiesList((prev) => ({ ...prev, [index]: mappedCities }));
                })
                .catch((err) => console.error("❌ Witness City API Error:", err));
        }
    };

    const handleCityChange = (value: string, type: "Nominee" | "Witness", index: number) => {
        const currentCityList = type === "Nominee" ? nomineeCitiesList[index] : witnessCitiesList[index];
        const selectedLabel = currentCityList?.find((item) => item.value === value)?.label || "";

        if (type === "Nominee") {
            const updatedNominees = [...nominees];
            updatedNominees[index].subdistrictid = value;
            updatedNominees[index].subdistrictname = selectedLabel;
            setNominees(updatedNominees);
            validateNomineeField(index, 'subdistrictid', value);
        } else if (type === "Witness") {
            const updatedWitnesses = [...witnesses];
            updatedWitnesses[index].subdistrictid = value;
            updatedWitnesses[index].subdistrictname = selectedLabel;
            setWitnesses(updatedWitnesses);
            validateWitnessField(index, 'subdistrictid', value);
        }
    };

    const updateNominee = (index: number, key: keyof NomineeType, value: string) => {
        const newNominees = [...nominees];

        if (key === "dob") {
            newNominees[index][key] = value as any;
        } else if (key === "year") {
            const numericYear = value.replace(/[^0-9]/g, "").slice(0, 4);
            newNominees[index][key] = numericYear as any;
        } else {
            newNominees[index][key] = value as any;
        }

        setNominees(newNominees);
        validateNomineeField(index, key, value);
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

    const deleteNominee = (index: number) => {
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
                        const updatedErrors = nomineeErrors.filter((_, i) => i !== index);
                        setNomineeErrors(updatedErrors);
                    },
                },
            ]
        );
    };

    const updateWitness = (index: number, key: keyof WitnessType, value: string) => {
        const newWitnesses = [...witnesses];
        newWitnesses[index][key] = value;
        setWitnesses(newWitnesses);
        validateWitnessField(index, key, value);
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

    const deleteWitness = (index: number) => {
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
                        const updatedErrors = witnessErrors.filter((_, i) => i !== index);
                        setWitnessErrors(updatedErrors);
                    },
                },
            ]
        );
    };

    // Signature navigation handlers
    const handleNomineeSignature = (index: number) => {
        navigation.navigate("Signature", {
            type: "nominee",
            index
        });
    };

    const handleWitnessSignature = (index: number) => {
        navigation.navigate("Signature", {
            type: "witness",
            index
        });
    };

    // ✅ FIXED: COMPLETELY REWRITTEN handleSubmit function
    const handleSubmit = async () => {
        if (!isFormValid()) {
            Alert.alert(
                "Validation Error",
                "Please fix all validation errors before submitting."
            );
            return;
        }

        if (!isAgreementAccepted) {
            Alert.alert(
                "Agreement Required",
                "Please read and accept the agreement terms before submitting."
            );
            return;
        }

        console.log("🚀 Starting form submission...");
        setIsSubmitting(true);

        try {
            const requestData = new FormData();

            // Append main contextual data
            requestData.append("CenterTargetId", formData?.selectedCenterTarget || "");
            requestData.append("FarmerDistributionId", formData?.Farmerdistribution || "");
            requestData.append("FarmerId", formData?.selectedFarmer || "");
            requestData.append("VarietyId", formData?.selectedVariety || "");
            requestData.append("DuringYear", formData?.Year?.toString() || "");
            requestData.append("SeedClass", formData?.seeds?.toString() || "");
            requestData.append("CommodityId", formData?.selectedCommodityType?.toString() || "");
            requestData.append("PlantingMaterial", formData?.produceseeds?.toString() || "");
            requestData.append("Area", formData?.Area || "0");

            // Append Agreement form fields
            requestData.append("AuthorizedName", state.form.authorizedSignatory || "");
            requestData.append("BillNumber", state.form.BillNumber || "");
            requestData.append("TagNumber", state.form.TagNumber || "");
            requestData.append("LotNumber", state.form.LotNumber || "");
            requestData.append("DuringYear", state.form.DuringYear || "");

            // ✅ FIXED: Append main signature and profile photos
            if (signaturePhoto) {
                const signatureFile = {
                    uri: signaturePhoto,
                    type: "image/jpeg",
                    name: "signature.jpg",
                };
                requestData.append("Signature", signatureFile as any);
                console.log("✅ Main signature appended");
            }

            if (profilePhoto) {
                const profileFile = {
                    uri: profilePhoto,
                    type: "image/jpeg",
                    name: "profile.jpg",
                };
                requestData.append("ProfFile", profileFile as any);
                console.log("✅ Profile photo appended");
            }

            // ✅ FIXED: Append nominees with PROPER signature handling
            nominees.forEach((nominee, index) => {
                console.log(`📝 Processing nominee ${index} with signature:`, nominee.signature ? `YES (${nominee.signature.length} chars)` : "NO");

                // Append all regular fields
                requestData.append(`NomiNee[${index}][nomineename]`, nominee.nomineename || "");
                requestData.append(`NomiNee[${index}][gender]`, nominee.gender || "");
                requestData.append(`NomiNee[${index}][age]`, nominee.age || "");
                requestData.append(`NomiNee[${index}][dob]`, nominee.dob || "");
                requestData.append(`NomiNee[${index}][mobileno]`, nominee.mobileno || "");
                requestData.append(`NomiNee[${index}][email]`, nominee.email || "");
                requestData.append(`NomiNee[${index}][addrline]`, nominee.addrline || "");
                requestData.append(`NomiNee[${index}][villageid]`, nominee.villageid || "");
                requestData.append(`NomiNee[${index}][villagename]`, nominee.villagename || "");
                requestData.append(`NomiNee[${index}][districtid]`, nominee.districtid || "");
                requestData.append(`NomiNee[${index}][districtname]`, nominee.districtname || "");
                requestData.append(`NomiNee[${index}][subdistrictid]`, nominee.subdistrictid || "");
                requestData.append(`NomiNee[${index}][subdistrictname]`, nominee.subdistrictname || "");
                requestData.append(`NomiNee[${index}][stateid]`, nominee.stateid || "");
                requestData.append(`NomiNee[${index}][statename]`, nominee.statename || "");
                requestData.append(`NomiNee[${index}][relation]`, nominee.relation || "");
                requestData.append(`NomiNee[${index}][profdocument]`, nominee.profdocument || "");
                requestData.append(`NomiNee[${index}][year]`, nominee.year || "");
                requestData.append(`NomiNee[${index}][pincode]`, nominee.pincode || "");

                // ✅ FIXED: Handle signature as FILE object
                if (nominee.signature) {
                    try {
                        const signatureFile = {
                            uri: `data:image/png;base64,${nominee.signature}`,
                            type: "image/png",
                            name: `nominee_signature_${index}.png`,
                        };
                        requestData.append(`NomiNee[${index}][signature]`, signatureFile as any);
                        console.log(`✅ Nominee ${index} signature appended successfully`);
                    } catch (error) {
                        console.error(`❌ Error appending nominee ${index} signature:`, error);
                        requestData.append(`NomiNee[${index}][signature]`, "");
                    }
                } else {
                    requestData.append(`NomiNee[${index}][signature]`, "");
                    console.log(`❌ No signature for nominee ${index}`);
                }
            });

            // ✅ FIXED: Append witnesses with PROPER signature handling
            witnesses.forEach((witness, index) => {
                console.log(`📝 Processing witness ${index} with signature:`, witness.signature ? `YES (${witness.signature.length} chars)` : "NO");

                // Append all regular fields
                requestData.append(`Witness[${index}][witnessname]`, witness.witnessname || "");
                requestData.append(`Witness[${index}][witnessmobileno]`, witness.witnessmobileno || "");
                requestData.append(`Witness[${index}][witnessemail]`, witness.witnessemail || "");
                requestData.append(`Witness[${index}][addrline]`, witness.addrline || "");
                requestData.append(`Witness[${index}][villageid]`, witness.villageid || "");
                requestData.append(`Witness[${index}][villagename]`, witness.villagename || "");
                requestData.append(`Witness[${index}][districtid]`, witness.districtid || "");
                requestData.append(`Witness[${index}][districtname]`, witness.districtname || "");
                requestData.append(`Witness[${index}][subdistrictid]`, witness.subdistrictid || "");
                requestData.append(`Witness[${index}][subdistrictname]`, witness.subdistrictname || "");
                requestData.append(`Witness[${index}][stateid]`, witness.stateid || "");
                requestData.append(`Witness[${index}][statename]`, witness.statename || "");
                requestData.append(`Witness[${index}][profdocument]`, witness.profdocument || "");
                requestData.append(`Witness[${index}][pincode]`, witness.pincode || "");

                // ✅ FIXED: Handle signature as FILE object
                if (witness.signature) {
                    try {
                        const signatureFile = {
                            uri: `data:image/png;base64,${witness.signature}`,
                            type: "image/png",
                            name: `witness_signature_${index}.png`,
                        };
                        requestData.append(`Witness[${index}][signature]`, signatureFile as any);
                        console.log(`✅ Witness ${index} signature appended successfully`);
                    } catch (error) {
                        console.error(`❌ Error appending witness ${index} signature:`, error);
                        requestData.append(`Witness[${index}][signature]`, "");
                    }
                } else {
                    requestData.append(`Witness[${index}][signature]`, "");
                    console.log(`❌ No signature for witness ${index}`);
                }
            });

            // Debug: Log FormData contents
            console.log("📤 Final FormData contents:");
            console.log("Nominees count:", nominees.length);
            console.log("Witnesses count:", witnesses.length);
            console.log("Main signature:", signaturePhoto ? "✅ Present" : "❌ Missing");
            console.log("Profile photo:", profilePhoto ? "✅ Present" : "❌ Missing");

            const token = await retrieveToken();
            console.log("🔑 Token retrieved, making API call...");

            const response = await apiClient.post("/api/mobile/agreement", requestData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },

            });

            console.log("✅ API Response Status:", response.status);
            console.log("✅ API Response Data:", response.data);

            if (response.status === 200 || response.status === 201) {
                Alert.alert("✅ Success", "Agreement submitted successfully!", [
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
                Alert.alert("❌ Error", "Submission failed with status: " + response.status);
            }
        } catch (error: any) {
            console.error("❌ Submit error:", error);
            console.error("❌ Error response:", error.response?.data);
            console.error("❌ Error message:", error.message);

            Alert.alert(
                "Submission Failed",
                error.response?.data?.message || error.message || "Please check your connection and try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (date: Date) => {
        const d = date.getDate().toString().padStart(2, "0");
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const y = date.getFullYear();
        return `${d}-${m}-${y}`;
    };

    const calculateAge = (dob: string) => {
        const [day, month, year] = dob.split("-").map(Number);
        const birthDate = new Date(year, month - 1, day);

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Render commodity dropdown
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
            default:
                return null;
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate("Agreement Form" as never)}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Nominee & Witness Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAwareScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                enableOnAndroid={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                enableResetScrollToCoords={false}
                bounces={false}
                overScrollMode="never"
            >
                {/* Nominee Section */}
                <Card style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Nominee Details</Text>
                    {nominees.map((nominee, index) => (
                        <Card key={index} style={styles.innerCard}>
                            <Card.Content>
                                <Text style={styles.sectionSubTitle}>Nominee {index + 1}</Text>

                                <Text style={styles.label}>Name</Text>
                                <RNTextInput
                                    placeholder="Full Name"
                                    value={nominee.nomineename}
                                    onChangeText={(text) => updateNominee(index, "nomineename", text)}
                                    style={[
                                        styles.simpleInput,
                                        nomineeErrors[index]?.nomineename && styles.inputError
                                    ]}
                                    maxLength={25}
                                />
                                {nomineeErrors[index]?.nomineename ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.nomineename}>
                                        {nomineeErrors[index]?.nomineename}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Gender</Text>
                                <Dropdown
                                    style={[styles.dropdown, nomineeErrors[index]?.gender && styles.dropdownError]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    data={[
                                        { label: "Male", value: "Male" },
                                        { label: "Female", value: "Female" },
                                        { label: "Other", value: "Other" },
                                    ]}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select Gender"
                                    value={nominee.gender}
                                    onChange={(item) => updateNominee(index, "gender", item.value)}
                                />
                                {nomineeErrors[index]?.gender ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.gender}>
                                        {nomineeErrors[index]?.gender}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Year</Text>
                                <YearPickerInput
                                    value={nominee.year}
                                    onChange={(year) => updateNominee(index, "year", year)}
                                />
                                {nomineeErrors[index]?.year ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.year}>
                                        {nomineeErrors[index]?.year}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Date of Birth</Text>
                                <CustomDateTimePicker
                                    value={
                                        nominee.dob
                                            ? new Date(nominee.dob.split("-").reverse().join("-"))
                                            : null
                                    }
                                    onChange={(date) => {
                                        const formatted = formatDate(date);
                                        updateNominee(index, "dob", formatted);
                                        const age = calculateAge(formatted);
                                        updateNominee(index, "age", age.toString());
                                    }}
                                    mode="date"
                                />

                                <Text style={styles.label}>Mobile number</Text>
                                <RNTextInput
                                    placeholder="Mobile Number"
                                    keyboardType="phone-pad"
                                    value={nominee.mobileno}
                                    onChangeText={(text) => {
                                        const numericText = text.replace(/[^0-9]/g, "");
                                        updateNominee(index, "mobileno", numericText);
                                    }}
                                    style={[
                                        styles.simpleInput,
                                        nomineeErrors[index]?.mobileno && styles.inputError
                                    ]}
                                    maxLength={10}
                                />
                                {nomineeErrors[index]?.mobileno ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.mobileno}>
                                        {nomineeErrors[index]?.mobileno}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Email Address</Text>
                                <RNTextInput
                                    placeholder="Email Address"
                                    keyboardType="email-address"
                                    value={nominee.email}
                                    onChangeText={(text) => updateNominee(index, "email", text)}
                                    style={[
                                        styles.simpleInput,
                                        nomineeErrors[index]?.email && styles.inputError
                                    ]}
                                    maxLength={50}
                                />
                                {nomineeErrors[index]?.email ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.email}>
                                        {nomineeErrors[index]?.email}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Relation</Text>
                                <RNTextInput
                                    placeholder="Relation"
                                    value={nominee.relation}
                                    onChangeText={(text) => updateNominee(index, "relation", text)}
                                    style={[
                                        styles.simpleInput,
                                        nomineeErrors[index]?.relation && styles.inputError
                                    ]}
                                    maxLength={15}
                                />
                                {nomineeErrors[index]?.relation ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.relation}>
                                        {nomineeErrors[index]?.relation}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Address Line</Text>
                                <RNTextInput
                                    placeholder="Address Line"
                                    value={nominee.addrline}
                                    onChangeText={(text) => updateNominee(index, "addrline", text)}
                                    style={[
                                        styles.simpleInput,
                                        nomineeErrors[index]?.addrline && styles.inputError
                                    ]}
                                    maxLength={50}
                                />
                                {nomineeErrors[index]?.addrline ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.addrline}>
                                        {nomineeErrors[index]?.addrline}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Village Name</Text>
                                <RNTextInput
                                    placeholder="Village Name"
                                    value={nominee.villagename}
                                    onChangeText={(text) => updateNominee(index, "villagename", text)}
                                    style={[
                                        styles.simpleInput,
                                        nomineeErrors[index]?.villagename && styles.inputError
                                    ]}
                                    maxLength={25}
                                />
                                {nomineeErrors[index]?.villagename ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.villagename}>
                                        {nomineeErrors[index]?.villagename}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Pincode</Text>
                                <RNTextInput
                                    placeholder="Pincode"
                                    keyboardType="numeric"
                                    value={nominee.pincode}
                                    onChangeText={(text) => updateNominee(index, "pincode", text)}
                                    style={[
                                        styles.simpleInput,
                                        nomineeErrors[index]?.pincode && styles.inputError
                                    ]}
                                    maxLength={6}
                                />
                                {nomineeErrors[index]?.pincode ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.pincode}>
                                        {nomineeErrors[index]?.pincode}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>State</Text>
                                <CommonPicker
                                    selectedValue={nominee.stateid || ""}
                                    onValueChange={(value) => handleStateChange(value, "Nominee", index)}
                                    items={statesList}
                                />
                                {nomineeErrors[index]?.stateid ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.stateid}>
                                        {nomineeErrors[index]?.stateid}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>District</Text>
                                <CommonPicker
                                    selectedValue={nominee.districtid || ""}
                                    onValueChange={(value) => handleDistrictChange(value, "Nominee", index)}
                                    items={nomineeDistrictsList[index] || []}
                                />
                                {nomineeErrors[index]?.districtid ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.districtid}>
                                        {nomineeErrors[index]?.districtid}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>City</Text>
                                <CommonPicker
                                    selectedValue={nominee.subdistrictid || ""}
                                    onValueChange={(value) => handleCityChange(value, "Nominee", index)}
                                    items={nomineeCitiesList[index] || []}
                                />
                                {nomineeErrors[index]?.subdistrictid ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.subdistrictid}>
                                        {nomineeErrors[index]?.subdistrictid}
                                    </HelperText>
                                ) : null}

                                {/* Signature Preview */}
                                <View style={{ marginVertical: 10, alignItems: "center" }}>
                                    <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Signature:</Text>
                                    {nominee.signature ? (
                                        <Image
                                            source={{ uri: `data:image/png;base64,${nominee.signature}` }}
                                            style={{
                                                width: 200,
                                                height: 80,
                                                borderWidth: 1,
                                                borderColor: "#ccc",
                                                backgroundColor: 'white'
                                            }}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <Text style={{ color: '#666', fontStyle: 'italic' }}>
                                            No signature added
                                        </Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => handleNomineeSignature(index)}
                                >
                                    <MaterialCommunityIcons name="signature-freehand" size={26} color="#2C5EFF" />
                                    <Text>Add Nominee Signature</Text>
                                </TouchableOpacity>

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
                        <Card key={index} style={styles.innerCard}>
                            <Card.Content>
                                <Text style={styles.sectionSubTitle}>Witness {index + 1}</Text>

                                <Text style={styles.label}>Name</Text>
                                <RNTextInput
                                    placeholder="Full Name"
                                    value={witness.witnessname}
                                    onChangeText={(text) => updateWitness(index, "witnessname", text)}
                                    style={[
                                        styles.simpleInput,
                                        witnessErrors[index]?.witnessname && styles.inputError
                                    ]}
                                    maxLength={25}
                                />
                                {witnessErrors[index]?.witnessname ? (
                                    <HelperText type="error" visible={!!witnessErrors[index]?.witnessname}>
                                        {witnessErrors[index]?.witnessname}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Mobile Number</Text>
                                <RNTextInput
                                    placeholder="Mobile Number"
                                    keyboardType="phone-pad"
                                    value={witness.witnessmobileno}
                                    onChangeText={(text) => {
                                        const numericText = text.replace(/[^0-9]/g, "");
                                        updateWitness(index, "witnessmobileno", numericText);
                                    }}
                                    style={[
                                        styles.simpleInput,
                                        witnessErrors[index]?.witnessmobileno && styles.inputError
                                    ]}
                                    maxLength={10}
                                />
                                {witnessErrors[index]?.witnessmobileno ? (
                                    <HelperText type="error" visible={!!witnessErrors[index]?.witnessmobileno}>
                                        {witnessErrors[index]?.witnessmobileno}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Email Address</Text>
                                <RNTextInput
                                    placeholder="Email Address"
                                    keyboardType="email-address"
                                    value={witness.witnessemail}
                                    onChangeText={(text) => updateWitness(index, "witnessemail", text)}
                                    style={[
                                        styles.simpleInput,
                                        witnessErrors[index]?.witnessemail && styles.inputError
                                    ]}
                                    maxLength={50}
                                />
                                {witnessErrors[index]?.witnessemail ? (
                                    <HelperText type="error" visible={!!witnessErrors[index]?.witnessemail}>
                                        {witnessErrors[index]?.witnessemail}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Address</Text>
                                <RNTextInput
                                    placeholder="Address Line"
                                    value={witness.addrline}
                                    onChangeText={(text) => updateWitness(index, "addrline", text)}
                                    style={[
                                        styles.simpleInput,
                                        witnessErrors[index]?.addrline && styles.inputError
                                    ]}
                                    maxLength={50}
                                />
                                {witnessErrors[index]?.addrline ? (
                                    <HelperText type="error" visible={!!witnessErrors[index]?.addrline}>
                                        {witnessErrors[index]?.addrline}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Pincode</Text>
                                <RNTextInput
                                    placeholder="Pincode"
                                    keyboardType="numeric"
                                    value={witness.pincode}
                                    onChangeText={(text) => updateWitness(index, "pincode", text)}
                                    style={[
                                        styles.simpleInput,
                                        witnessErrors[index]?.pincode && styles.inputError
                                    ]}
                                    maxLength={6}
                                />
                                {witnessErrors[index]?.pincode ? (
                                    <HelperText type="error" visible={!!witnessErrors[index]?.pincode}>
                                        {witnessErrors[index]?.pincode}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>State</Text>
                                <CommonPicker
                                    selectedValue={witness.stateid || ""}
                                    onValueChange={(value) => handleStateChange(value, "Witness", index)}
                                    items={statesList}
                                />
                                {witnessErrors[index]?.stateid ? (
                                    <HelperText type="error" visible={!!witnessErrors[index]?.stateid}>
                                        {witnessErrors[index]?.stateid}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>District</Text>
                                <CommonPicker
                                    selectedValue={witness.districtid || ""}
                                    onValueChange={(value) => handleDistrictChange(value, "Witness", index)}
                                    items={witnessDistrictsList[index] || []}
                                />
                                {witnessErrors[index]?.districtid ? (
                                    <HelperText type="error" visible={!!witnessErrors[index]?.districtid}>
                                        {witnessErrors[index]?.districtid}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>City</Text>
                                <CommonPicker
                                    selectedValue={witness.subdistrictid || ""}
                                    onValueChange={(value) => handleCityChange(value, "Witness", index)}
                                    items={witnessCitiesList[index] || []}
                                />
                                {witnessErrors[index]?.subdistrictid ? (
                                    <HelperText type="error" visible={!!witnessErrors[index]?.subdistrictid}>
                                        {witnessErrors[index]?.subdistrictid}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Village name</Text>
                                <RNTextInput
                                    placeholder="Village Name"
                                    value={witness.villagename}
                                    onChangeText={(text) => updateWitness(index, "villagename", text)}
                                    style={[
                                        styles.simpleInput,
                                        witnessErrors[index]?.villagename && styles.inputError
                                    ]}
                                    maxLength={25}
                                />
                                {witnessErrors[index]?.villagename ? (
                                    <HelperText type="error" visible={!!witnessErrors[index]?.villagename}>
                                        {witnessErrors[index]?.villagename}
                                    </HelperText>
                                ) : null}

                                {/* Signature Preview */}
                                <View style={{ marginVertical: 10, alignItems: "center" }}>
                                    <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Signature:</Text>
                                    {witness.signature ? (
                                        <Image
                                            source={{ uri: `data:image/png;base64,${witness.signature}` }}
                                            style={{
                                                width: 200,
                                                height: 80,
                                                borderWidth: 1,
                                                borderColor: "#ccc",
                                                backgroundColor: 'white'
                                            }}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <Text style={{ color: '#666', fontStyle: 'italic' }}>
                                            No signature added
                                        </Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => handleWitnessSignature(index)}
                                >
                                    <MaterialCommunityIcons name="signature-freehand" size={26} color="#335ff0ff" />
                                    <Text>Add Witness Signature</Text>
                                </TouchableOpacity>

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

                {/* Signature & Profile Section */}
                <Card style={styles.signatureCard}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>Signature & Profile Verification</Text>
                        <Divider style={styles.divider} />

                        <View style={styles.photoGrid}>
                            <View style={styles.photoBlock}>
                                <View style={styles.photoHeader}>
                                    <MaterialIcons name="gesture" size={22} color="#007AFF" />
                                    <Text style={styles.photoLabel}>Signature</Text>
                                </View>

                                {signaturePhoto ? (
                                    <Image source={{ uri: signaturePhoto }} style={styles.previewImage} />
                                ) : (
                                    <View style={styles.emptyBox}>
                                        <MaterialIcons name="border-color" size={28} color="#999" />
                                        <Text style={styles.emptyText}>No Signature Added</Text>
                                    </View>
                                )}

                                <Button
                                    mode="contained"
                                    onPress={() => openCamera(setSignaturePhoto)}
                                    icon={() => <MaterialIcons name="edit" size={20} color="#fff" />}
                                    style={styles.actionButton}
                                    contentStyle={styles.buttonContent}
                                >
                                    Capture Signature
                                </Button>
                            </View>

                            <View style={styles.photoBlock}>
                                <View style={styles.photoHeader}>
                                    <MaterialIcons name="person" size={22} color="#007AFF" />
                                    <Text style={styles.photoLabel}>Profile</Text>
                                </View>

                                {profilePhoto ? (
                                    <Image source={{ uri: profilePhoto }} style={styles.previewImage} />
                                ) : (
                                    <View style={styles.emptyBox}>
                                        <MaterialIcons name="photo-camera" size={28} color="#999" />
                                        <Text style={styles.emptyText}>No Profile Photo</Text>
                                    </View>
                                )}

                                <Button
                                    mode="contained"
                                    onPress={() => openCamera(setProfilePhoto)}
                                    icon={() => <MaterialIcons name="photo-camera" size={20} color="#fff" />}
                                    style={[styles.actionButton, styles.profileButton]}
                                    contentStyle={styles.buttonContent}
                                >
                                    Capture Profile
                                </Button>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Commodity Dropdown */}
                {renderCommodityDropdown()}

                {/* NHRDF Authorized Signatory Section */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>NHRDF Authorized Signatory</Text>

                        <Text style={styles.label}>Authorized Signatory Name</Text>
                        <RNTextInput
                            placeholder="Authorized Signatory Name"
                            value={state.form.authorizedSignatory || ""}
                            onChangeText={(text) => {
                                updateState({ ...state, form: { ...state.form, authorizedSignatory: text } });
                                validateFormField('authorizedSignatory', text);
                            }}
                            style={[
                                styles.simpleInput,
                                formErrors.authorizedSignatory && styles.inputError
                            ]}
                            maxLength={20}
                        />
                        {formErrors.authorizedSignatory ? (
                            <HelperText type="error" visible={!!formErrors.authorizedSignatory}>
                                {formErrors.authorizedSignatory}
                            </HelperText>
                        ) : null}

                        <Text style={styles.label}>Lot Number</Text>
                        <RNTextInput
                            placeholder="Lot Number"
                            value={state.form.LotNumber || ""}
                            onChangeText={(text) => {
                                updateState({ ...state, form: { ...state.form, LotNumber: text } });
                                validateFormField('LotNumber', text);
                            }}
                            style={[
                                styles.simpleInput,
                                formErrors.LotNumber && styles.inputError
                            ]}
                            maxLength={50}
                        />
                        {formErrors.LotNumber ? (
                            <HelperText type="error" visible={!!formErrors.LotNumber}>
                                {formErrors.LotNumber}
                            </HelperText>
                        ) : null}

                        <Text style={styles.label}>Tag Number</Text>
                        <RNTextInput
                            placeholder="Tag Number"
                            value={state.form.TagNumber || ""}
                            onChangeText={(text) => {
                                updateState({ ...state, form: { ...state.form, TagNumber: text } });
                                validateFormField('TagNumber', text);
                            }}
                            style={[
                                styles.simpleInput,
                                formErrors.TagNumber && styles.inputError
                            ]}
                            maxLength={50}
                        />
                        {formErrors.TagNumber ? (
                            <HelperText type="error" visible={!!formErrors.TagNumber}>
                                {formErrors.TagNumber}
                            </HelperText>
                        ) : null}

                        <Text style={styles.label}>Bill Number</Text>
                        <RNTextInput
                            placeholder="Bill Number"
                            value={state.form.BillNumber || ""}
                            onChangeText={(text) => {
                                updateState({ ...state, form: { ...state.form, BillNumber: text } });
                                validateFormField('BillNumber', text);
                            }}
                            style={[
                                styles.simpleInput,
                                formErrors.BillNumber && styles.inputError
                            ]}
                            maxLength={50}
                        />
                        {formErrors.BillNumber ? (
                            <HelperText type="error" visible={!!formErrors.BillNumber}>
                                {formErrors.BillNumber}
                            </HelperText>
                        ) : null}
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
                        {!isAgreementAccepted && (
                            <HelperText type="error" visible={!isAgreementAccepted}>
                                Please accept the agreement terms to continue
                            </HelperText>
                        )}
                    </Card.Content>
                </Card>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={[
                        styles.submitButton,
                        (!isFormValid() || isSubmitting) && styles.submitButtonDisabled,
                    ]}
                    contentStyle={styles.submitButtonContent}
                    icon="check"
                    disabled={!isFormValid() || isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit Agreement"}
                </Button>
            </KeyboardAwareScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#70B04F",
        paddingHorizontal: 16,
        paddingVertical: 14,
        justifyContent: "space-between",
    },
    sectionSubTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
        color: "#455A64"
    },
    innerCard: {
        marginBottom: 12,
        borderRadius: 8,
        elevation: 1,
        backgroundColor: "#fff",
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
        flexGrow: 1,
        padding: 16,
        paddingBottom: 30,
    },
    sectionCard: {
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2,
        backgroundColor: "white",
    },
    signatureCard: {
        borderRadius: 16,
        elevation: 4,
        backgroundColor: "#fdfdfd",
        marginVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1e1e1e",
        marginBottom: 10,
        textAlign: "center",
    },
    divider: {
        marginBottom: 15,
    },
    photoGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    photoBlock: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: "#e6e6e6",
    },
    photoHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 6,
    },
    photoLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    previewImage: {
        width: "100%",
        height: 140,
        borderRadius: 10,
        marginBottom: 8,
    },
    emptyBox: {
        width: "100%",
        height: 140,
        borderWidth: 1.2,
        borderColor: "#d9d9d9",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        backgroundColor: "#fafafa",
    },
    emptyText: {
        fontSize: 12,
        color: "#999",
        marginTop: 4,
    },
    actionButton: {
        backgroundColor: "#007AFF",
        borderRadius: 10,
    },
    profileButton: {
        backgroundColor: "#34C759",
    },
    buttonContent: {
        height: 44,
    },
    iconButton: {
        backgroundColor: "#EAF0FF",
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        elevation: 2,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 10,
    },
    dropdown: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    dropdownError: {
        borderColor: '#B00020',
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#000',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#000',
    },
    // Simple TextInput styles
    simpleInput: {
        marginBottom: 12,
        height: 38,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,   // ✅ Add this line
        paddingHorizontal: 17,
        backgroundColor: '#FFFFFF',
    },
    inputError: {
        borderColor: "#f44336",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#455A64",
        marginBottom: 8,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#70B04F",
        marginBottom: 16,
        textAlign: "center",
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

export default AgreementSecond;