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
import RNFS from 'react-native-fs';

// Updated interfaces with only required fields
interface NomineeType {
    nomineename: string;
    mobileno: string;
    addrline: string;
}

interface WitnessType {
    witnessname: string;
    witnessmobileno: string;
}

// Bank account interface
interface BankAccountType {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    passbookPhoto: string;
}

const AgreementSecond: React.FC = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { formData } = useFormData();
    const { state, updateState } = useForm();

    // Simplified nominees and witnesses state
    const [nominees, setNominees] = useState<NomineeType[]>([
        {
            nomineename: "",
            mobileno: "",
            addrline: "",
        },
    ]);

    const [witnesses, setWitnesses] = useState<WitnessType[]>([
        {
            witnessname: "",
            witnessmobileno: "",
        },
    ]);

    // Bank account state
    const [bankAccount, setBankAccount] = useState<BankAccountType>({
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        passbookPhoto: "",
    });

    // State variables
    const [nomineeErrors, setNomineeErrors] = useState<{ [key: string]: string }[]>([]);
    const [witnessErrors, setWitnessErrors] = useState<{ [key: string]: string }[]>([]);
    const [bankAccountErrors, setBankAccountErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);
    const [passbookPhotoUri, setPassbookPhotoUri] = useState<string | null>(null);

    // Validation functions
    const isValidName = (name: string) => {
        if (!name) return false;
        return /^[a-zA-Z\s]{1,100}$/.test(name.trim());
    };

    const isValidMobile = (mobile: string) => {
        if (!mobile) return false;
        return /^[6-9]\d{9}$/.test(mobile);
    };

    const isValidAddress = (address: string) => {
        const trimmed = address?.trim() || "";
        return trimmed.length >= 1 && trimmed.length <= 200;
    };

    const isValidAccountNumber = (accountNumber: string) => {
        if (!accountNumber) return false;
        return /^\d{9,18}$/.test(accountNumber);
    };

    const isValidIFSC = (ifsc: string) => {
        if (!ifsc) return false;
        return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
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
            case 'addrline':
                if (!isValidAddress(value)) {
                    error = 'Address must be at least 1 character';
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
                    error = 'Name must be 1-100 letters only';
                }
                break;
            case 'witnessmobileno':
                if (!isValidMobile(value)) {
                    error = 'Valid 10-digit mobile number starting with 6-9';
                }
                break;
        }

        newErrors[index] = { ...newErrors[index], [field]: error };
        setWitnessErrors(newErrors);
    };

    const validateBankAccountField = (field: string, value: string) => {
        const newErrors = { ...bankAccountErrors };
        let error = '';

        switch (field) {
            case 'accountHolderName':
                if (!isValidName(value)) {
                    error = 'Account holder name must be 1-100 letters only';
                }
                break;
            case 'accountNumber':
                if (!isValidAccountNumber(value)) {
                    error = 'Account number must be 9-18 digits';
                }
                break;
            case 'ifscCode':
                if (!isValidIFSC(value)) {
                    error = 'Valid IFSC code required (e.g., SBIN0000123)';
                }
                break;
        }

        newErrors[field] = error;
        setBankAccountErrors(newErrors);
    };

    // Check if all validations pass
    const isFormValid = () => {
        const nomineeValid = nominees.every((nominee, index) => {
            return Object.keys(nomineeErrors[index] || {}).every(key =>
                !nomineeErrors[index][key]
            ) &&
                isValidName(nominee.nomineename) &&
                isValidMobile(nominee.mobileno) &&
                isValidAddress(nominee.addrline);
        });

        const witnessValid = witnesses.every((witness, index) => {
            return Object.keys(witnessErrors[index] || {}).every(key =>
                !witnessErrors[index][key]
            ) &&
                isValidName(witness.witnessname) &&
                isValidMobile(witness.witnessmobileno);
        });

        const bankAccountValid = 
            isValidName(bankAccount.accountHolderName) &&
            isValidAccountNumber(bankAccount.accountNumber) &&
            isValidIFSC(bankAccount.ifscCode) &&
            bankAccount.passbookPhoto;

        return nomineeValid && witnessValid && bankAccountValid && isAgreementAccepted;
    };

    // Update functions
    const updateNominee = (index: number, key: keyof NomineeType, value: string) => {
        const newNominees = [...nominees];
        newNominees[index][key] = value;
        setNominees(newNominees);
        validateNomineeField(index, key, value);
    };

    const updateWitness = (index: number, key: keyof WitnessType, value: string) => {
        const newWitnesses = [...witnesses];
        newWitnesses[index][key] = value;
        setWitnesses(newWitnesses);
        validateWitnessField(index, key, value);
    };

    const updateBankAccount = (key: keyof BankAccountType, value: string) => {
        setBankAccount(prev => ({ ...prev, [key]: value }));
        validateBankAccountField(key, value);
    };

    // Camera functions for passbook photo
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

    const openCamera = async () => {
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
                console.log("Captured passbook photo:", uri);
                setPassbookPhotoUri(uri || null);
                updateBankAccount('passbookPhoto', uri || '');
            }
        });
    };

    // Add/Delete Witness functions
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

    // Submit function
    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const requestData = new FormData();

            // Append main contextual data
            requestData.append("FarmerDistributionId", formData?.DistributedFarmerid || "");
            requestData.append("FarmerId", formData?.Farmerid || "");
            requestData.append("CenterTargetId", formData?.CenterTargetId || "");
            requestData.append("LandDetailId", formData?.selectedLandId || "");
            requestData.append("CertificateNo", formData?.Certificate || "");
            requestData.append("SurveyNo", formData?.Survey || "");
            requestData.append("VarietyId", formData?.VarietyId || "");
            requestData.append("DuringYear", formData?.Year?.toString() || "");
            requestData.append("SeedClass", formData?.seeds?.toString() || "");
            requestData.append("CommodityId", formData?.CommodityId || "");
            requestData.append("PlantingMaterial", formData?.distributiontype || "");
            requestData.append("Area", formData?.AreaFromAadhar || "0");

            // Append Agreement form fields
            requestData.append("AuthorizedName", state.form.authorizedSignatory || "");
            requestData.append("BillNumber", formData?.BillNumber || "");
            requestData.append("TagNumber", formData?.TagNumber || "");
            requestData.append("LotNumber", formData?.LotNumber || "");

            // Append nominees (only name, mobile, address)
            nominees.forEach((nominee, index) => {
                requestData.append(`NomiNee[${index}].nomineename`, nominee.nomineename || '');
                requestData.append(`NomiNee[${index}].mobileno`, nominee.mobileno || '');
                requestData.append(`NomiNee[${index}].addrline`, nominee.addrline || '');
            });

            // Append witnesses (only name and mobile)
            witnesses.forEach((witness, index) => {
                requestData.append(`Witness[${index}].witnessname`, witness.witnessname || '');
                requestData.append(`Witness[${index}].witnessmobileno`, witness.witnessmobileno || '');
            });

            // Append bank account details
            requestData.append("AccountHolderName", bankAccount.accountHolderName);
            requestData.append("AccountNumber", bankAccount.accountNumber);
            requestData.append("IFSCCode", bankAccount.ifscCode);
            
            if (passbookPhotoUri) {
                requestData.append("PassbookPhoto", {
                    uri: passbookPhotoUri,
                    type: "image/jpeg",
                    name: "passbook.jpg",
                } as any);
            }

            const token = await retrieveToken();

            const response = await apiClient.post("/api/mobile/agreement", requestData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

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
                {/* Nominee Section - Only Name, Address, Phone */}
                <Card style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Nominee Details</Text>
                    {nominees.map((nominee, index) => (
                        <Card key={index} style={styles.innerCard}>
                            <Card.Content>
                                <Text style={styles.sectionSubTitle}>Nominee {index + 1}</Text>

                                <Text style={styles.label}>Name *</Text>
                                <RNTextInput
                                    placeholder="Full Name"
                                    value={nominee.nomineename}
                                    onChangeText={(text) => updateNominee(index, "nomineename", text)}
                                    style={[
                                        styles.simpleInput,
                                        nomineeErrors[index]?.nomineename && styles.inputError
                                    ]}
                                    maxLength={100}
                                />
                                {nomineeErrors[index]?.nomineename ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.nomineename}>
                                        {nomineeErrors[index]?.nomineename}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Mobile Number *</Text>
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

                                <Text style={styles.label}>Address *</Text>
                                <RNTextInput
                                    placeholder="Full Address"
                                    value={nominee.addrline}
                                    onChangeText={(text) => updateNominee(index, "addrline", text)}
                                    style={[
                                        styles.simpleInput,
                                        nomineeErrors[index]?.addrline && styles.inputError
                                    ]}
                                    multiline
                                    numberOfLines={3}
                                    maxLength={200}
                                />
                                {nomineeErrors[index]?.addrline ? (
                                    <HelperText type="error" visible={!!nomineeErrors[index]?.addrline}>
                                        {nomineeErrors[index]?.addrline}
                                    </HelperText>
                                ) : null}
                            </Card.Content>
                        </Card>
                    ))}
                </Card>

                {/* Witness Section - Only Name and Phone */}
                <Card style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Witness Details</Text>
                    {witnesses.map((witness, index) => (
                        <Card key={index} style={styles.innerCard}>
                            <Card.Content>
                                <Text style={styles.sectionSubTitle}>Witness {index + 1}</Text>

                                <Text style={styles.label}>Name *</Text>
                                <RNTextInput
                                    placeholder="Full Name"
                                    value={witness.witnessname}
                                    onChangeText={(text) => updateWitness(index, "witnessname", text)}
                                    style={[
                                        styles.simpleInput,
                                        witnessErrors[index]?.witnessname && styles.inputError
                                    ]}
                                    maxLength={100}
                                />
                                {witnessErrors[index]?.witnessname ? (
                                    <HelperText type="error" visible={!!witnessErrors[index]?.witnessname}>
                                        {witnessErrors[index]?.witnessname}
                                    </HelperText>
                                ) : null}

                                <Text style={styles.label}>Mobile Number *</Text>
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

                                {witnesses.length > 1 && (
                                    <Button
                                        mode="outlined"
                                        icon="delete"
                                        onPress={() => deleteWitness(index)}
                                        textColor="red"
                                        style={{ marginVertical: 10, borderColor: "red" }}
                                    >
                                        Delete Witness
                                    </Button>
                                )}
                            </Card.Content>
                        </Card>
                    ))}
                    {witnesses.length < 2 && (
                        <Button mode="outlined" onPress={addWitness} style={{ marginVertical: 10 }}>
                            Add Another Witness
                        </Button>
                    )}
                </Card>

                {/* Bank Account Details Section */}
                <Card style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Bank Account Details</Text>
                    <Card.Content>
                        <Text style={styles.label}>Account Holder Name *</Text>
                        <RNTextInput
                            placeholder="Account Holder Name"
                            value={bankAccount.accountHolderName}
                            onChangeText={(text) => updateBankAccount("accountHolderName", text)}
                            style={[
                                styles.simpleInput,
                                bankAccountErrors.accountHolderName && styles.inputError
                            ]}
                            maxLength={100}
                        />
                        {bankAccountErrors.accountHolderName ? (
                            <HelperText type="error" visible={!!bankAccountErrors.accountHolderName}>
                                {bankAccountErrors.accountHolderName}
                            </HelperText>
                        ) : null}

                        <Text style={styles.label}>Account Number *</Text>
                        <RNTextInput
                            placeholder="Account Number"
                            keyboardType="numeric"
                            value={bankAccount.accountNumber}
                            onChangeText={(text) => {
                                const numericText = text.replace(/[^0-9]/g, "");
                                updateBankAccount("accountNumber", numericText);
                            }}
                            style={[
                                styles.simpleInput,
                                bankAccountErrors.accountNumber && styles.inputError
                            ]}
                            maxLength={18}
                        />
                        {bankAccountErrors.accountNumber ? (
                            <HelperText type="error" visible={!!bankAccountErrors.accountNumber}>
                                {bankAccountErrors.accountNumber}
                            </HelperText>
                        ) : null}

                        <Text style={styles.label}>IFSC Code *</Text>
                        <RNTextInput
                            placeholder="IFSC Code (e.g., SBIN0000123)"
                            value={bankAccount.ifscCode}
                            onChangeText={(text) => updateBankAccount("ifscCode", text.toUpperCase())}
                            style={[
                                styles.simpleInput,
                                bankAccountErrors.ifscCode && styles.inputError
                            ]}
                            maxLength={11}
                            autoCapitalize="characters"
                        />
                        {bankAccountErrors.ifscCode ? (
                            <HelperText type="error" visible={!!bankAccountErrors.ifscCode}>
                                {bankAccountErrors.ifscCode}
                            </HelperText>
                        ) : null}

                        <Text style={styles.label}>Passbook Photo *</Text>
                        <View style={styles.photoBlock}>
                            {passbookPhotoUri ? (
                                <Image source={{ uri: passbookPhotoUri }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.emptyBox}>
                                    <MaterialIcons name="photo-camera" size={28} color="#999" />
                                    <Text style={styles.emptyText}>No Passbook Photo</Text>
                                </View>
                            )}

                            <Button
                                mode="contained"
                                onPress={openCamera}
                                icon={() => <MaterialIcons name="photo-camera" size={20} color="#fff" />}
                                style={styles.actionButton}
                                contentStyle={styles.buttonContent}
                            >
                                Capture Passbook Photo
                            </Button>
                        </View>
                        {!bankAccount.passbookPhoto && (
                            <HelperText type="error" visible={!bankAccount.passbookPhoto}>
                                Passbook photo is required
                            </HelperText>
                        )}
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

// Styles (keep your existing styles, add new ones if needed)
const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#70B04F",
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 4,
    },
    backButton: {
        padding: 4,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    sectionCard: {
        marginBottom: 16,
        elevation: 2,
    },
    innerCard: {
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#333",
    },
    sectionSubTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 16,
        color: "#555",
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 4,
        color: "#333",
    },
    simpleInput: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 4,
        padding: 12,
        fontSize: 14,
        marginBottom: 8,
    },
    inputError: {
        borderColor: "#ff3b30",
    },
    dropdown: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 4,
        padding: 12,
        marginBottom: 8,
    },
    dropdownError: {
        borderColor: "#ff3b30",
    },
    placeholderStyle: {
        fontSize: 14,
        color: "#999",
    },
    selectedTextStyle: {
        fontSize: 14,
        color: "#333",
    },
    photoBlock: {
        alignItems: "center",
        marginVertical: 10,
    },
    previewImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
    emptyBox: {
        width: 200,
        height: 150,
        borderWidth: 2,
        borderColor: "#ddd",
        borderStyle: "dashed",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        backgroundColor: "#f9f9f9",
    },
    emptyText: {
        color: "#999",
        marginTop: 8,
        fontSize: 12,
    },
    actionButton: {
        marginTop: 8,
        backgroundColor: "#70B04F",
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
    },
    agreementContainer: {
        maxHeight: 200,
        marginBottom: 16,
    },
    agreementText: {
        fontSize: 12,
        lineHeight: 18,
        color: "#333",
    },
    agreementHeading: {
        fontWeight: "bold",
        fontSize: 14,
    },
    agreementNote: {
        fontStyle: "italic",
        color: "#666",
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginVertical: 8,
    },
    checkboxLabel: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        lineHeight: 20,
        color: "#333",
    },
    submitButton: {
        marginTop: 16,
        backgroundColor: "#70B04F",
        paddingVertical: 6,
    },
    submitButtonDisabled: {
        backgroundColor: "#ccc",
    },
    submitButtonContent: {
        paddingVertical: 8,
    },
    // Add any additional styles you need
});

export default AgreementSecond;