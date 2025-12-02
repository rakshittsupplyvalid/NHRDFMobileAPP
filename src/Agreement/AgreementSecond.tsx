

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
    TextInput as RNTextInput,
    Dimensions
} from "react-native";
import { Button, Text, Card, Checkbox, HelperText, Divider, TextInput } from "react-native-paper";
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
import RNFS from 'react-native-fs';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (screenWidth / 375) * size;
const verticalScale = (size: number) => (screenHeight / 667) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

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
    accountholdername: string;
    raccountnumber: string;
    ifsc: string;
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

    // This will log the formData whenever this screen renders
    console.log("🔥 Third screen data:", formData);

    // Nominees and witnesses state - MIN 1 Nominee, MAX 2 Witnesses
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
            accountholdername: "",
            raccountnumber: "",
            ifsc: "",
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
    const [witnessSignatureUri, setWitnessSignatureUri] = useState<string[]>([]);
    const [nomineeSignatureUri, setNomineeSignatureUri] = useState<string[]>([]);
    const [nomineeProfilePhotos, setNomineeProfilePhotos] = useState<string[]>([]);
    const [witnessProfilePhotos, setWitnessProfilePhotos] = useState<string[]>([]);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Custom uppercase handler for TextInput
    const handleUppercaseChange = (text: string, callback: (text: string) => void) => {
        callback(text.toUpperCase());
    };

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
        const validRelations = ["S/O", "D/O", "W/O"];
        return validRelations.includes(relation);
    };

    const isValidYear = (year: string) => {
        if (!year) return true;
        const currentYear = new Date().getFullYear();
        const yearNum = parseInt(year);
        return yearNum >= 1900 && yearNum <= currentYear;
    };

    const isValidAccountNumber = (account: string) => {
        if (!account) return true;
        return /^\d{9,18}$/.test(account);
    };

    const isValidIFSC = (ifsc: string) => {
        if (!ifsc) return true;
        return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
    };

    const isValidRequiredField = (value: string) => {
        return value && value.trim().length > 0;
    };

    // Real-time validation functions
    const validateNomineeField = (index, field, value) => {
        const newErrors = [...nomineeErrors];
        let error = "";

        switch (field) {
            case "nomineename":
                if (!value || !isValidName(value)) {
                    error = "Name must be 1-100 letters only";
                }
                break;

            case "mobileno":
                if (!value || !isValidMobile(value)) {
                    error = "Valid 10-digit mobile number required";
                }
                break;

            case "relation":
                if (!value) {
                    error = "Relation is required";
                }
                break;

            case "addrline":
                if (!value) {
                    error = "Address Line is required";
                }
                break;

            case "accountholdername":
                if (!value || !isValidName(value)) {
                    error = "Account holder name required";
                }
                break;

            case "raccountnumber":
                if (!value || !isValidAccountNumber(value)) {
                    error = "Account number must be 9-18 digits";
                }
                break;

            case "ifsc":
                if (!value || !isValidIFSC(value)) {
                    error = "Valid IFSC code required";
                }
                break;

            case "year":
                if (value && !isValidYear(value)) {
                    error = "Please enter a valid year";
                }
                break;
            case 'pincode':
                if (value && !isValidPincode(value)) {
                    error = 'Pincode must be 6 digits';
                }
                break;

            case "stateid":
                if (!value) {
                    error = "State is required";
                }
                break;

            case "districtid":
                if (!value) {
                    error = "District is required";
                }
                break;

            case "subdistrictid":
                if (!value) {
                    error = "City is required";
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

    const isFormValid = () => {
        const nomineeValid = nominees.every((nominee, index) => {
            const hasRequiredFields =
                nominee.nomineename &&
                nominee.mobileno &&
                nominee.relation &&
                nominee.addrline &&
                nominee.accountholdername &&
                nominee.raccountnumber &&
                nominee.ifsc &&
                nominee.pincode &&
                nominee.stateid &&
                nominee.districtid &&
                nominee.subdistrictid &&
                nomineeProfilePhotos[index];

            const hasNoErrors = Object.keys(nomineeErrors[index] || {}).every(
                (key) => !nomineeErrors[index][key]
            );

            return hasRequiredFields && hasNoErrors;
        });

        const witnessValid = witnesses.every((witness, index) => {
            const hasRequiredFields = witness.witnessname &&
                witness.witnessmobileno &&
                witness.pincode &&
                witness.stateid &&
                witness.districtid &&
                witness.subdistrictid &&
                witnessSignatureUri[index];

            const hasNoErrors = Object.keys(witnessErrors[index] || {}).every(
                (key) => !witnessErrors[index][key]
            );

            return hasRequiredFields && hasNoErrors;
        });

        return nomineeValid && witnessValid && isAgreementAccepted;
    };

    // Back handler
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate("Agreementland" as never);
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

    // Nominee profile photo handler
    const handleNomineeProfilePhoto = async (index: number) => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

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
                console.log("Captured nominee profile photo:", uri);

                // Update nominee profile photos state
                setNomineeProfilePhotos(prev => {
                    const updated = [...prev];
                    updated[index] = uri || '';
                    return updated;
                });

                // Update nominee profdocument field
                const updatedNominees = [...nominees];
                updatedNominees[index].profdocument = uri || '';
                setNominees(updatedNominees);
            }
        });
    };

    // Witness profile photo handler
    const handleWitnessProfilePhoto = async (index: number) => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

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
                console.log("Captured witness profile photo:", uri);

                // Update witness profile photos state
                setWitnessProfilePhotos(prev => {
                    const updated = [...prev];
                    updated[index] = uri || '';
                    return updated;
                });

                // Update witness profdocument field
                const updatedWitnesses = [...witnesses];
                updatedWitnesses[index].profdocument = uri || '';
                setWitnesses(updatedWitnesses);
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
                .get(`https://stage-master-backend.epravaha.com/api/City/GetCityBy/${value}`)
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

    const updateWitness = (index: number, key: keyof WitnessType, value: string) => {
        const newWitnesses = [...witnesses];
        newWitnesses[index][key] = value;
        setWitnesses(newWitnesses);
        validateWitnessField(index, key, value);
    };

    const addWitness = () => {
        if (witnesses.length >= 2) {
            Alert.alert("Limit Reached", "You can add only 2 witnesses.");
            return;
        }

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

    useFocusEffect(
        React.useCallback(() => {
            const params = route.params as { signatureUri?: string; type?: string, index?: number } | undefined;

            if (params?.signatureUri && params?.type) {
                console.log("🖋️ Received Signature URI:", params.signatureUri);
                console.log("📄 Signature Type:", params.type);

                FileSystem.readAsStringAsync(params.signatureUri, {
                    encoding: 'base64',
                })
                    .then((base64Data) => {
                        const base64Image = `data:image/png;base64,${base64Data}`;
                        console.log("✅ Base64 Image:", base64Image.substring(0, 100) + "...");

                        const base64ToBlob = (base64, type = "image/png") => {
                            const byteCharacters = atob(base64.split(",")[1]);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            return new Blob([byteArray], { type });
                        };

                        const imageBlob = base64ToBlob(base64Image, "image/png");
                        console.log("📦 Converted Blob:", imageBlob);
                        console.log("📏 Blob Size:", imageBlob.size);

                        const formData = new FormData();
                        console.log("✅ FormData Ready for Upload");
                    })
                    .catch((err) => console.error("❌ Error reading file:", err));

                if (params.type === "nominee") {
                    setNomineeSignatureUri((prev) => {
                        const updated = [...prev];
                        updated[params.index || 0] = params.signatureUri || '';
                        return updated;
                    });
                } else if (params.type === "witness") {
                    setWitnessSignatureUri((prev) => {
                        const updated = [...prev];
                        updated[params.index || 0] = params.signatureUri || '';
                        return updated;
                    });
                }
                else if (params.type === "signature") {
                    setSignaturePhoto(params.signatureUri);
                }
            }
        }, [route.params])
    );

    // Base64 string ko file me convert karo
    const base64ToFile = async (base64String: any, fileName: any) => {
        try {
            const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
            const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
            await RNFS.writeFile(filePath, base64Data, 'base64');

            return {
                uri: `file://${filePath}`,
                type: 'image/png',
                name: fileName
            };
        } catch (error) {
            console.error('Base64 to File Error:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        if (!isAgreementAccepted) {
            Alert.alert(
                "Agreement",
                "Please read and accept the agreement terms before submitting."
            );
            return;
        }

        try {
            const requestData = new FormData();

            // Append main contextual data
            requestData.append("CodeNo", formData?.CodeNumber || "");
            requestData.append("FarmerDistributionId", formData?.farmerDistributionId || "");
            requestData.append("FarmerId", formData?.farmerId || "");
            requestData.append("CenterTargetId", formData?.centerTargetId || "");
            // requestData.append("LandDetailId", formData?.landId || "");
            (formData?.landIds || []).forEach((id) => {
                requestData.append("LandDetailId", id);
            });

            requestData.append("CertificateNo", formData?.Certificate || "");
            requestData.append("SurveyNo", formData?.Survey || "");
            requestData.append("VarietyId", formData?.varietyId || "");
            requestData.append("DuringYear", formData?.Year?.toString() || "");
            requestData.append("SeedClass", formData?.cropClassSeeds?.toString() || "");
            requestData.append("CommodityId", formData?.commodityId || "");
            requestData.append("PlantingMaterial", formData?.DistributionType || "");
            requestData.append("Area", formData?.area?.toString() || "0");
            requestData.append("AuthorizedName", state.form.authorizedSignatory || "");
            requestData.append("BillNumber", formData?.billNumber || "");
            requestData.append("TagNumber", state.form.TagNumber || "");
            requestData.append("LotNumber", formData?.lotNo || "");

            // Convert Base64 signature to file
            if (signaturePhoto) {
                const convertedSignature = await base64ToFile(signaturePhoto, "signature.png");
                if (convertedSignature) {
                    requestData.append("Signature", {
                        uri: convertedSignature.uri,
                        type: convertedSignature.type,
                        name: convertedSignature.name,
                    } as any);
                }
            }

            if (profilePhoto) {
                requestData.append("ProfFile", {
                    uri: profilePhoto,
                    type: "image/jpeg",
                    name: "profile.jpg",
                } as any);
            }

            let nominees_update = nominees?.map((x, i) => ({
                ...x,
                signature: nomineeSignatureUri[i] || ''
            }))

            // ========== NOMINEES - Array Index Format ==========
            for (let index = 0; index < nominees_update.length; index++) {
                const nominee = nominees_update[index];
                requestData.append(`NomiNee[${index}].nomineename`, nominee.nomineename || '');
                requestData.append(`NomiNee[${index}].gender`, nominee.gender || 'NONE');
                requestData.append(`NomiNee[${index}].mobileno`, nominee.mobileno || '');
                requestData.append(`NomiNee[${index}].email`, nominee.email || '');
                requestData.append(`NomiNee[${index}].age`, String(nominee.age));
                requestData.append(`NomiNee[${index}].year`, String(nominee.year || 0));
                requestData.append(`NomiNee[${index}].dob`, nominee.dob || '');
                requestData.append(`NomiNee[${index}].addrline`, nominee.addrline || '');
                requestData.append(`NomiNee[${index}].pincode`, nominee.pincode || '');
                requestData.append(`NomiNee[${index}].villageid`, String(nominee.villageid || 0));
                requestData.append(`NomiNee[${index}].villagename`, nominee.villagename || '');
                requestData.append(`NomiNee[${index}].districtid`, String(nominee.districtid || 0));
                requestData.append(`NomiNee[${index}].districtname`, nominee.districtname || '');
                requestData.append(`NomiNee[${index}].subdistrictid`, String(nominee.subdistrictid || 0));
                requestData.append(`NomiNee[${index}].subdistrictname`, nominee.subdistrictname || '');
                requestData.append(`NomiNee[${index}].stateid`, String(nominee.stateid || 0));
                requestData.append(`NomiNee[${index}].statename`, nominee.statename || '');
                requestData.append(`NomiNee[${index}].relation`, nominee.relation || '');
                requestData.append(`NomiNee[${index}].passbookdoc`, nominee.profdocument || '');
                requestData.append(`NomiNee[${index}].accountholdername`, nominee.accountholdername || '');
                requestData.append(`NomiNee[${index}].accountnumber`, nominee.raccountnumber || '');
                requestData.append(`NomiNee[${index}].ifsc`, nominee.ifsc || '');

                // Profile document - Convert to file if exists
                if (nominee.profdocument) {
                    const profileFile = await base64ToFile(
                        nominee.profdocument,
                        `nominee_${index}_profile.png`
                    );
                    requestData.append(`NomiNee[${index}].passbookdoc`, profileFile as any);
                }

                // Signature - Convert base64 to file
                if (nominee.signature) {
                    const signatureFile = await base64ToFile(
                        nominee.signature,
                        `nominee_${index}_signature.png`
                    );
                    requestData.append(`NomiNee[${index}].signature`, signatureFile as any);
                }

                console.log(`✅ Nominee ${index} added:`, nominee.nomineename);
            }

            let witnesses_update = witnesses?.map((x, i) => ({
                ...x,
                signature: witnessSignatureUri[i] || ''
            }))

            // ========== WITNESSES - Array Index Format ==========
            for (let index = 0; index < witnesses_update.length; index++) {
                const witness = witnesses_update[index];
                requestData.append(`Witness[${index}].witnessname`, witness.witnessname || '');
                requestData.append(`Witness[${index}].witnessmobileno`, witness.witnessmobileno || '');
                requestData.append(`Witness[${index}].witnessemail`, witness.witnessemail || '');
                requestData.append(`Witness[${index}].addrline`, witness.addrline || '');
                requestData.append(`Witness[${index}].pincode`, witness.pincode || '');
                requestData.append(`Witness[${index}].villageid`, String(witness.villageid || 0));
                requestData.append(`Witness[${index}].villagename`, witness.villagename || '');
                requestData.append(`Witness[${index}].districtid`, String(witness.districtid || 0));
                requestData.append(`Witness[${index}].districtname`, witness.districtname || '');
                requestData.append(`Witness[${index}].subdistrictid`, String(witness.subdistrictid || 0));
                requestData.append(`Witness[${index}].subdistrictname`, witness.subdistrictname || '');
                requestData.append(`Witness[${index}].stateid`, String(witness.stateid || 0));
                requestData.append(`Witness[${index}].statename`, witness.statename || '');
                requestData.append(`Witness[${index}].profdocument`, witness.profdocument || '');

                // Profile document - Convert to file if exists
                if (witness.profdocument) {
                    const profileFile = await base64ToFile(
                        witness.profdocument,
                        `witness_${index}_profile.png`
                    );
                    requestData.append(`Witness[${index}].profdocument`, profileFile as any);
                }

                // Signature - Convert base64 to file
                if (witness.signature) {
                    const signatureFile = await base64ToFile(
                        witness.signature,
                        `witness_${index}_signature.png`
                    );
                    requestData.append(`Witness[${index}].signature`, signatureFile as any);
                }

                console.log(`✅ Witness ${index} added:`, witness.witnessname);
            }



            console.log("🔥 FormData to be submitted (FormData entries not iterable in React Native)");
            const token = await retrieveToken();

            // const response = await apiClient.post("/api/mobile/agreement", requestData, {
            //     headers: {
            //         "Content-Type": "multipart/form-data",
            //         Authorization: `Bearer ${token}`,
            //     },
            // });



            const response = await apiClient.post("/api/mobile/agreement", requestData);

            if (response.status === 200 || response.status === 201) {
                setIsSubmitting(false);
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
                setIsSubmitting(false);
                Alert.alert("❌ Error", "Submission failed.");
            }
        } catch (error: any) {
            setIsSubmitting(false);
            console.error("❌ Submit error:", error);
            Alert.alert(
                "Error",
                error.response?.data?.message || "Something went wrong."
            );
        }
    };

    const calculateAge = (dob: string) => {
        if (!dob) return "";

        const [year, month, day] = dob.split("-");
        const birthDate = new Date(Number(year), Number(month) - 1, Number(day));
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age.toString();
    };

    const formatDate = (date: Date) => {
        const d = date.getDate().toString().padStart(2, "0");
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const y = date.getFullYear();
        return `${d}-${m}-${y}`;
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

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const renderSectionHeader = (title: string, section: string, count?: number) => (
        <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(section)}
            activeOpacity={0.7}
        >
            <View style={styles.sectionHeaderLeft}>
                <MaterialIcons
                    name={activeSection === section ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={scale(24)}
                    color="#70B04F"
                />
                <Text style={styles.sectionTitle}>{title}</Text>
                {count !== undefined && (
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{count}</Text>
                    </View>
                )}
            </View>
            <MaterialIcons
                name="info-outline"
                size={scale(20)}
                color="#666"
            />
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate("Agreementland" as never)}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="arrow-back" size={scale(24)} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Nominee & Witness Details</Text>

            </View>

            <KeyboardAwareScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                enableOnAndroid={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableResetScrollToCoords={false}
                bounces={false}
                overScrollMode="never"
            >
                {/* Nominee Section */}
                <Card style={styles.sectionCard}>
                    {renderSectionHeader("Nominee Details", "nominee", 1)}

                    {activeSection === "nominee" && (
                        <Card.Content style={styles.sectionContent}>
                            <View style={styles.requiredInfo}>
                                <MaterialIcons name="info" size={scale(16)} color="#FF6B35" />
                                <Text style={styles.requiredInfoText}>Minimum 1 Nominee Required</Text>
                            </View>

                            {nominees.map((nominee, index) => (
                                <Card key={index} style={styles.innerCard}>
                                    <Card.Content>
                                        <Text style={styles.sectionSubTitle}>Nominee </Text>

                                        {/* Name and Mobile - Required */}
                                        <View style={styles.row}>
                                            <View style={styles.halfInput}>
                                                <Text style={styles.label}>Name *</Text>
                                                <RNTextInput
                                                    placeholder="Full Name"
                                                    value={nominee.nomineename}
                                                    autoCapitalize="characters"
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
                                            </View>

                                            <View style={styles.halfInput}>
                                                <Text style={styles.label}>Mobile *</Text>
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
                                            </View>
                                        </View>

                                        {/* Gender and Relation */}
                                        <View style={styles.row}>
                                            <View style={styles.halfInput}>
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
                                            </View>

                                            <View style={styles.halfInput}>
                                                <Text style={styles.label}>Relation *</Text>
                                                <CommonPicker
                                                    selectedValue={nominee.relation || ""}
                                                    onValueChange={(value) => updateNominee(index, "relation", value)}
                                                    items={[
                                                        { label: "S/O", value: "S/O" },
                                                        { label: "D/O", value: "D/O" },
                                                        { label: "W/O", value: "W/O" },
                                                    ]}
                                                />
                                                {nomineeErrors[index]?.relation ? (
                                                    <HelperText type="error" visible={!!nomineeErrors[index]?.relation}>
                                                        {nomineeErrors[index]?.relation}
                                                    </HelperText>
                                                ) : null}
                                            </View>
                                        </View>

                                        {/* Date of Birth and Year */}
                                        <View style={styles.row}>
                                            <View style={styles.halfInput}>
                                                <Text style={styles.label}>Date of Birth</Text>
                                                <CustomDateTimePicker
                                                    value={nominee.dob ? new Date(nominee.dob) : new Date()}
                                                    onChange={(date) => {
                                                        const formattedDate = date.toISOString().split("T")[0];
                                                        const age = calculateAge(formattedDate);
                                                        updateNominee(index, "dob", formattedDate);
                                                        updateNominee(index, "age", age);
                                                    }}
                                                    mode="date"
                                                />
                                            </View>

                                            {/* <View style={styles.halfInput}>
                                                <Text style={styles.label}>Season</Text>
                                                <YearPickerInput
                                                    value={nominee.year}
                                                    onChange={(year) => updateNominee(index, "year", year)}
                                                />
                                            </View> */}
                                        </View>


                                        {/* Address */}
                                        <Text style={styles.label}>Address Line *</Text>
                                        <RNTextInput
                                            placeholder="Address Line"
                                            value={nominee.addrline}
                                            autoCapitalize="characters"
                                            onChangeText={(text) => updateNominee(index, "addrline", text)}
                                            style={[
                                                styles.simpleInput,
                                                nomineeErrors[index]?.addrline && styles.inputError
                                            ]}
                                            maxLength={200}
                                            multiline
                                            numberOfLines={2}
                                        />
                                        {nomineeErrors[index]?.addrline ? (
                                            <HelperText type="error" visible={!!nomineeErrors[index]?.addrline}>
                                                {nomineeErrors[index]?.addrline}
                                            </HelperText>
                                        ) : null}

                                        {/* Location Row */}
                                        <View style={styles.row}>
                                            <View style={styles.thirdInput}>
                                                <Text style={styles.label}>Pincode *</Text>
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
                                            </View>

                                            <View style={styles.twoThirdInput}>
                                                <Text style={styles.label}>Village Name</Text>
                                                <RNTextInput
                                                    placeholder="Village Name"
                                                    value={nominee.villagename}
                                                    autoCapitalize="characters"
                                                    onChangeText={(text) => updateNominee(index, "villagename", text)}
                                                    style={styles.simpleInput}
                                                    maxLength={100}
                                                />
                                            </View>
                                        </View>

                                        {/* State, District, City */}
                                        <View style={styles.row}>
                                            <View style={styles.thirdInput}>
                                                <Text style={styles.label}>State *</Text>
                                                <CommonPicker
                                                    selectedValue={nominee.stateid || ""}
                                                    onValueChange={(value) => handleStateChange(value, "Nominee", index)}
                                                    items={statesList}
                                                />
                                            </View>


                                        </View>


                                        <View style={styles.row}>
                                            <View style={styles.thirdInput}>
                                                <Text style={styles.label}>District *</Text>
                                                <CommonPicker
                                                    selectedValue={nominee.districtid || ""}
                                                    onValueChange={(value) => handleDistrictChange(value, "Nominee", index)}
                                                    items={nomineeDistrictsList[index] || []}
                                                />
                                            </View>

                                            <View style={styles.thirdInput}>
                                                <Text style={styles.label}>City *</Text>
                                                <CommonPicker
                                                    selectedValue={nominee.subdistrictid || ""}
                                                    onValueChange={(value) => handleCityChange(value, "Nominee", index)}
                                                    items={nomineeCitiesList[index] || []}
                                                />
                                            </View>


                                        </View>

                                        {/* Bank Details */}
                                        <Text style={styles.sectionSubTitle}>Bank Account Details</Text>

                                        <Text style={styles.label}>Account Holder Name *</Text>
                                        <RNTextInput
                                            placeholder="Account Holder Name"
                                            value={nominee.accountholdername}
                                              autoCapitalize="characters"
                                            onChangeText={(text) => {
                                                updateNominee(index, "accountholdername", text);
                                                validateNomineeField(index, "accountholdername", text);
                                            }}
                                            style={[
                                                styles.simpleInput,
                                                nomineeErrors[index]?.accountholdername && styles.inputError,
                                            ]}
                                        />

                                        {nomineeErrors[index]?.accountholdername && (
                                            <HelperText type="error">
                                                {nomineeErrors[index].accountholdername}
                                            </HelperText>
                                        )}

                                        <View style={styles.row}>
                                            <View style={styles.halfInput}>
                                                <Text style={styles.label}>Account Number *</Text>
                                                <RNTextInput
                                                    placeholder="Account Number"
                                                    keyboardType="numeric"
                                                    maxLength={18}
                                                    value={nominee.raccountnumber}
                                                    onChangeText={(text) => {
                                                        const numeric = text.replace(/[^0-9]/g, "");
                                                        updateNominee(index, "raccountnumber", numeric);
                                                        validateNomineeField(index, "raccountnumber", numeric);
                                                    }}
                                                    style={[
                                                        styles.simpleInput,
                                                        nomineeErrors[index]?.raccountnumber && styles.inputError,
                                                    ]}
                                                />
                                                {nomineeErrors[index]?.raccountnumber && (
                                                    <HelperText type="error">
                                                        {nomineeErrors[index].raccountnumber}
                                                    </HelperText>
                                                )}
                                            </View>

                                            <View style={styles.halfInput}>
                                                <Text style={styles.label}>IFSC Code *</Text>
                                                <RNTextInput
                                                    placeholder="IFSC Code"
                                                    value={nominee.ifsc}
                                                    maxLength={11}
                                                        autoCapitalize="characters"
                                                    onChangeText={(text) => {
                                                       
                                                        updateNominee(index, "ifsc", text);
                                                        validateNomineeField(index, "ifsc", text);
                                                    }}
                                                    style={[
                                                        styles.simpleInput,
                                                        nomineeErrors[index]?.ifsc && styles.inputError,
                                                    ]}
                                                />
                                                {nomineeErrors[index]?.ifsc && (
                                                    <HelperText type="error">{nomineeErrors[index].ifsc}</HelperText>
                                                )}
                                            </View>
                                        </View>

                                        {/* Passbook Photo */}
                                        <View style={styles.photoSection}>
                                            <Text style={styles.photoLabel}>Passbook Photo *</Text>
                                            {nomineeProfilePhotos[index] ? (
                                                <Image
                                                    source={{ uri: nomineeProfilePhotos[index] }}
                                                    style={styles.photoPreview}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={styles.photoPlaceholder}>
                                                    <MaterialIcons name="photo-library" size={scale(32)} color="#ccc" />
                                                    <Text style={styles.photoPlaceholderText}>No passbook photo added</Text>
                                                </View>
                                            )}
                                            <TouchableOpacity
                                                style={styles.photoButton}
                                                onPress={() => handleNomineeProfilePhoto(index)}
                                            >
                                                <MaterialIcons name="photo-camera" size={scale(20)} color="#fff" />
                                                <Text style={styles.photoButtonText}>Capture Passbook</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </Card.Content>
                                </Card>
                            ))}
                        </Card.Content>
                    )}
                </Card>

                {/* Witness Section */}
                <Card style={styles.sectionCard}>
                    {renderSectionHeader("Witness Details", "witness", witnesses.length)}

                    {activeSection === "witness" && (
                        <Card.Content style={styles.sectionContent}>
                            <View style={styles.requiredInfo}>
                                <MaterialIcons name="info" size={scale(16)} color="#FF6B35" />
                                <Text style={styles.requiredInfoText}>
                                    {witnesses.length === 0 ? "Minimum 1 Witness Required" :
                                        witnesses.length === 1 ? "Add 1 more witness (Optional)" :
                                            "Maximum 2 Witnesses Reached"}
                                </Text>
                            </View>

                            {witnesses.map((witness, index) => (
                                <Card key={index} style={styles.innerCard}>
                                    <Card.Content>
                                        <View style={styles.witnessHeader}>
                                            <Text style={styles.sectionSubTitle}>Witness {index + 1}</Text>
                                            {witnesses.length > 1 && (
                                                <TouchableOpacity
                                                    style={styles.deleteButton}
                                                    onPress={() => deleteWitness(index)}
                                                >
                                                    <MaterialIcons name="delete" size={scale(20)} color="#ff4444" />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {/* Name and Mobile */}
                                        <View style={styles.row}>
                                            <View style={styles.halfInput}>
                                                <Text style={styles.label}>Name *</Text>
                                                <RNTextInput
                                                    placeholder="Full Name"
                                                    value={witness.witnessname}
                                                      autoCapitalize="characters"
                                                    onChangeText={(text) => updateWitness(index, "witnessname", text)}
                                                    style={[
                                                        styles.simpleInput,
                                                        witnessErrors[index]?.witnessname && styles.inputError
                                                    ]}
                                                    maxLength={20}
                                                />
                                                {witnessErrors[index]?.witnessname ? (
                                                    <HelperText type="error" visible={!!witnessErrors[index]?.witnessname}>
                                                        {witnessErrors[index]?.witnessname}
                                                    </HelperText>
                                                ) : null}
                                            </View>

                                            <View style={styles.halfInput}>
                                                <Text style={styles.label}>Mobile *</Text>
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
                                            </View>
                                        </View>



                                        {/* Address */}
                                        <Text style={styles.label}>Address *</Text>
                                        <RNTextInput
                                            placeholder="Address Line"
                                            value={witness.addrline}
                                              autoCapitalize="characters"
                                            onChangeText={(text) =>  updateWitness(index, "addrline", text)}
                                            style={[
                                                styles.simpleInput,
                                                witnessErrors[index]?.addrline && styles.inputError
                                            ]}
                                            maxLength={200}
                                            multiline
                                            numberOfLines={2}
                                        />
                                        {witnessErrors[index]?.addrline ? (
                                            <HelperText type="error" visible={!!witnessErrors[index]?.addrline}>
                                                {witnessErrors[index]?.addrline}
                                            </HelperText>
                                        ) : null}

                                        {/* Location Details */}
                                        <View style={styles.row}>
                                            <View style={styles.thirdInput}>
                                                <Text style={styles.label}>Pincode *</Text>
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
                                            </View>

                                            <View style={styles.twoThirdInput}>
                                                <Text style={styles.label}>Village Name</Text>
                                                <RNTextInput
                                                    placeholder="Village Name"
                                                    value={witness.villagename}
                                                      autoCapitalize="characters"
                                                    onChangeText={(text) => updateWitness(index, "villagename", text)}
                                                    style={styles.simpleInput}
                                                    maxLength={100}
                                                />
                                            </View>
                                        </View>

                                        {/* State, District, City */}
                                        <View style={styles.row}>
                                            <View style={styles.thirdInput}>
                                                <Text style={styles.label}>State *</Text>
                                                <CommonPicker
                                                    selectedValue={witness.stateid || ""}
                                                    onValueChange={(value) => handleStateChange(value, "Witness", index)}
                                                    items={statesList}
                                                />
                                            </View>

                                            {/* <View style={styles.thirdInput}>
                                                <Text style={styles.label}>District *</Text>
                                                <CommonPicker
                                                    selectedValue={witness.districtid || ""}
                                                    onValueChange={(value) => handleDistrictChange(value, "Witness", index)}
                                                    items={witnessDistrictsList[index] || []}
                                                />
                                            </View>

                                            <View style={styles.thirdInput}>
                                                <Text style={styles.label}>City *</Text>
                                                <CommonPicker
                                                    selectedValue={witness.subdistrictid || ""}
                                                    onValueChange={(value) => handleCityChange(value, "Witness", index)}
                                                    items={witnessCitiesList[index] || []}
                                                />
                                            </View> */}
                                        </View>

                                        <View style={styles.row}>
                                            <View style={styles.thirdInput}>
                                                <Text style={styles.label}>District *</Text>
                                                <CommonPicker
                                                    selectedValue={witness.districtid || ""}
                                                    onValueChange={(value) => handleDistrictChange(value, "Witness", index)}
                                                    items={witnessDistrictsList[index] || []}
                                                />
                                            </View>
                                            <View style={styles.thirdInput}>
                                                <Text style={styles.label}>City *</Text>
                                                <CommonPicker
                                                    selectedValue={witness.subdistrictid || ""}
                                                    onValueChange={(value) => handleCityChange(value, "Witness", index)}
                                                    items={witnessCitiesList[index] || []}
                                                />
                                            </View>

                                        </View>

                                        {/* Signature Section */}
                                        <View style={styles.photoSection}>
                                            <Text style={styles.photoLabel}>Signature *</Text>
                                            {witnessSignatureUri?.[index] ? (
                                                <Image
                                                    source={{ uri: witnessSignatureUri[index] }}
                                                    style={styles.signaturePreview}
                                                    resizeMode="contain"
                                                />
                                            ) : (
                                                <View style={styles.photoPlaceholder}>
                                                    <MaterialCommunityIcons name="signature-freehand" size={scale(32)} color="#ccc" />
                                                    <Text style={styles.photoPlaceholderText}>No signature added</Text>
                                                    <Text style={styles.requiredText}>Signature is required</Text>
                                                </View>
                                            )}
                                            <TouchableOpacity
                                                style={styles.photoButton}
                                                onPress={() => navigation.navigate("Signature", { type: "witness", index })}
                                            >
                                                <MaterialCommunityIcons name="signature-freehand" size={scale(20)} color="#fff" />
                                                <Text style={styles.photoButtonText}>Capture Signature</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </Card.Content>
                                </Card>
                            ))}

                            {witnesses.length < 2 && (
                                <Button
                                    mode="outlined"
                                    onPress={addWitness}
                                    style={styles.addButton}
                                    icon="plus"
                                >
                                    Add Witness {witnesses.length + 1}
                                </Button>
                            )}
                        </Card.Content>
                    )}
                </Card>

                {/* Signature & Profile Section */}
                <Card style={styles.sectionCard}>
                    {renderSectionHeader("Signature & Profile Verification", "signature")}

                    {activeSection === "signature" && (
                        <Card.Content style={styles.sectionContent}>
                            <View style={styles.photoGrid}>
                                <View style={styles.photoBlock}>
                                    <View style={styles.photoHeader}>
                                        <MaterialIcons name="gesture" size={scale(22)} color="#007AFF" />
                                        <Text style={styles.photoLabel}>Signature</Text>
                                    </View>

                                    {signaturePhoto ? (
                                        <Image source={{ uri: signaturePhoto }} style={styles.previewImage} />
                                    ) : (
                                        <View style={styles.emptyBox}>
                                            <MaterialIcons name="border-color" size={scale(28)} color="#999" />
                                            <Text style={styles.emptyText}>No Signature Added</Text>
                                        </View>
                                    )}

                                    <Button
                                        mode="contained"
                                        onPress={() =>
                                            navigation.navigate("Signature", { type: "signature" })
                                        }
                                        icon={() => <MaterialIcons name="edit" size={scale(20)} color="#fff" />}
                                        style={styles.actionButton}
                                        contentStyle={styles.buttonContent}
                                    >
                                        Capture Signature
                                    </Button>
                                </View>

                                <View style={styles.photoBlock}>
                                    <View style={styles.photoHeader}>
                                        <MaterialIcons name="person" size={scale(22)} color="#007AFF" />
                                        <Text style={styles.photoLabel}>Profile</Text>
                                    </View>

                                    {profilePhoto ? (
                                        <Image source={{ uri: profilePhoto }} style={styles.previewImage} />
                                    ) : (
                                        <View style={styles.emptyBox}>
                                            <MaterialIcons name="photo-camera" size={scale(28)} color="#999" />
                                            <Text style={styles.emptyText}>No Profile Photo</Text>
                                        </View>
                                    )}

                                    <Button
                                        mode="contained"
                                        onPress={() => openCamera(setProfilePhoto)}
                                        icon={() => <MaterialIcons name="photo-camera" size={scale(20)} color="#fff" />}
                                        style={[styles.actionButton, styles.profileButton]}
                                        contentStyle={styles.buttonContent}
                                    >
                                        Capture Profile
                                    </Button>
                                </View>
                            </View>
                        </Card.Content>
                    )}
                </Card>

                {/* Additional Details Section */}
                <Card style={styles.sectionCard}>
                    {renderSectionHeader("Additional Details", "additional")}

                    {activeSection === "additional" && (
                        <Card.Content style={styles.sectionContent}>
                            {/* Commodity Dropdown */}
                            {renderCommodityDropdown()}

                            {/* Authorized Signatory */}
                            <Text style={styles.label}>Authorized Signatory Name</Text>
                            <TextInput
                                mode="outlined"
                                value={state.form.authorizedSignatory || ""}
                                 autoCapitalize="characters"
                                onChangeText={(text) =>  updateState({ ...state, form: { ...state.form, authorizedSignatory: text} })}
                                style={styles.input}
                                placeholder="Enter authorized signatory name"
                                maxLength={20}
                            />

                            <Text style={styles.label}>Tag Number</Text>
                            <TextInput
                                mode="outlined"
                                value={state.form.TagNumber || ""}
                                 autoCapitalize="characters"
                                onChangeText={(text) => updateState({ ...state, form: { ...state.form, TagNumber: text } })}
                                style={styles.input}
                                placeholder="Enter Tag number"
                                maxLength={50}
                            />
                        </Card.Content>
                    )}
                </Card>

                {/* Agreement Terms Section */}
                <Card style={styles.sectionCard}>
                    {renderSectionHeader("Agreement Terms & Conditions", "agreement")}

                    {activeSection === "agreement" && (
                        <Card.Content style={styles.sectionContent}>
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
                    )}
                </Card>

                {/* Submit Button */}
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
                    {isSubmitting ? "Submitting..." : "SUBMIT AGREEMENT"}
                </Button>

                <View style={styles.bottomSpacer} />
            </KeyboardAwareScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#70B04F",
        paddingHorizontal: scale(23),
        paddingVertical: verticalScale(30),
        justifyContent: "space-between",
    },
    backButton: {
        padding: scale(4),
        marginTop: verticalScale(8),
    },
    headerText: {
        fontSize: moderateScale(18),
        fontWeight: "bold",
        color: "#fff",
        flex: 1,
        textAlign: "center",
        marginTop: verticalScale(8),
    },
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollContent: {
        flexGrow: 1,
        padding: scale(12),
        paddingBottom: verticalScale(20),
    },
    sectionCard: {
        marginBottom: verticalScale(12),
        borderRadius: scale(12),
        elevation: 2,
        backgroundColor: "white",
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: scale(16),
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: "bold",
        color: "#70B04F",
        marginLeft: scale(8),
    },
    sectionContent: {
        padding: scale(4),
    },
    countBadge: {
        backgroundColor: '#70B04F',
        borderRadius: scale(12),
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(2),
        marginLeft: scale(8),
    },
    countText: {
        color: '#fff',
        fontSize: moderateScale(12),
        fontWeight: 'bold',
    },
    requiredInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: scale(12),
        borderRadius: scale(8),
        marginBottom: verticalScale(12),
        marginHorizontal: scale(8),
    },
    requiredInfoText: {
        fontSize: moderateScale(12),
        color: '#E65100',
        marginLeft: scale(8),
        fontWeight: '500',
    },
    sectionSubTitle: {
        fontSize: moderateScale(15),
        fontWeight: "600",
        marginBottom: verticalScale(12),
        color: "#455A64"
    },
    innerCard: {
        marginBottom: verticalScale(12),
        borderRadius: scale(8),
        elevation: 1,
        backgroundColor: "#fff",
        marginHorizontal: scale(4),
    },
    witnessHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    deleteButton: {
        padding: scale(4),
    },
    row: {
        flexDirection: screenWidth < 768 ? 'column' : 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(8),
        gap: scale(8),
    },
    halfInput: {
        flex: 1,
        minWidth: screenWidth < 768 ? '100%' : '48%',
        marginBottom: screenWidth < 768 ? verticalScale(8) : 0,
    },
    thirdInput: {
        flex: 1,
        minWidth: screenWidth < 768 ? '100%' : '30%',
        marginBottom: screenWidth < 768 ? verticalScale(8) : 0,
    },
    twoThirdInput: {
        flex: 2,
        marginLeft: screenWidth < 768 ? 0 : scale(8),
        minWidth: screenWidth < 768 ? '100%' : '65%',
        marginBottom: screenWidth < 768 ? verticalScale(8) : 0,
    },
    // Simple TextInput styles
    simpleInput: {
        height: verticalScale(40),
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: scale(8),
        paddingHorizontal: scale(12),
        backgroundColor: '#FFFFFF',
        fontSize: moderateScale(14),
    },
    inputError: {
        borderColor: "#f44336",
    },
    label: {
        fontSize: moderateScale(13),
        fontWeight: "600",
        color: "#455A64",
        marginBottom: verticalScale(6),
        marginTop: verticalScale(4),
    },
    dropdown: {
        height: verticalScale(40),
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: scale(8),
        paddingHorizontal: scale(10),
        backgroundColor: '#fff',
    },
    dropdownError: {
        borderColor: '#B00020',
    },
    placeholderStyle: {
        fontSize: moderateScale(14),
        color: '#000',
    },
    selectedTextStyle: {
        fontSize: moderateScale(14),
        color: '#000',
    },
    input: {
        backgroundColor: '#fff',
        marginBottom: verticalScale(12),
        fontSize: moderateScale(14),
    },
    photoSection: {
        marginVertical: verticalScale(12),
        alignItems: "center",
    },
    photoLabel: {
        fontWeight: "bold",
        marginBottom: verticalScale(8),
        fontSize: moderateScale(14),
        color: '#455A64',
    },
    photoPreview: {
        width: '100%',
        height: verticalScale(150),
        borderRadius: scale(8),
        marginVertical: verticalScale(8),
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    signaturePreview: {
        width: '100%',
        height: verticalScale(100),
        borderRadius: scale(8),
        marginVertical: verticalScale(8),
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#f8f9fa',
    },
    photoPlaceholder: {
        width: '100%',
        height: verticalScale(120),
        borderWidth: 1.5,
        borderColor: "#d9d9d9",
        borderRadius: scale(8),
        justifyContent: "center",
        alignItems: "center",
        marginVertical: verticalScale(8),
        backgroundColor: "#fafafa",
        borderStyle: 'dashed',
    },
    photoPlaceholderText: {
        fontSize: moderateScale(12),
        color: "#999",
        marginTop: verticalScale(4),
    },
    requiredText: {
        fontSize: moderateScale(11),
        color: '#ff4444',
        marginTop: verticalScale(2),
        fontStyle: 'italic',
    },
    photoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#007AFF",
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(16),
        borderRadius: scale(8),
        marginTop: verticalScale(8),
    },
    photoButtonText: {
        color: '#fff',
        fontSize: moderateScale(14),
        fontWeight: '500',
        marginLeft: scale(8),
    },
    addButton: {
        marginVertical: verticalScale(8),
        borderColor: '#70B04F',
        borderWidth: 1,
    },
    signatureCard: {
        borderRadius: scale(16),
        elevation: 4,
        backgroundColor: "#fdfdfd",
        marginVertical: verticalScale(12),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    cardTitle: {
        fontSize: moderateScale(20),
        fontWeight: "700",
        color: "#1e1e1e",
        marginBottom: verticalScale(10),
        textAlign: "center",
    },
    divider: {
        marginBottom: verticalScale(15),
    },
    photoGrid: {
        flexDirection: screenWidth < 768 ? 'column' : 'row',
        justifyContent: "space-between",
        gap: scale(10),
    },
    photoBlock: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: scale(12),
        padding: scale(10),
        borderWidth: 1,
        borderColor: "#e6e6e6",
        marginBottom: screenWidth < 768 ? verticalScale(10) : 0,
    },
    photoHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: verticalScale(8),
        gap: scale(6),
    },
    previewImage: {
        width: "100%",
        height: verticalScale(140),
        borderRadius: scale(10),
        marginBottom: verticalScale(8),
    },
    emptyBox: {
        width: "100%",
        height: verticalScale(140),
        borderWidth: 1.2,
        borderColor: "#d9d9d9",
        borderRadius: scale(10),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: verticalScale(8),
        backgroundColor: "#fafafa",
    },
    emptyText: {
        fontSize: moderateScale(12),
        color: "#999",
        marginTop: verticalScale(4),
    },
    actionButton: {
        backgroundColor: "#007AFF",
        borderRadius: scale(10),
    },
    profileButton: {
        backgroundColor: "#34C759",
    },
    buttonContent: {
        height: verticalScale(44),
    },
    iconButton: {
        backgroundColor: "#EAF0FF",
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(10),
        borderRadius: scale(10),
        elevation: 2,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: verticalScale(10),
    },
    agreementContainer: {
        maxHeight: verticalScale(200),
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: scale(8),
        padding: scale(12),
        marginBottom: verticalScale(16),
        backgroundColor: "#FAFAFA",
    },
    agreementText: {
        fontSize: moderateScale(12),
        lineHeight: verticalScale(18),
        color: "#455A64",
    },
    agreementHeading: {
        fontSize: moderateScale(14),
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
        marginTop: verticalScale(8),
    },
    checkboxLabel: {
        flex: 1,
        marginLeft: scale(8),
        fontSize: moderateScale(14),
        color: "#455A64",
        lineHeight: verticalScale(18),
    },
    submitButton: {
        marginTop: verticalScale(16),
        marginBottom: verticalScale(8),
        paddingVertical: verticalScale(6),
        backgroundColor: "#70B04F",
        borderRadius: scale(8),
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: "#BDBDBD",
    },
    submitButtonContent: {
        paddingVertical: verticalScale(8),
    },
    bottomSpacer: {
        height: verticalScale(20),
    },
});

export default AgreementSecond;