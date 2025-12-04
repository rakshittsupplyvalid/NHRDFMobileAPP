import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, TextInput, ScrollView, ActivityIndicator, BackHandler, Modal } from "react-native";
import { Card, Text, Divider, Button, Snackbar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import apiClient from "../Service/apiInterceptors";
import CommonPicker from "../CommonComponent/CommonDropdown";
import { fetchCommodityTypes, fetchCommodity, fetchVariety } from "../Service/fetchCommodity";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useFormData } from "../Constants/FormContext";

const AgreementListScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);

  // Dropdown data
  const [commodityTypes, setCommodityTypes] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [varieties, setVarieties] = useState<any[]>([]);
  const [seasonData, setSeasonData] = useState<any[]>([]);
  const [subSeasonList, setSubSeasonList] = useState<any[]>([]);

  // Form state
  const [aadharNumber, setAadharNumber] = useState("");
  const [error, setError] = useState("");
  const [selectedCommodityType, setSelectedCommodityType] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedVariety, setSelectedVariety] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedSubSeason, setSelectedSubSeason] = useState("");

  // Inspections state
  const [agreementInspections, setAgreementInspections] = useState<{ [key: string]: any[] }>({});
  const [inspectionsCount, setInspectionsCount] = useState<{ [key: string]: number }>({});

  // Modal state
  const [inspectionModalVisible, setInspectionModalVisible] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Handle Android Back Button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Dashboard" as never);
        return true;
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  // Fetch Commodity Data
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCommodityTypes();
        setCommodityTypes(data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCommodityType) {
      setCommodities([]);
      setVarieties([]);
      return;
    }
    (async () => {
      try {
        const items = await fetchCommodity(selectedCommodityType);
        setCommodities(items);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [selectedCommodityType]);

  useEffect(() => {
    if (!selectedCommodity) {
      setVarieties([]);
      return;
    }
    (async () => {
      try {
        const items = await fetchVariety(selectedCommodity);
        setVarieties(items);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [selectedCommodity]);

  // Fetch Season and SubSeason Data
  const fetchSeasonData = async () => {
    try {
      const response = await apiClient.get(
        "/api/season?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED"
      );
      const dropdownList = response.data?.map((item: any) => ({
        label: item?.name,
        value: item?.id,
      }));
      setSeasonData(dropdownList || []);
    } catch (error) {
      console.error("Season API error:", error);
    }
  };

  const handleSeasonSelect = async (value: string) => {
    setSelectedSeason(value);
    if (!value) {
      setSubSeasonList([]);
      setSelectedSubSeason("");
      return;
    }
    try {
      const response = await apiClient.get(`/api/subseason/${value}`);
      const formattedData = response.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));
      setSubSeasonList(formattedData);
    } catch (error) {
      console.log("Error fetching subseason:", error);
    }
  };

  useEffect(() => {
    fetchSeasonData();
  }, []);

  const handleSearch = async () => {
    // Reset previous states
    setSearchInitiated(true);
    setAgreements([]);
    setError("");
    
    // Aadhaar validation - ONLY on search click
    if (!aadharNumber) {
      setError("Aadhaar number is required");
      setSnackbarMessage("Please enter Aadhaar number");
      setSnackbarVisible(true);
      return;
    }
    
    if (aadharNumber.length !== 12) {
      setError("Aadhaar must be exactly 12 digits");
      setSnackbarMessage("Aadhaar must be exactly 12 digits");
      setSnackbarVisible(true);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("AadharNo", aadharNumber);
      params.append("ApprovalStatus", "PENDING");
      params.append("ApprovalStatus", "APPROVED");
      params.append("ApprovalStatus", "REJECTED");
      if (selectedCommodity) params.append("CommodityId", selectedCommodity);
      if (selectedVariety) params.append("VarietyId", selectedVariety);
      if (selectedSeason) params.append("SeasonId", selectedSeason);
      if (selectedSubSeason) params.append("SubSeasonId", selectedSubSeason);

      const url = `/api/agreement/list?${params.toString()}`;
      const res = await apiClient.get(url);
      
      if (res.data && res.data.length > 0) {
        setAgreements(res.data);
        setError(""); // Clear error if search successful
      } else {
        // Show message when no farmer agreements found
        setError("No agreements found for this Aadhaar number");
        setSnackbarMessage("No agreements found for this Aadhaar number");
        setSnackbarVisible(true);
      }
    } catch (error: any) {
      console.error("Search error:", error);
      
      // Handle specific API errors
      if (error.response?.status === 404) {
        setError("No farmer found with this Aadhaar number");
      } else if (error.response?.status === 400) {
        setError("Invalid Aadhaar number format");
      } else {
        setError("Error searching agreements. Please try again.");
      }
      setSnackbarMessage("Error searching agreements. Please try again.");
      setSnackbarVisible(true);
      setAgreements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchInspections = async (agreementId: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("AgreementCode", agreementId);
      params.append("ApprovalStatus", "PENDING");
      params.append("ApprovalStatus", "APPROVED");
      params.append("ApprovalStatus", "REJECTED");

      const url = `/api/inspection?${params.toString()}`;
      const res = await apiClient.get(url);
      const inspections = res.data || [];
      console.log("Fetched inspections for agreement", agreementId, inspections);

      setAgreementInspections((prev) => ({ ...prev, [agreementId]: inspections }));
      setInspectionsCount((prev) => ({ ...prev, [agreementId]: inspections.length }));
    } catch (error) {
      console.error("Error fetching inspections:", error);
      setSnackbarMessage("Error loading inspections");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCommodityTypeChange = (value: string) => {
    setSelectedCommodityType(value);
    setSelectedCommodity("");
    setSelectedVariety("");
    setCommodities([]);
    setVarieties([]);
  };

  const handleCommodityChange = (value: string) => {
    setSelectedCommodity(value);
    setSelectedVariety("");
    setVarieties([]);
  };

  const clearAll = () => {
    setAadharNumber("");
    setAgreements([]);
    setSelectedCommodityType("");
    setSelectedCommodity("");
    setSelectedVariety("");
    setSelectedSeason("");
    setSelectedSubSeason("");
    setAgreementInspections({});
    setInspectionsCount({});
    setSearchInitiated(false);
    setError(""); // Clear error on clear all
  };

  const handleNominee = (item: any) => {
    navigation.navigate("NomineeScreen", { agreementId: item.id });
  };

  const handleWitness = (item: any) => {
    navigation.navigate("WitnessScreen", { agreementId: item.id });
  };

  const handleInspection = (agreement: any, inspectionType: string) => {
    const inspections = agreementInspections[agreement.id] || [];
    const foundInspection = inspections.find(
      (ins) => ins.inspectionno.toUpperCase() === inspectionType.toUpperCase()
    );

    if (foundInspection) {
      console.log("Opening modal with inspection:", foundInspection);
      setSelectedInspection(foundInspection);
      setInspectionModalVisible(true);
    } else {
      navigation.navigate("Inspection Screen", {
        agreementId: agreement.id,
        inspectionType,
        agreementData: agreement,
      });
    }
  };

  const getInspectionIcon = (inspectionType: string) => {
    switch (inspectionType) {
      case "First":
        return "clipboard-check";
      case "Second":
        return "clipboard-text";
      case "Third":
        return "clipboard-list";
      case "Fourth":
        return "clipboard-account";
      default:
        return "clipboard-check";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.label}> Search by Aadhar Number *</Text>
            <TextInput
              placeholder="Enter 12-digit Aadhaar"
              value={aadharNumber}
              onChangeText={(text) => {
                // Only allow numbers
                const cleaned = text.replace(/[^0-9]/g, "");
                setAadharNumber(cleaned);
                // Clear error when user starts typing again
                if (error) {
                  setError("");
                }
              }}
              keyboardType="number-pad"
              maxLength={12}
              style={[styles.input, error && styles.inputError]}
            />
            {/* Error text only shows after search is clicked */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.label}>Commodity Type (Optional)</Text>
            <CommonPicker selectedValue={selectedCommodityType} onValueChange={handleCommodityTypeChange} items={commodityTypes} />

            <Text style={styles.label}>Commodity (Optional)</Text>
            <CommonPicker selectedValue={selectedCommodity} onValueChange={handleCommodityChange} items={commodities} />

            <Text style={styles.label}>Variety (Optional)</Text>
            <CommonPicker selectedValue={selectedVariety} onValueChange={(val) => setSelectedVariety(val)} items={varieties} />

            <Text style={styles.label}>Year (Optional)</Text>
            <CommonPicker selectedValue={selectedSeason} onValueChange={handleSeasonSelect} items={seasonData} />

            <Text style={styles.label}>Season (Optional)</Text>
            <CommonPicker selectedValue={selectedSubSeason} onValueChange={(value) => setSelectedSubSeason(value)} items={subSeasonList} />

            <View style={styles.buttonRow}>
              <Button mode="outlined" onPress={clearAll} style={styles.clearButton} labelStyle={styles.clearButtonLabel}>
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={handleSearch}
                style={styles.searchButton}
                labelStyle={styles.searchButtonLabel}
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loaderText}>Searching agreements...</Text>
          </View>
        )}

        {/* Agreements List */}
        {agreements.length > 0 ? (
          agreements.map((agreement, index) => (
            <Card key={agreement.id || index} style={styles.agreementCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Agreement Details</Text>
                <Divider style={styles.headerDivider} />

                {[{ label: "Farmer", value: agreement.farmername }, { label: "Center", value: agreement.centername }, { label: "Crop / Commodity", value: agreement.commodityname }, { label: "Variety", value: agreement.varietyname }, { label: "Class of Seed", value: agreement.seedclass }, { label: "Lot Number", value: agreement.lotnumber }, { label: "Year", value: agreement.year }, { label: "Season", value: agreement.season }].map((item, idx) => (
                  <View key={idx} style={styles.detailRow}>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>{item.label}</Text>
                      <Text style={styles.detailValue}>{String(item.value || "—")}</Text>
                    </View>
                  </View>
                ))}

                <Button
                  mode="contained"
                  style={{ marginTop: 12, backgroundColor: "#4CAF50" }}
                  labelStyle={{ color: "#fff" }}
                  onPress={() => navigation.navigate('Sealing Tagging')}
                >
                  Sealing/Tagging of Unprocessed Seed
                </Button>

                <Button
                  mode="contained"
                  onPress={() => handleFetchInspections(agreement.id)}
                  style={{ marginTop: 12, backgroundColor: "#2196F3" }}
                  labelStyle={{ color: "#fff" }}
                  disabled={loading}
                >
                  {`View Inspections (${inspectionsCount[agreement.id] ?? 0})`}
                </Button>

                {/* Inspection Buttons */}
                <View style={styles.inspectionSection}>
                  <Text style={styles.inspectionTitle}>Four Stage Inspection</Text>
                  <View style={styles.inspectionGrid}>
                    {["First", "Second", "Third", "Fourth"].map((inspectionType) => {
                      const inspections = agreementInspections[agreement.id] || [];
                      const foundInspection = inspections.find(
                        (ins) => ins.inspectionno.toUpperCase() === inspectionType.toUpperCase()
                      );

                      const buttonTitle = foundInspection ? `View ${inspectionType}` : `Create ${inspectionType}`;
                      const iconName = getInspectionIcon(inspectionType);

                      return (
                        <Button
                          key={inspectionType}
                          mode={foundInspection ? "contained" : "outlined"}
                          onPress={() => handleInspection(agreement, inspectionType)}
                          style={[
                            styles.inspectionButton,
                            foundInspection && styles.completedInspection
                          ]}
                          labelStyle={[
                            styles.inspectionButtonLabel,
                            foundInspection && styles.completedInspectionLabel
                          ]}
                          icon={({ size, color }) => (
                            <MaterialCommunityIcons name={iconName} size={size} color={foundInspection ? "#fff" : color} />
                          )}
                        >
                          {buttonTitle}
                        </Button>
                      );
                    })}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <Button mode="outlined" onPress={() => handleNominee(agreement)} style={styles.actionButton} labelStyle={styles.actionButtonLabel} icon="account-group">
                    View Nominee
                  </Button>
                  <Button mode="outlined" onPress={() => handleWitness(agreement)} style={styles.actionButton} labelStyle={styles.actionButtonLabel} icon="account-tie">
                    View Witness
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : searchInitiated && !loading ? (
          <Card style={styles.noResultsCard}>
            <Card.Content>
              <MaterialCommunityIcons name="information-outline" size={48} color="#FF9800" style={styles.noResultsIcon} />
              <Text style={styles.noResultsText}>No agreements found</Text>
              <Text style={styles.noResultsSubText}>
                No farmer agreements found for Aadhaar: {aadharNumber}
              </Text>
            </Card.Content>
          </Card>
        ) : null}

        {!searchInitiated && aadharNumber.length === 0 && (
          <Text style={styles.initialText}>** Enter Aadhaar number to search agreements **</Text>
        )}

        {/* Inspection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={inspectionModalVisible}
          onRequestClose={() => setInspectionModalVisible(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              width: '90%',
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
            }}>
              {selectedInspection && (
                <>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                    {selectedInspection.inspectionno} Inspection
                  </Text>

                  <Text><Text style={{ fontWeight: '600' }}>Farmer:</Text> {selectedInspection.farmername}</Text>
                  <Text><Text style={{ fontWeight: '600' }}>Center:</Text> {selectedInspection.centername}</Text>
                  <Text><Text style={{ fontWeight: '600' }}>Crop:</Text> {selectedInspection.crop}</Text>
                  <Text><Text style={{ fontWeight: '600' }}>Variety:</Text> {selectedInspection.variety}</Text>

                  <Text><Text style={{ fontWeight: '600' }}>Crop Condition:</Text> {selectedInspection.cropcondition}</Text>
                  <Text><Text style={{ fontWeight: '600' }}>Relation:</Text> {selectedInspection.relation}</Text>
                  <Text><Text style={{ fontWeight: '600' }}>Relative Name:</Text> {selectedInspection.relativename}</Text>
                  <Text><Text style={{ fontWeight: '600' }}>Inspection Date:</Text> {selectedInspection.inspectiondate}</Text>

                  <Button
                    mode="contained"
                    onPress={() => setInspectionModalVisible(false)}
                    style={{ marginTop: 16 }}
                  >
                    Close
                  </Button>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Snackbar for error messages */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5"  , marginBottom: 50},
  scrollContent: { padding: 16, paddingBottom: 30 },
  sectionCard: { marginBottom: 16, borderRadius: 12, elevation: 2, backgroundColor: "white" },
  label: { fontWeight: "600", color: "#455A64", marginBottom: 8, fontSize: 14 },
  input: { 
    backgroundColor: "white", 
    height: 50, 
    fontSize: 14, 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginBottom: 4, 
    borderWidth: 1, 
    borderColor: "#ddd" 
  },
  inputError: {
    borderColor: "#f44336",
    borderWidth: 1,
  },
  errorText: {
    color: "#f44336",
    fontSize: 12,
    marginBottom: 10,
  },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  clearButton: { flex: 1, borderColor: "#ff6b6b" },
  clearButtonLabel: { color: "#ff6b6b", fontSize: 14 },
  searchButton: { 
    flex: 2, 
    borderRadius: 10, 
    backgroundColor: "#4CAF50", 
    elevation: 3, 
    height: 39, 
    justifyContent: "center" 
  },
  searchButtonLabel: { color: "#fff", fontSize: 16, fontWeight: "600" },
  agreementCard: { marginBottom: 16, borderRadius: 12, backgroundColor: "#fff", elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#2E7D32", marginBottom: 16 },
  headerDivider: { backgroundColor: "#E0E0E0", height: 1, marginVertical: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  detailContent: { marginLeft: 8 },
  detailLabel: { fontSize: 14, color: "#555", fontWeight: "500" },
  detailValue: { fontSize: 14, color: "#1F2937", fontWeight: "600", marginTop: 2 },
  inspectionSection: { marginTop: 16, padding: 12, backgroundColor: "#f8f9fa", borderRadius: 8 },
  inspectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 12, textAlign: "center" },
  inspectionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  inspectionButton: { flex: 1, minWidth: "48%", borderRadius: 8, borderColor: "#666", marginBottom: 8 },
  completedInspection: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  inspectionButtonLabel: { fontSize: 12, textAlign: "center", color: "#666" },
  completedInspectionLabel: { color: "#fff" },
  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, gap: 8 },
  actionButton: { flex: 1, borderRadius: 8, borderColor: "#2196F3", height: 40 },
  actionButtonLabel: { fontSize: 14, color: "#2196F3" },
  initialText: { textAlign: "center", fontSize: 14, color: "#888", marginTop: 20 },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loaderText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  noResultsCard: {
    marginTop: 20,
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    borderColor: "#FF9800",
    borderWidth: 1,
  },
  noResultsIcon: {
    alignSelf: "center",
    marginBottom: 10,
  },
  noResultsText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9800",
    marginBottom: 5,
  },
  noResultsSubText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
  snackbar: {
    backgroundColor: "#323232",
    marginBottom: 20,
  },
});

export default AgreementListScreen;