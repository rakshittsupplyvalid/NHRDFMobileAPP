import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
  Alert
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-paper";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFormData } from "../Constants/FormContext";
import { getFarmerLandDetail, farmerDetails } from "../Service/fetchCommodity";
import { BackHandler } from 'react-native';
import apiClient from "../Service/apiInterceptors";
import { KeyboardAvoidingView, Platform } from "react-native";

const Agreementland: React.FC = () => {
  const { formData } = useFormData();
  const { setFormData } = useFormData();
  const navigation = useNavigation();
  const [landDetails, setLandDetails] = useState<any[]>([]);
  const [farmerDetils, setFarmerDetils] = useState<any>(null);
  const [selectedLandIds, setSelectedLandIds] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formData?.farmerId) {
      fetchFarmerDetails(formData.farmerId);
      fetchLandDetails(formData.farmerId);
    }
  }, [formData?.farmerId]);

  // ✅ Auto-select first land if only one exists
  useEffect(() => {
    if (landDetails.length === 1) {
      setSelectedLandIds([landDetails[0].id]); // ✅ Array में रखें
    } else if (landDetails.length > 1) {
      // Multiple lands होने पर कोई auto-select नहीं
      setSelectedLandIds([]);
    }
  }, [landDetails]);

  const fetchFarmerDetails = async (farmerId: string) => {
    setLoading(true);
    try {
      const data = await farmerDetails(farmerId);
      if (data) setFarmerDetils(Array.isArray(data) ? data[0] : data);
    } catch (error) {
      console.log("Error fetching farmer details:", error);
    }
    setLoading(false);
  };

  const fetchLandDetails = async (farmerId: string) => {
    setLoading(true);
    try {
      const data = await getFarmerLandDetail(farmerId);
      console.log("Fetched land details:", data);

      if (data && data.length > 0) {
        setLandDetails(data);
        
        // ✅ एक ही land होने पर auto-select
        if (data.length === 1) {
          setSelectedLandIds([data[0].id]); // ✅ Array में रखें
        } else {
          setSelectedLandIds([]); // Multiple lands के लिए कोई auto-select नहीं
        }
      } else {
        setLandDetails([]);
        setSelectedLandIds([]);
      }
    } catch (error) {
      console.log("Error fetching land details:", error);
      setSelectedLandIds([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ सही handleLandSelect function
  const handleLandSelect = (id: string) => {
    setSelectedLandIds(prev => {
      // ✅ prev हमेशा array ही होगा
      if (prev.includes(id)) {
        // Unselect करें
        return prev.filter(x => x !== id);
      } else {
        // Select करें
        return [...prev, id];
      }
    });
  };

  useFocusEffect(
    useCallback(() => {
      const fetchCode = async () => {
        const currentFormData = formData;
        const distId = currentFormData?.farmerDistributionId;
        if (distId) {
          setLoading(true);
          try {
            const response = await apiClient.get(
              `/api/static/generate/code/number/${distId}`
            );
            if (response?.data) {
              setInputValue(response.data.toString());
              setGeneratedCode(response.data.toString());
            }
          } catch (err) {
            console.log(err);
          } finally {
            setLoading(false);
          }
        }
      };
      fetchCode();
    }, [formData])
  );

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

  const handleNext = (record: any) => {
    if (selectedLandIds.length === 0) {
      alert("Please select at least one land.");
      return;
    }

    const formPayload = {
      farmerfarmerDistributionId: record.farmerDistributionId || formData.farmerDistributionId,
      CodeNumber: inputValue,
      farmerId: record.farmerId || record.farmerId,
      varietyId: record.varietyId || formData.varietyId || null,
      commodityId: record.commodityId || formData.commodityId || null,
      centerTargetId: record.centerTargetId || formData.centerTargetId || null,
      billNumber: record.billNumber || formData.billNumber,
      area: record.area || formData.area,
      lotNo: record.lotNo || formData.lotNo,
      cropClassSeeds: record.cropClassSeeds || formData.cropClassSeeds,
      DistributionType: record.DistributionType || formData.DistributionType,
      landIds: selectedLandIds
    };

    setFormData({ ...formData, ...formPayload });
    navigation.navigate("Agreement" as never);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("Agreement Form" as never)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Farmer Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Farmer Info Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Farmer Information</Text>
            {farmerDetils ? (
              <>
                <DetailRow icon="home-city-outline" label="Address" value={farmerDetils.farmeraddress} />
                <DetailRow icon="map-marker-outline" label="State" value={farmerDetils.statename} />
                <DetailRow icon="map-marker-radius" label="District" value={farmerDetils.districtname} />
                <DetailRow icon="map" label="Sub-District" value={farmerDetils.subdistrictname} />
                <DetailRow icon="map-marker-radius" label="Village" value={farmerDetils.villagename} />
              </>
            ) : (
              <Text style={styles.loadingText}>Loading farmer details...</Text>
            )}
          </View>

          {/* Land Details */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Land Details</Text>
          {loading && <Text style={styles.loadingText}>Loading details...</Text>}
          {!loading && landDetails.length === 0 && (
            <Text style={styles.loadingText}>No land details found.</Text>
          )}

          {!loading &&
            landDetails.map((land, index) => (
              <TouchableOpacity
                key={land.id || index}
                style={[
                  styles.card,
                  selectedLandIds.includes(land.id) && { borderColor: "#007AFF", borderWidth: 2 }
                ]}
                onPress={() => handleLandSelect(land.id)}
              >
                {/* ✅ Checkbox indicator */}
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

                <View style={styles.detailsContainer}>
                  <DetailRow icon="numeric" label="Land Number" value={land.number} />
                  <DetailRow icon="numeric-2-box-outline" label="Sub Number" value={land.subnumber} />
                  <DetailRow
                    icon="square-outline"
                    label="Total Area"
                    value={`${land.totalarea ?? "-"} ${land.unit ?? ""}`}
                  />
                  <DetailRow icon="nature" label="Sowing Area" value={land.sowingarea ?? "-"} />
                  <DetailRow icon="home-city" label="Village" value={land.village} />
                  <DetailRow
                    icon={
                      land.approvalstatus === "PENDING"
                        ? "clock-time-four-outline"
                        : land.approvalstatus === "APPROVED"
                          ? "check-circle-outline"
                          : "close-circle-outline"
                    }
                    label="Approval Status"
                    value={land.approvalstatus}
                    valueColor={
                      land.approvalstatus === "PENDING"
                        ? "#FFC107"
                        : land.approvalstatus === "APPROVED"
                          ? "#4CAF50"
                          : "#F44336"
                    }
                  />
                </View>
              </TouchableOpacity>
            ))}

          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <View style={styles.labelWithIcon}>
                <MaterialCommunityIcons name="seed-outline" size={20} color="#2E7D32" style={{ marginRight: 6 }} />
                <Text style={styles.inputLabel}>Class of Seeds</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData?.cropClassSeeds}
                editable={false}
                placeholder="Crop Class Seeds"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelWithIcon}>
                <MaterialCommunityIcons name="vector-square" size={20} color="#2E7D32" style={{ marginRight: 6 }} />
                <Text style={styles.inputLabel}>Area in Hectare</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData?.area?.toString()}
                editable={false}
                placeholder="Area"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelWithIcon}>
                <MaterialCommunityIcons name="seed-outline" size={20} color="#2E7D32" style={{ marginRight: 6 }} />
                <Text style={styles.inputLabel}>Distribution Type</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData?.DistributionType}
                editable={false}
                placeholder="Distribution Type"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelWithIcon}>
                <MaterialIcons name="receipt" size={20} color="#2E7D32" style={{ marginRight: 6 }} />
                <Text style={styles.inputLabel}>Bill Number</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData?.billNumber}
                editable={false}
                placeholder="Bill Number"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelWithIcon}>
                <MaterialCommunityIcons name="numeric" size={20} color="#2E7D32" style={{ marginRight: 6 }} />
                <Text style={styles.inputLabel}>Lot Number</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData?.lotNo}
                editable={false}
                placeholder="Lot Number"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelWithIcon}>
                <MaterialIcons name="receipt" size={20} color="#2E7D32" style={{ marginRight: 6 }} />
                <Text style={styles.inputLabel}>Code Number</Text>
              </View>
              <TextInput
                style={[styles.inputCode, { flex: 1 }]}
                placeholder="Enter number"
                value={inputValue}
                onChangeText={setInputValue}
              />
            </View>

            <Button
              mode="contained"
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              onPress={() => handleNext(formData)}
            >
              Next
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const DetailRow = (
  {
    icon,
    label,
    value,
    valueColor,
  }: {
    icon?: string;
    label: string;
    value: string | number | null;
    valueColor?: string;
  }
) => (
  <View style={styles.detailRow}>
    <View style={styles.labelContainer}>
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color="#2E7D32"
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={styles.detailLabel}>{label}:</Text>
    </View>
    <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>
      {value ?? "-"}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: "#4CAF50",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1B5E20", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  // Checkbox styles
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  inputContainer: { marginBottom: 12 },
  inputLabel: { fontSize: 14, color: "#333", marginBottom: 4, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    color: "#555",
    fontSize: 15,
  },
  inputCode: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  labelWithIcon: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  detailsContainer: { marginTop: 6 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
    marginVertical: 4,
  },
  labelContainer: { flexDirection: "row", alignItems: "center" },
  detailLabel: { fontSize: 15, color: "#555", fontWeight: "500" },
  detailValue: { fontSize: 15, color: "#1F2937", fontWeight: "600" },
  loadingText: { fontSize: 15, color: "#555", marginVertical: 8, fontStyle: "italic" },
  submitButton: { marginTop: 12, backgroundColor: "#4CAF50", borderRadius: 8 },
  submitButtonContent: { paddingVertical: 6 },
});

export default Agreementland;