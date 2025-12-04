import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  Alert, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity 
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { BackHandler } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Dropdown } from 'react-native-element-dropdown';

export default function SealingTagging() {
  const navigation = useNavigation();

  // Form states
  const [estimatedYields, setEstimatedYields] = useState("");
  const [dateOfHarvesting, setDateOfHarvesting] = useState("");
  const [dateOfThreshing, setDateOfThreshing] = useState("");
  const [dateOfSealing, setDateOfSealing] = useState(new Date().toISOString().split('T')[0]);
  const [dateOfSeedLifting, setDateOfSeedLifting] = useState("");
  const [quantityUnprocessedSeed, setQuantityUnprocessedSeed] = useState("");
  const [numberOfBags, setNumberOfBags] = useState("");
  const [nameOfStaff, setNameOfStaff] = useState("");
  const [modeOfTransport, setModeOfTransport] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");

  // Date picker states
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [currentDateField, setCurrentDateField] = useState("");


   const [showTagDetails, setShowTagDetails] = useState(false);


  const toggleTagDetails = () => {
    setShowTagDetails(!showTagDetails);
  };


  // Mode of transport options
  const transportOptions = [
    { label: 'Shared Transport', value: 'shared' },
    { label: 'Hired Vehicle', value: 'hired' },
    { label: 'Office Vehicle', value: 'office' },
    { label: 'Farmer Own', value: 'farmer' },
  ];

  // Vehicle details based on mode
  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleNumber: "",
    vehicleType: "",
  });

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

  // Date picker functions
  const showDatePicker = (fieldName: string) => {
    setCurrentDateField(fieldName);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    switch (currentDateField) {
      case "harvesting":
        setDateOfHarvesting(formattedDate);
        break;
      case "threshing":
        setDateOfThreshing(formattedDate);
        break;
      case "seedLifting":
        setDateOfSeedLifting(formattedDate);
        break;
    }
    
    hideDatePicker();
  };

  // Fill dummy data for testing
  const fillDummyData = () => {
    setEstimatedYields("500");
    setDateOfHarvesting("2024-02-15");
    setDateOfThreshing("2024-02-20");
    setDateOfSeedLifting("2024-02-25");
    setQuantityUnprocessedSeed("450");
    setNumberOfBags("15");
    setNameOfStaff("Random Staff");
    setModeOfTransport("hired");
    setDriverName("Random Driver");
    setDriverContact("9876543210");
    setVehicleDetails({
      vehicleNumber: "MH12AB1234",
      vehicleType: "Truck",
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validation
    if (!estimatedYields || !quantityUnprocessedSeed || !numberOfBags || !nameOfStaff) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const formData = {
      estimatedYields,
      dateOfHarvesting,
      dateOfThreshing,
      dateOfSealing, // Auto-filled current date
      dateOfSeedLifting,
      quantityUnprocessedSeed,
      numberOfBags,
      nameOfStaff,
      modeOfTransport,
      vehicleDetails,
      driverName,
      driverContact,
    };

    console.log("Form Data:", formData);
    Alert.alert("Success", "Sealing/Tagging data submitted successfully!");
    
    // Navigate back or clear form
    // navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Sealing/Tagging of Unprocessed Seed</Text>

      {/* Estimated Yields */}
      <Text style={styles.label}>Estimated Yields (kg) *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter estimated yield in kg"
        value={estimatedYields}
        onChangeText={setEstimatedYields}
        keyboardType="numeric"
      />

      {/* Date of Harvesting */}
      <Text style={styles.label}>Date of Harvesting</Text>
      <TouchableOpacity onPress={() => showDatePicker("harvesting")}>
        <TextInput
          style={styles.input}
          placeholder="Select date"
          value={dateOfHarvesting}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      {/* Date of Threshing */}
      <Text style={styles.label}>Date of Threshing</Text>
      <TouchableOpacity onPress={() => showDatePicker("threshing")}>
        <TextInput
          style={styles.input}
          placeholder="Select date"
          value={dateOfThreshing}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      {/* Date of Sealing/Tagging (Auto-filled) */}
      <Text style={styles.label}>Date of Sealing/Tagging</Text>
      <TextInput
        style={[styles.input, styles.disabledInput]}
        value={dateOfSealing}
        editable={false}
      />
      

      {/* Date of seed lifting from the farmer */}
      <Text style={styles.label}>Date of Seed Lifting from Farmer</Text>
      <TouchableOpacity onPress={() => showDatePicker("seedLifting")}>
        <TextInput
          style={styles.input}
          placeholder="Select date"
          value={dateOfSeedLifting}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>


       <TouchableOpacity style={styles.button} onPress={toggleTagDetails}>
        <Text style={styles.buttonText}>Show Tag Details</Text>
      </TouchableOpacity>

      {/* Tag details UI */}
      {showTagDetails && (
        <View style={styles.tagDetailsContainer}>
          <Text style={styles.tagText}>Tag ID: 12345</Text>
          <Text style={styles.tagText}>Type: Seed</Text>
          <Text style={styles.tagText}>Status: Active</Text>
        </View>
      )}
      

      {/* Quantity of unprocessed seed */}
      <Text style={styles.label}>Quantity of Unprocessed Seed (kg) *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter quantity in kg"
        value={quantityUnprocessedSeed}
        onChangeText={setQuantityUnprocessedSeed}
        keyboardType="numeric"
      />

      {/* Number of bags */}
      <Text style={styles.label}>No. of Bags *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter number of bags"
        value={numberOfBags}
        onChangeText={setNumberOfBags}
        keyboardType="numeric"
      />

      {/* Name of staff */}
      <Text style={styles.label}>Name of Staff *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter staff name"
        value={nameOfStaff}
        onChangeText={setNameOfStaff}
      />

      {/* Mode of Transport */}
      <Text style={styles.label}>Mode of Transport</Text>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={transportOptions}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Select mode of transport"
        searchPlaceholder="Search..."
        value={modeOfTransport}
        onChange={item => {
          setModeOfTransport(item.value);
        }}
      />

      {/* Vehicle Details (conditionally shown) */}
      {modeOfTransport && (
        <View style={styles.vehicleSection}>
          <Text style={styles.subHeader}>Vehicle Details</Text>
          
          <Text style={styles.label}>Vehicle Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter vehicle number"
            value={vehicleDetails.vehicleNumber}
            onChangeText={(text) => setVehicleDetails({...vehicleDetails, vehicleNumber: text})}
          />

          <Text style={styles.label}>Vehicle Type</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter vehicle type (e.g., Truck, Van)"
            value={vehicleDetails.vehicleType}
            onChangeText={(text) => setVehicleDetails({...vehicleDetails, vehicleType: text})}
          />
        </View>
      )}

      {/* Driver Details */}
      <Text style={styles.label}>Driver Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter driver name"
        value={driverName}
        onChangeText={setDriverName}
      />

      <Text style={styles.label}>Driver Contact Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter driver contact"
        value={driverContact}
        onChangeText={setDriverContact}
        keyboardType="phone-pad"
        maxLength={10}
      />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* <Button
          title="Fill Dummy Data"
          onPress={fillDummyData}
          color="#4CAF50"
        />
         */}
        <View style={styles.spacer} />
        
        <Button
          title="Submit"
          onPress={handleSubmit}
          color="#2196F3"
        />
      </View>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,

    marginBottom: 50,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
    color: "#455A64",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 2,
    marginBottom: 5,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#999",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#000",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
  },
  vehicleSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  spacer: {
    height: 15,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tagDetailsContainer: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 5,
  },
  tagText: {
    fontSize: 14,
    marginBottom: 4,
  },

});