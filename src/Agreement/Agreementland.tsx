import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  BackHandler,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Button } from "react-native-paper";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFormData } from "../Constants/FormContext";
import { getFarmerLandDetail, farmerDetails } from "../Service/fetchCommodity";
import apiClient from "../Service/apiInterceptors";



const Agreementland: React.FC = () => {

  const { formData, setFormData } = useFormData();
  const navigation = useNavigation();

  const [landDetails, setLandDetails] = useState<any[]>([]);
  const [farmerInfo, setFarmerInfo] = useState<any>(null);
  const [selectedLandIds, setSelectedLandIds] = useState<string[]>([]);

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  

  useFocusEffect(
    useCallback(() => {
      const loadCode = async () => {
        if (!formData?.farmerDistributionId) return;

        setLoading(true);
        try {
          const res = await apiClient.get(
            `/api/static/generate/code/number/${formData.farmerDistributionId}`
          );
          if (res?.data) setInputValue(res.data.toString());
        } catch (e) {
          console.log("Generate code error:", e);
        }
        setLoading(false);
      };

      loadCode();

      const backPress = () => {
        navigation.navigate("Agreement Form" as never);
        return true;
      };

      const sub = BackHandler.addEventListener("hardwareBackPress", backPress);
      return () => sub.remove();

    }, [formData?.farmerDistributionId])
  );

  /* -------------------------------------------------------------------------- */
  /*                         FETCH FARMER + LAND DATA                           */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!formData?.farmerId) return;

    fetchFarmerInfo(formData.farmerId);
    fetchLandInfo(formData.farmerId);

  }, [formData?.farmerId]);


  const fetchFarmerInfo = async (farmerId: string) => {
    setLoading(true);
    try {
      const data = await farmerDetails(farmerId);
      setFarmerInfo(Array.isArray(data) ? data[0] : data);
    } catch (error) {
      console.log("Farmer fetch error:", error);
    }
    setLoading(false);
  };

  const fetchLandInfo = async (farmerId: string) => {
    setLoading(true);
    try {
      const data = await getFarmerLandDetail(farmerId);

      if (Array.isArray(data) && data.length > 0) {
        setLandDetails(data);
        setSelectedLandIds(data.length === 1 ? [data[0].id] : []);
      } else {
        setLandDetails([]);
        setSelectedLandIds([]);
      }

    } catch (e) {
      console.log("Land fetch error:", e);
    }
    setLoading(false);
  };


  const handleLandSelect = (id: string) => {
    setSelectedLandIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

 
  const handleNext = () => {

    setFormData({
      ...formData,
      CodeNumber: inputValue,
      landIds: selectedLandIds
    });

    navigation.navigate("Agreement" as never);
  };



  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={60}
    >
      <ScrollView style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Agreement Form" as never)}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Farmer Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>

          {/* --------------------- FARMER INFORMATION ---------------------- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Farmer Information</Text>

            {farmerInfo ? (
              <>
                <DetailRow label="Address" value={farmerInfo.farmeraddress} icon="home-city-outline" />
                <DetailRow label="State" value={farmerInfo.statename} icon="map-marker-outline" />
                <DetailRow label="District" value={farmerInfo.districtname} icon="map-marker-radius" />
                <DetailRow label="Sub-District" value={farmerInfo.subdistrictname} icon="map" />
                <DetailRow label="Village" value={farmerInfo.villagename} icon="home-city" />
              </>
            ) : (
              <Text style={styles.loadingText}>Loading farmer details…</Text>
            )}
          </View>

          {/* ------------------------ LAND DETAILS --------------------------- */}

          <Text style={styles.sectionTitle}>Land Details</Text>

          {loading && <Text style={styles.loadingText}>Loading…</Text>}
          {!loading && landDetails.length === 0 &&
            <Text style={styles.loadingText}>No land details found.</Text>
          }

          {landDetails.map((land) => (
            <TouchableOpacity
              key={land.id}
              style={[
                styles.card,
                selectedLandIds.includes(land.id) && { borderColor: "#007AFF", borderWidth: 2 }
              ]}
              onPress={() => handleLandSelect(land.id)}
            >
              {/* Checkbox */}
              <View style={styles.checkboxContainer}>
                <View style={[
                  styles.checkbox,
                  selectedLandIds.includes(land.id) && styles.checkboxSelected
                ]}>
                  {selectedLandIds.includes(land.id) && (
                    <MaterialIcons name="check" size={16} color="#fff" />
                  )}
                </View>

                <Text style={styles.checkboxLabel}>
                  {selectedLandIds.includes(land.id) ? "Selected" : "Select this land"}
                </Text>
              </View>

              {/* Land Details */}
              <DetailRow label="Land Number" value={land.number} icon="numeric" />
              <DetailRow label="Sub Number" value={land.subnumber} icon="numeric-2-box-outline" />
              <DetailRow
                label="Total Area"
                value={`${land.totalarea} ${land.unit}`}
                icon="square-outline"
              />
              <DetailRow label="Sowing Area" value={land.sowingarea} icon="nature" />
              <DetailRow label="Village" value={land.village} icon="home-city" />

              <DetailRow
                label="Approval Status"
                value={land.approvalstatus}
                valueColor={
                  land.approvalstatus === "APPROVED"
                    ? "#4CAF50"
                    : land.approvalstatus === "PENDING"
                      ? "#FFC107"
                      : "#F44336"
                }
                icon={
                  land.approvalstatus === "APPROVED"
                    ? "check-circle-outline"
                    : land.approvalstatus === "REJECTED"
                      ? "close-circle-outline"
                      : "clock-time-four-outline"
                }
              />

            </TouchableOpacity>
          ))}

      

          <View style={styles.card}>
            <InputField label="Class of Seeds" value={formData.cropClassSeeds} icon="seed-outline" />
            <InputField label="Area (Ha)" value={formData.area?.toString()} icon="vector-square" />
            <InputField label="Distribution Type" value={formData.DistributionType} icon="seed-outline" />
            <InputField label="Bill Number" value={formData.billNumber} icon="receipt" />
            <InputField label="Lot Number" value={formData.lotNo} icon="numeric" />

            {/* Code Number */}
            <View style={styles.inputContainer}>
              <View style={styles.labelWithIcon}>
                <MaterialIcons name="receipt" size={20} color="#2E7D32" />
                <Text style={styles.inputLabel}>Code Number</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter number"
                value={inputValue}
                onChangeText={setInputValue}
              />
            </View>

            <Button mode="contained" onPress={handleNext} style={styles.submitButton}>
              Next
            </Button>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const DetailRow = ({ icon, label, value, valueColor }: any) => (
  <View style={styles.detailRow}>
    <View style={styles.labelContainer}>
      {icon && (
        <MaterialCommunityIcons name={icon} size={20} color="#2E7D32" style={{ marginRight: 8 }} />
      )}
      <Text style={styles.detailLabel}>{label}:</Text>
    </View>
    <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>
      {value || "-"}
    </Text>
  </View>
);

const InputField = ({ label, value, icon }: any) => (
  <View style={styles.inputContainer}>
    <View style={styles.labelWithIcon}>
      <MaterialCommunityIcons name={icon} size={20} color="#2E7D32" />
      <Text style={styles.inputLabel}>{label}</Text>
    </View>
    <TextInput style={styles.input} value={value} editable={false} />
  </View>
);



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#4CAF50",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  headerTitle: { fontSize: 20, color: "#fff", fontWeight: "bold" },

  content: { padding: 14 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginVertical: 10
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    elevation: 3
  },

  /* Checkbox */
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 5,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkboxLabel: { fontSize: 15, color: "#333" },

  /* Inputs */
  inputContainer: { marginBottom: 12 },
  inputLabel: { marginLeft: 8, fontSize: 14, fontWeight: "600", color: "#444" },
  labelWithIcon: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },

  /* Detail rows */
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  labelContainer: { flexDirection: "row", alignItems: "center" },
  detailLabel: { fontSize: 14, color: "#555" },
  detailValue: { fontSize: 14, fontWeight: "bold", color: "#333" },

  loadingText: { color: "#555", fontStyle: "italic", marginBottom: 10 },

  submitButton: {
    marginTop: 12,
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    borderRadius: 8
  }
});

export default Agreementland;
