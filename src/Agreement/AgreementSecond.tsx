import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Text, Card } from "react-native-paper";
import CommonPicker from "../CommonComponent/CommonDropdown";
import { commodity } from "../Constants/constants";
import { useNavigation } from "@react-navigation/native";
import useForm from "../Form/UseForm";

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const AgreementSecond: React.FC = () => {
    const { state, updateState } = useForm();
    const navigation = useNavigation<any>();







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


            <Button
                mode="outlined"
                icon="arrow-left"
                onPress={() => navigation.navigate("AgreementForm" as never)}
                style={{ marginBottom: 12 }}
            >
                Back to Agreement Form
            </Button>




            {/* Agreement Details Section */}
            <Card style={styles.sectionCard}>
                <Card.Content>


                    <Text style={styles.label}>Commodity</Text>
                    <CommonPicker
                        selectedValue={state.form.commodity || ""}
                        onValueChange={value =>
                            updateState({ ...state, form: { ...state.form, commodity: value } })
                        }
                        items={commodity}
                    />


                </Card.Content>
            </Card>



            {/* Submit Button */}
            <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
                icon="check"
            >
                Submit Agreement
            </Button>
        </KeyboardAwareScrollView>
    );
};

export default AgreementSecond;

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
        paddingVertical: 8,
        backgroundColor: "#2196F3",
        borderRadius: 8,
        elevation: 4,
    },
    submitButtonContent: {
        paddingVertical: 6,
    },
});