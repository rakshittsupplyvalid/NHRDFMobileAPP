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
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { formData } = useFormData();
    const { state, updateState } = useForm();
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [nomineeEmailErrors, setNomineeEmailErrors] = useState<string[]>([]);
    const [witnessEmailErrors, setWitnessEmailErrors] = useState<string[]>([]);
    const [nomineeMobileErrors, setNomineeMobileErrors] = useState<string[]>([]);
    const [witnessMobileErrors, setWitnessMobileErrors] = useState<string[]>([]);
    const [nomineeSignatureUri, setNomineeSignatureUri] = useState<string | null>(null);
    const [witnessSignatureUri, setWitnessSignatureUri] = useState<string | null>(null);

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





    const isValidEmail = (email: string) => {
        const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i; // 'i' flag = case-insensitive
        return emailPattern.test(email.trim());
    };

    const isWitnessEmail = (witnessemail: string) => {
        const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i; // ✅ case-insensitive
        return emailPattern.test(witnessemail.trim());
    }

    const validateMobile = (text: string, type: "nominee" | "witness", index: number) => {
        const updatedErrors =
            type === "nominee" ? [...nomineeMobileErrors] : [...witnessMobileErrors];

        if (text.length === 0) {
            updatedErrors[index] = "";
        } else if (!/^[6-9]\d{0,9}$/.test(text)) {
            updatedErrors[index] = "Mobile number must start with 6–9";
        } else {
            updatedErrors[index] = "";
        }

        type === "nominee"
            ? setNomineeMobileErrors(updatedErrors)
            : setWitnessMobileErrors(updatedErrors);
    };


    const validateAddress = (text: string, type: "nominee" | "witness", index: number) => {
        const updatedErrors =
            type === "nominee" ? [...nomineeAddressErrors] : [...witnessAddressErrors];

        const trimmedText = text.trim();

        if (trimmedText.length === 0) {
            updatedErrors[index] = "Address cannot be empty";
        } else if (trimmedText.length < 5) {
            updatedErrors[index] = "Address must be at least 5 characters long";
        }
        // ✅ Only numbers not allowed
        else if (/^\d+$/.test(trimmedText)) {
            updatedErrors[index] = "Address cannot contain only numbers";
        }
        // ✅ Allow letters, numbers, spaces, commas, dots, and hyphens only
        else if (!/^[a-zA-Z0-9\s,.-]+$/.test(trimmedText)) {
            updatedErrors[index] = "Invalid characters in address";
        }
        else {
            updatedErrors[index] = "";
        }

        if (type === "nominee") {
            setNomineeAddressErrors(updatedErrors);
        } else {
            setWitnessAddressErrors(updatedErrors);
        }
    };


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

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate("Agreement Form" as never);
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

    // ✅ Launch Camera for Image Capture
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


    useEffect(() => {
        axios
            .get("https://stage-master-backend.epravaha.com/api/State/GetAllStates")
            .then((res) => {
                console.log("📜 States API Raw Response:", res.data);
                const mappedStates = res.data.map((item) => ({
                    label: item.name,
                    value: item.stateCode?.toString(),
                }));
                // console.log("✅ Mapped States:", mappedStates);
                setStatesList(mappedStates);
            })
            .catch((err) => console.error("❌ State API Error:", err));
    }, []);

    // ------------------ State Change ------------------
    const handleStateChange = (value: string, type: "Nominee" | "Witness", index: number) => {
        const selectedLabel = statesList.find((item) => item.value === value)?.label || "";

        // console.log(`🗂️ handleStateChange() called for ${type} #${index}`);
        // console.log("➡️ Selected State Value:", value);
        // console.log("🏷️ Selected State Label:", selectedLabel);

        if (type === "Nominee") {
            const updatedNominees = [...nominees];
            updatedNominees[index].stateid = value;
            updatedNominees[index].statename = selectedLabel;
            updatedNominees[index].districtid = "";
            updatedNominees[index].districtname = "";
            updatedNominees[index].subdistrictid = "";
            updatedNominees[index].subdistrictname = "";
            setNominees(updatedNominees);

            console.log(`🌍 Fetching Districts API for Nominee StateCode: ${value}`);
            axios
                .get(`https://stage-master-backend.epravaha.com/api/District/GetDistrictsByStateCode/${value}`)
                .then((res) => {
                    console.log("✅ District API Response (Nominee):", res.data);
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

            console.log(`🌍 Fetching Districts API for Witness StateCode: ${value}`);
            axios
                .get(`https://stage-master-backend.epravaha.com/api/District/GetDistrictsByStateCode/${value}`)
                .then((res) => {
                    // console.log("✅ District API Response (Witness):", res.data);
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

    // ------------------ District Change ------------------
    const handleDistrictChange = (value: string, type: "Nominee" | "Witness", index: number) => {
        // console.log(`🏙️ handleDistrictChange() called for ${type} #${index}`);
        // console.log("➡️ Selected District Value:", value);

        const selectedLabel =
            (type === "Nominee"
                ? nomineeDistrictsList[index]
                : witnessDistrictsList[index]
            )?.find((item) => item.value === value)?.label || "";

        // console.log("🏷️ Selected District Label:", selectedLabel);

        if (type === "Nominee") {
            const updatedNominees = [...nominees];
            updatedNominees[index].districtid = value;
            updatedNominees[index].districtname = selectedLabel;
            updatedNominees[index].subdistrictid = "";
            updatedNominees[index].subdistrictname = "";
            setNominees(updatedNominees);

            // console.log(`🌆 Fetching Cities API for Nominee DistrictCode: ${value}`);
            axios
                .get(`https://stage-master-backend.epravaha.com/api/City/GetCityBy/${value}`)
                .then((res) => {
                    // console.log("✅ City API Response (Nominee):", res.data);
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

            // console.log(`🌆 Fetching Cities API for Witness DistrictCode: ${value}`);
            axios
                .get(`https://stage-master-backend.epravaha.com/api/City/GetCityBy${value}`)
                .then((res) => {
                    console.log("✅ City API Response (Witness):", res.data);
                    const mappedCities = res.data.map((item) => ({
                        label: item.name,
                        value: item.cityCode?.toString(),
                    }));
                    setWitnessCitiesList((prev) => ({ ...prev, [index]: mappedCities }));
                })
                .catch((err) => console.error("❌ Witness City API Error:", err));
        }
    };

    // ------------------ City Change ------------------
    const handleCityChange = (value: string, type: "Nominee" | "Witness", index: number) => {
        const currentCityList = type === "Nominee" ? nomineeCitiesList[index] : witnessCitiesList[index];
        const selectedLabel = currentCityList?.find((item) => item.value === value)?.label || "";

        // console.log(`🏡 handleCityChange() called for ${type} #${index}`);
        // console.log("➡️ Selected City Value:", value);
        // console.log("🏷️ Selected City Label:", selectedLabel);

        if (type === "Nominee") {
            const updatedNominees = [...nominees];
            updatedNominees[index].subdistrictid = value;
            updatedNominees[index].subdistrictname = selectedLabel;
            setNominees(updatedNominees);
        } else if (type === "Witness") {
            const updatedWitnesses = [...witnesses];
            updatedWitnesses[index].subdistrictid = value;
            updatedWitnesses[index].subdistrictname = selectedLabel;
            setWitnesses(updatedWitnesses);
        }
    };

     const updateNominee = (index: number, key: keyof NomineeType, value: string) => {
  const newNominees = [...nominees];

  if (key === "dob") {
    // ✅ Value already ISO — no need to reconvert
    newNominees[index][key] = value as any;
  } else if (key === "year") {
    const numericYear = value.replace(/[^0-9]/g, "").slice(0, 4);
    newNominees[index][key] = numericYear as any;
  } else {
    newNominees[index][key] = value as any;
  }

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

    // ✅ Delete Witness function
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


    // useFocusEffect(
    //     React.useCallback(() => {
    //         const params = route.params as { signatureUri?: string; type?: string } | undefined;
    //         if (params?.signatureUri && params?.type) {
    //             if (params.type === "nominee") setNomineeSignatureUri(params.signatureUri);
    //             else if (params.type === "witness") setWitnessSignatureUri(params.signatureUri);
    //         }
    //     }, [route.params])
    // );

     useFocusEffect(
  React.useCallback(() => {
    const params = route.params as { signatureUri?: string; type?: string } | undefined;

    if (params?.signatureUri && params?.type) {
      console.log("🖋️ Received Signature URI:", params.signatureUri);
      console.log("📄 Signature Type:", params.type);

      // ✅ Fixed line — using plain 'base64' instead of EncodingType
      FileSystem.readAsStringAsync(params.signatureUri, {
        encoding: 'base64',
      })
        .then((base64Data) => {
          const base64Image = `data:image/png;base64,${base64Data}`;
          console.log("✅ Base64 Image:", base64Image.substring(0, 100) + "...");

          // Convert Base64 → Blob for multipart upload
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
        setNomineeSignatureUri(params.signatureUri);
      } else if (params.type === "witness") {
        setWitnessSignatureUri(params.signatureUri);
      }
    }
  }, [route.params])
);


    const handleSubmit = async () => {
        console.log("📦 Received from context:", formData);

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

            // 🔹 Append main contextual data first
            requestData.append("CenterTargetId", formData?.selectedCenterTarget || "");
            requestData.append("FarmerDistributionId", formData?.Farmerdistribution || "");
            requestData.append("FarmerId", formData?.selectedFarmer || "");
            requestData.append("VarietyId", formData?.selectedVariety || "");
            requestData.append("DuringYear", formData?.Year?.toString() || "");
            requestData.append("SeedClass", formData?.seeds?.toString() || "");
            requestData.append("CommodityId", formData?.selectedCommodityType?.toString() || "");
            requestData.append("PlantingMaterial", "SEED");
            requestData.append("Area", formData?.Area || "0");

            // 🔹 Append Agreement form fields
            requestData.append("AuthorizedName", state.form.authorizedSignatory || "");
            requestData.append("BillNumber", state.form.BillNumber || "");
            requestData.append("TagNumber", state.form.TagNumber || "");
            requestData.append("LotNumber", state.form.LotNumber || "");
            requestData.append("DuringYear", state.form.DuringYear || "");

            // 🔹 Append captured images
            if (signaturePhoto) {
                requestData.append("Signature", {
                    uri: signaturePhoto,
                    type: "image/jpeg",
                    name: "signature.jpg",
                } as any);
            }

            if (profilePhoto) {
                requestData.append("ProfFile", {
                    uri: profilePhoto,
                    type: "image/jpeg",
                    name: "profile.jpg",
                } as any);
            }

            // 🔹 Append nominees
            nominees.forEach((nominee, index) => {
                Object.keys(nominee).forEach((key) => {
                    const value = nominee[key as keyof NomineeType];

                    if (key === "signature" && value) {
                        // 🔹 Send nominee signature image
                        requestData.append(`NomiNee[${index}][signature]`, {
                            uri: value,
                            type: "image/jpeg",
                            name: `nominee_signature_${index}.jpg`,
                        } as any);
                    } else {
                        // 🔹 Append normal text fields
                        requestData.append(
                            `NomiNee[${index}][${key}]`,
                            value?.toString() || ""
                        );
                    }
                });
            });


            // 🔹 Append witnesses
            witnesses.forEach((witness, index) => {
                Object.keys(witness).forEach((key) => {
                    requestData.append(
                        `Witness[${index}][${key}]`,
                        witness[key as keyof WitnessType]?.toString() || ""
                    );
                });
            });

            // 🔹 Log everything before sending
            console.log("🚀 Sending this FormData:");
            for (let [key, value] of (requestData as any).entries()) {
                console.log(`➡️ ${key}:`, value);
            }

            const token = await retrieveToken();

            const response = await apiClient.post("/api/mobile/agreement", requestData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

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
                Alert.alert("❌ Error", "Submission failed.");
            }
        } catch (error: any) {
            console.error("❌ Submit error:", error);
            Alert.alert(
                "Error",
                error.response?.data?.message || "Something went wrong."
            );
        }
    };





//   const handleSubmit = async () => {
//   console.log("📦 Received from context:", formData);
//   setIsSubmitting(true);

//   if (!isAgreementAccepted) {
//     Alert.alert(
//       "Agreement",
//       "Please read and accept the agreement terms before submitting."
//     );
//     return;
//   }

//   try {
//     const FS: any = FileSystem; // ✅ TypeScript ke liye fix
//     const requestData = new FormData();

//     // 🔹 Append main contextual data
//     requestData.append("CenterTargetId", formData?.selectedCenterTarget || "");
//     requestData.append("FarmerDistributionId", formData?.Farmerdistribution || "");
//     requestData.append("FarmerId", formData?.selectedFarmer || "");
//     requestData.append("VarietyId", formData?.selectedVariety || "");
//     requestData.append("DuringYear", formData?.Year?.toString() || "");
//     requestData.append("SeedClass", formData?.seeds?.toString() || "");
//     requestData.append("CommodityId", formData?.selectedCommodityType?.toString() || "");
//     requestData.append("PlantingMaterial", "SEED");
//     requestData.append("Area", formData?.Area || "0");

//     requestData.append("CertificateNo" , formData?.Certificate|| "");  
//         requestData.append("LandDetailId" , formData?.selectedLandId|| "");
//     requestData.append("SurveyNo" , formData?.Survey || "");

//     // 🔹 Append Agreement form fields
//     requestData.append("AuthorizedName", state.form.authorizedSignatory || "");
//     requestData.append("BillNumber", state.form.BillNumber || "");
//     requestData.append("TagNumber", state.form.TagNumber || "");
//     requestData.append("LotNumber", state.form.LotNumber || "");
//     requestData.append("DuringYear", state.form.DuringYear || "");

//     // 🔹 Append captured images (Profile + Signature)
//     if (signaturePhoto) {
//       requestData.append("Signature", {
//         uri: signaturePhoto,
//         type: "image/jpeg",
//         name: "signature.jpg",
//       } as any);
//     }

//     if (profilePhoto) {
//       requestData.append("ProfFile", {
//         uri: profilePhoto,
//         type: "image/jpeg",
//         name: "profile.jpg",
//       } as any);
//     }

//     // ✅ Helper to convert base64 to file URI
//     const convertBase64ToFile = async (base64Uri: string, name: string) => {
//       if (!base64Uri.startsWith("data:image")) return base64Uri; // Already file URI

//       const base64Data = base64Uri.split(",")[1];
//       const filePath = FS.cacheDirectory + `${name}.jpg`;
//       await FS.writeAsStringAsync(filePath, base64Data, {
//         encoding: FS.EncodingType.Base64,
//       });
//       return filePath;
//     };

//     // 🔹 Append nominees
//     for (let index = 0; index < nominees.length; index++) {
//       const nominee = nominees[index];

//       for (const key of Object.keys(nominee)) {
//         const value = nominee[key as keyof NomineeType];

//         if (key === "signature" && value) {
//           const fileUri = await convertBase64ToFile(
//             value,
//             `nominee_signature_${index}`
//           );

//           requestData.append(`NomiNee[${index}][signature]`, {
//             uri: fileUri,
//             type: "image/jpeg",
//             name: `nominee_signature_${index}.jpg`,
//           } as any);
//         } else {
//           requestData.append(
//             `NomiNee[${index}][${key}]`,
//             value?.toString() || ""
//           );
//         }
//       }
//     }

//     // 🔹 Append witnesses
//     for (let index = 0; index < witnesses.length; index++) {
//       const witness = witnesses[index];

//       for (const key of Object.keys(witness)) {
//         const value = witness[key as keyof WitnessType];

//         if (key === "signature" && value) {
//           const fileUri = await convertBase64ToFile(
//             value,
//             `witness_signature_${index}`
//           );

//           requestData.append(`Witness[${index}][signature]`, {
//             uri: fileUri,
//             type: "image/jpeg",
//             name: `witness_signature_${index}.jpg`,
//           } as any);
//         } else {
//           requestData.append(
//             `Witness[${index}][${key}]`,
//             value?.toString() || ""
//           );
//         }
//       }
//     }

//     // 🔹 Debugging
//     console.log("🚀 Sending this FormData:");
//     for (let [key, value] of (requestData as any).entries()) {
//       console.log(`➡️ ${key}:`, value);
//     }

//     // 🔹 API Call
//     const token = await retrieveToken();
//     const response = await apiClient.post("/api/mobile/agreement", requestData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.status === 200 || response.status === 201) {
//       Alert.alert("✅ Success", "Agreement submitted successfully.", [
//         {
//           text: "OK",
//           onPress: () => {
//             navigation.dispatch(
//               CommonActions.reset({
//                 index: 0,
//                 routes: [{ name: "Dashboard" }],
//               })
//             );
//           },
//         },
//       ]);
//     } else {
//       Alert.alert("❌ Error", "Submission failed.");
//     }
//   } catch (error: any) {
//     console.error("❌ Submit error:", error);
//     Alert.alert("Error", error.response?.data?.message || "Something went wrong.");
//   }
// };




    const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
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
                enableAutomaticScroll={false}   // 👈 Disable automatic scroll
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
                                    maxLength={25}
                                />



                                <Dropdown
                                    style={styles.dropdown}
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



                                <YearPickerInput
                                    value={nominee.year}
                                    onChange={(year) => updateNominee(index, "year", year)}
                                />



                                <Text style={styles.label}>Date of Birth</Text>
                                <CustomDateTimePicker
                                    value={nominee.dob ? new Date(nominee.dob) : new Date()}
                                    onChange={(date) => {
                                        const formattedDate = date.toISOString(); // ✅ ISO format with time
                                        console.log("Selected DOB (ISO):", formattedDate);

                                        updateNominee(index, "dob", formattedDate);

                                        // ✅ Calculate and update age too
                                        const age = calculateAge(formattedDate);
                                        updateNominee(index, "age", age.toString());
                                    }}
                                    mode="date"
                                />

                                <TextInput
                                    mode="outlined"
                                    label="Nominee Mobile No"
                                    keyboardType="phone-pad"
                                    value={nominee.mobileno}
                                    onChangeText={(text) => {
                                        const numericText = text.replace(/[^0-9]/g, "");
                                        updateNominee(index, "mobileno", numericText);
                                        validateMobile(numericText, "nominee", index);
                                    }}
                                    style={styles.input}
                                    maxLength={10}
                                    error={!!nomineeMobileErrors[index]}
                                />

                                {nomineeMobileErrors[index] ? (
                                    <HelperText type="error" visible={!!nomineeMobileErrors[index]}>
                                        {nomineeMobileErrors[index]}
                                    </HelperText>
                                ) : null}



                                <TextInput
                                    mode="outlined"
                                    label="Email"
                                    keyboardType="email-address"
                                    value={nominee.email}
                                    onChangeText={(text) => {
                                        updateNominee(index, "email", text);

                                        // 🔹 Real-time validation per nominee
                                        const updatedErrors = [...nomineeEmailErrors];

                                        if (text.length === 0) {
                                            updatedErrors[index] = ""; // no error if empty
                                        } else if (!isValidEmail(text)) {
                                            updatedErrors[index] = "Please enter a valid email address";
                                        } else {
                                            updatedErrors[index] = "";
                                        }

                                        setNomineeEmailErrors(updatedErrors);
                                    }}
                                    style={styles.input}
                                    maxLength={50}
                                    error={!!nomineeEmailErrors[index]}
                                />

                                {nomineeEmailErrors[index] ? (
                                    <HelperText type="error" visible={!!nomineeEmailErrors[index]}>
                                        {nomineeEmailErrors[index]}
                                    </HelperText>
                                ) : null}


                                <TextInput
                                    mode="outlined"
                                    label="Relation"
                                    value={nominee.relation}
                                    onChangeText={(text) => updateNominee(index, "relation", text)}
                                    style={styles.input}
                                    maxLength={15}
                                />


                                <TextInput
                                    mode="outlined"
                                    label="Address Line"
                                    value={nominee.addrline}
                                    onChangeText={(text) => {
                                        updateNominee(index, "addrline", text);
                                        validateAddress(text, "nominee", index);
                                    }}
                                    style={styles.input}
                                    maxLength={50}
                                    error={!!nomineeAddressErrors[index]}
                                />

                                {nomineeAddressErrors[index] ? (
                                    <HelperText type="error" visible={!!nomineeAddressErrors[index]}>
                                        {nomineeAddressErrors[index]}
                                    </HelperText>
                                ) : null}


                                <TextInput
                                    mode="outlined"
                                    label="Village Name"
                                    value={nominee.villagename}
                                    onChangeText={(text) => updateNominee(index, "villagename", text)}
                                    style={styles.input}
                                    maxLength={25}
                                />

                                <TextInput
                                    mode="outlined"
                                    label="Pincode"
                                    keyboardType="numeric"
                                    value={nominee.pincode}
                                    onChangeText={(text) => updateNominee(index, "pincode", text)}
                                    style={styles.input}
                                    maxLength={6}
                                />


                                <CommonPicker
                                    label="States"
                                    selectedValue={nominee.stateid || ""}
                                    onValueChange={(value) => handleStateChange(value, "Nominee", index)}
                                    items={statesList}
                                />


                                <CommonPicker
                                    label="District"
                                    selectedValue={nominee.districtid || ""}
                                    onValueChange={(value) => handleDistrictChange(value, "Nominee", index)}
                                    items={nomineeDistrictsList[index] || []}
                                />




                                <CommonPicker
                                    label="City"
                                    selectedValue={nominee.subdistrictid || ""}
                                    onValueChange={(value) => handleCityChange(value, "Nominee", index)}
                                    items={nomineeCitiesList[index] || []}
                                />


                                {nomineeSignatureUri && (
                                    <View style={{ marginVertical: 10, alignItems: "center" }}>
                                        <Text style={{ fontWeight: "bold" }}>Signature Preview:</Text>
                                        <Image
                                            source={{ uri: nomineeSignatureUri }}
                                            style={{ width: 250, height: 100, borderWidth: 1, borderColor: "#ccc", marginTop: 5 }}
                                            resizeMode="contain"
                                        />
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => navigation.navigate("Signature", { type: "nominee" })}
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
                                    maxLength={25}
                                />


                                <TextInput
                                    mode="outlined"
                                    label="Witness Mobile No"
                                    keyboardType="phone-pad"
                                    value={witness.witnessmobileno}
                                    onChangeText={(text) => {
                                        const numericText = text.replace(/[^0-9]/g, "");
                                        updateWitness(index, "witnessmobileno", numericText);
                                        validateMobile(numericText, "witness", index);
                                    }}
                                    style={styles.input}
                                    maxLength={10}
                                    error={!!witnessMobileErrors[index]}
                                />

                                {witnessMobileErrors[index] ? (
                                    <HelperText type="error" visible={!!witnessMobileErrors[index]}>
                                        {witnessMobileErrors[index]}
                                    </HelperText>
                                ) : null}


                                <TextInput
                                    mode="outlined"
                                    label="Email"
                                    keyboardType="email-address"
                                    value={witness.witnessemail}
                                    onChangeText={(text) => {
                                        updateWitness(index, "witnessemail", text);

                                        // 🔹 Real-time validation for this witness
                                        const updatedErrors = [...witnessEmailErrors];

                                        if (text.length === 0) {
                                            updatedErrors[index] = ""; // no error if empty
                                        } else if (!isWitnessEmail(text)) {
                                            updatedErrors[index] = "Please enter a valid email address";
                                        } else {
                                            updatedErrors[index] = "";
                                        }

                                        setWitnessEmailErrors(updatedErrors);
                                    }}
                                    style={styles.input}
                                    maxLength={25}
                                />

                                {witnessEmailErrors[index] ? (
                                    <HelperText type="error" visible={!!witnessEmailErrors[index]}>
                                        {witnessEmailErrors[index]}
                                    </HelperText>
                                ) : null}

                                <TextInput
                                    mode="outlined"
                                    label="Address Line"
                                    value={witness.addrline}
                                    onChangeText={(text) => {
                                        updateWitness(index, "addrline", text);
                                        validateAddress(text, "witness", index);
                                    }}
                                    style={styles.input}
                                    maxLength={50}
                                    error={!!witnessAddressErrors[index]}
                                />

                                {witnessAddressErrors[index] ? (
                                    <HelperText type="error" visible={!!witnessAddressErrors[index]}>
                                        {witnessAddressErrors[index]}
                                    </HelperText>
                                ) : null}

                                <TextInput
                                    mode="outlined"
                                    label="Pincode"
                                    keyboardType="numeric"
                                    value={witness.pincode}
                                    onChangeText={(text) => updateWitness(index, "pincode", text)}
                                    style={styles.input}
                                    maxLength={6}
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
                                    maxLength={25}
                                />

                                {witnessSignatureUri && (
                                    <View style={{ marginVertical: 10, alignItems: "center" }}>
                                        <Text style={{ fontWeight: "bold" }}>Signature Preview:</Text>
                                        <Image
                                            source={{ uri: witnessSignatureUri }}
                                            style={{ width: 250, height: 100, borderWidth: 1, borderColor: "#ccc", marginTop: 5 }}
                                            resizeMode="contain"
                                        />
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => navigation.navigate("Signature", { type: "witness" })}
                                >
                                    <MaterialCommunityIcons name="signature-freehand" size={26} color="#2C5EFF" />
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










                {/* Dynamic Commodity-Specific Dropdown */}
                {renderCommodityDropdown()}


                      <Card style={styles.signatureCard}>
      <Card.Content>
        <Text style={styles.cardTitle}>Signature & Profile Verification</Text>
        <Divider style={styles.divider} />

        <View style={styles.photoGrid}>
          {/* ✅ Signature Capture */}
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

          {/* ✅ Profile Capture */}
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
                            maxLength={20}
                        />


                        <Text style={styles.label}>Lot Number</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.LotNumber || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, LotNumber: text } })}
                            style={styles.input}
                            placeholder="Enter Lot number"
                            maxLength={5}
                        />



                        <Text style={styles.label}>Tag Number</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.TagNumber || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, TagNumber: text } })}
                            style={styles.input}
                            placeholder="Enter Tag number"
                            maxLength={5}
                        />


                        <Text style={styles.label}>Bill Number</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.BillNumber || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, BillNumber: text } })}
                            style={styles.input}
                            placeholder="Enter Bill number"
                            maxLength={5}
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

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={[
                        styles.submitButton,
                        (!isAgreementAccepted || isSubmitting) && styles.submitButtonDisabled,
                    ]}
                    contentStyle={styles.submitButtonContent}
                    icon="check"
                    disabled={!isAgreementAccepted || isSubmitting} // ✅ disable during submit
                >
                    {isSubmitting ? "Submitting..." : "Submit Agreement"}
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
    image: {
        width: 200,
        height: 200,
        marginVertical: 10,
        borderRadius: 10,
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

    photoContainer: {
        flexDirection: 'column',
        gap: 20,
        alignItems: 'center',   // centers horizontally
        justifyContent: 'center', // centers vertically
    },
    captureSection: {
        alignItems: 'center',
    },
    captureButton: {
        borderRadius: 10,
        backgroundColor: '#1976D2',
        width: '80%',
    },
    captureButtonAlt: {
        borderRadius: 10,
        backgroundColor: '#0288D1',
        width: '80%',
    },
    captureButtonContent: {
        height: 45,
    },
    previewImage: {
        width: 123,
        height: 140,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 2,
        borderColor: '#ddd',
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
    dropdown: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#000',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#000',
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

}); 