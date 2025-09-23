import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Button, Text, Card, TextInput } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import CommonPicker from "../CommonComponent/CommonDropdown";
import { commodity, Onion, Garlic, Potato, relations, states, districts, years } from "../Constants/constants";
import { useNavigation } from "@react-navigation/native";
import useForm from "../Form/UseForm";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AgreementSecond: React.FC = () => {
    const { state, updateState } = useForm();
    const navigation = useNavigation<any>();

    const handleSubmit = () => {
        console.log("Form Data:", state.form);
    };

    // Function to render commodity-specific dropdown
    const renderCommodityDropdown = () => {
        const selectedCommodity = state.form.commodity;
        
        switch(selectedCommodity) {
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
            
            case "garlic":
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
            
            case "potato":
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
                <Text style={styles.headerText}>Agreement Second</Text>
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
                {/* Personal Information Section */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        
                        {/* Name */}
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.name || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, name: text } })}
                            style={styles.input}
                            placeholder="Enter full name"
                        />

                        {/* Age */}
                        <Text style={styles.label}>Age</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.age || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, age: text } })}
                            style={styles.input}
                            placeholder="Enter age"
                            keyboardType="numeric"
                        />

                        {/* Year Dropdown */}
                        <Text style={styles.label}>Year</Text>
                        <CommonPicker
                            selectedValue={state.form.year || ""}
                            onValueChange={(value) =>
                                updateState({ ...state, form: { ...state.form, year: value } })
                            }
                            items={years}
                        />

                        {/* Relation Dropdown */}
                        <Text style={styles.label}>Relation</Text>
                        <CommonPicker
                            selectedValue={state.form.relation || ""}
                            onValueChange={(value) =>
                                updateState({ ...state, form: { ...state.form, relation: value } })
                            }
                            items={relations}
                        />

                        {/* Dependent Name */}
                        <Text style={styles.label}>Dependent Name (Son/Daughter/Wife of)</Text>
                        <TextInput
                            mode="outlined"
                            value={state.form.dependentName || ""}
                            onChangeText={(text) => updateState({ ...state, form: { ...state.form, dependentName: text } })}
                            style={styles.input}
                            placeholder="Enter dependent's name"
                        />
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
                    </Card.Content>
                </Card>

                {/* Commodity Selection Section */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Commodity Information</Text>
                        <Text style={styles.label}>Select Commodity</Text>
                        <CommonPicker
                            selectedValue={state.form.commodity || ""}
                            onValueChange={(value) =>
                                updateState({ 
                                    ...state, 
                                    form: { 
                                        ...state.form, 
                                        commodity: value,
                                        // Clear previous selection when commodity changes
                                        onionVariety: "",
                                        garlicVariety: "",
                                        potatoVariety: ""
                                    } 
                                })
                            }
                            items={commodity}
                        />
                    </Card.Content>
                </Card>

                {/* Dynamic Commodity-Specific Dropdown */}
                {renderCommodityDropdown()}

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
    submitButtonContent: {
        paddingVertical: 6,
    },
});