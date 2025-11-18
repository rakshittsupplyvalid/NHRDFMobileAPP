import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, TextInput, ScrollView , ActivityIndicator } from "react-native";
import { Card, Text, Divider, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import apiClient from "../Service/apiInterceptors";
import CommonPicker from "../CommonComponent/CommonDropdown";
import { fetchCommodityTypes, fetchCommodity, fetchVariety } from "../Service/fetchCommodity";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";

const AgreementListScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Dropdown data
  const [commodityTypes, setCommodityTypes] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [varieties, setVarieties] = useState<any[]>([]);
  const [seasonData, setSeasonData] = useState<any[]>([]);
  const [subSeasonList, setSubSeasonList] = useState<any[]>([]);

  // Form state
  const [aadharNumber, setAadharNumber] = useState("");
  const [selectedCommodityType, setSelectedCommodityType] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedVariety, setSelectedVariety] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedSubSeason, setSelectedSubSeason] = useState("");

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
    if (!aadharNumber || aadharNumber.length !== 12) {
      setAgreements([]);
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
      setAgreements(res.data || []);
    } catch (error) {
      console.error(error);
      setAgreements([]);
    } finally {
      setLoading(false);
    }
  };

  // Commodity change handlers
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
  };

  const handleNominee = (item: any) => {
    navigation.navigate("NomineeScreen", { agreementId: item.id });
  };

  const handleWitness = (item: any) => {
    navigation.navigate("WitnessScreen", { agreementId: item.id });
  };

  const handleInspection = (item: any, inspectionType: string) => {
    navigation.navigate("InspectionScreen", { 
      agreementId: item.id,
      inspectionType: inspectionType,
      agreementData: item
    });
  };

  const getInspectionStatus = (item: any, inspectionType: string) => {
    const inspectionKey = `${inspectionType.toLowerCase()}InspectionStatus`;
    return item[inspectionKey] || 'pending';
  };

  const getInspectionIcon = (inspectionType: string) => {
    switch (inspectionType) {
      case 'First': return "clipboard-check";
      case 'Second': return "clipboard-text";
      case 'Third': return "clipboard-list";
      case 'Fourth': return "clipboard-account";
      default: return "clipboard-check";
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Search Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.label}>Aadhar Number *</Text>
          <TextInput
            placeholder="Enter 12-digit Aadhar"
            value={aadharNumber}
            onChangeText={(text) => setAadharNumber(text.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            maxLength={12}
            style={styles.input}
          />

          <Text style={styles.label}>Commodity Type (Optional)</Text>
          <CommonPicker
            selectedValue={selectedCommodityType}
            onValueChange={handleCommodityTypeChange}
            items={commodityTypes}
          />

          <Text style={styles.label}>Commodity (Optional)</Text>
          <CommonPicker
            selectedValue={selectedCommodity}
            onValueChange={handleCommodityChange}
            items={commodities}
          />

          <Text style={styles.label}>Variety (Optional)</Text>
          <CommonPicker
            selectedValue={selectedVariety}
            onValueChange={(val) => setSelectedVariety(val)}
            items={varieties}
          />

          <Text style={styles.label}>Year (Optional)</Text>
          <CommonPicker
            selectedValue={selectedSeason}
            onValueChange={handleSeasonSelect}
            items={seasonData}
          />

          <Text style={styles.label}>Season (Optional)</Text>
          <CommonPicker
            selectedValue={selectedSubSeason}
            onValueChange={(value) => setSelectedSubSeason(value)}
            items={subSeasonList}
          />

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={clearAll}
              style={styles.clearButton}
              labelStyle={styles.clearButtonLabel}
            >
              Clear All
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSearch}
              style={styles.searchButton}
              labelStyle={styles.searchButtonLabel}
              disabled={aadharNumber.length !== 12}
            >
              Search Agreements
            </Button>
          </View>
        </Card.Content>
      </Card>

      {loading &&   <ActivityIndicator size="small" color="#4CAF50" />}

      {/* Agreements List */}
      {agreements.length > 0 &&
        agreements.map((agreement, index) => (
          <Card key={agreement.id || index} style={styles.agreementCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Agreement Details</Text>
              <Divider style={styles.headerDivider} />

              {[
                { label: "Farmer", value: agreement.farmername },
                { label: "Center", value: agreement.centername },
                { label: "Commodity", value: agreement.commodityname },
                { label: "Variety", value: agreement.varietyname },
                { label: "Lot Number", value: agreement.lotnumber },
                { label: "Year", value: agreement.year },
                { label: "Season", value: agreement.season },
              ].map((item, idx) => (
                <View key={idx} style={styles.detailRow}>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <Text style={styles.detailValue}>{String(item.value || "—")}</Text>
                  </View>
                </View>
              ))}

              {/* Four Stage Inspection - Now with same style as Nominee/Witness */}
              <View style={styles.inspectionSection}>
                <Text style={styles.inspectionTitle}>Four Stage Inspection</Text>
                <View style={styles.inspectionGrid}>
                  {['First', 'Second', 'Third', 'Fourth'].map((inspectionType) => {
                    const status = getInspectionStatus(agreement, inspectionType);
                    return (
                      <Button
                        key={inspectionType}
                        mode="outlined"
                        onPress={() => handleInspection(agreement, inspectionType)}
                        style={[
                          styles.inspectionButton,
                          status === 'completed' && styles.completedInspection
                        ]}
                        labelStyle={[
                          styles.inspectionButtonLabel,
                          status === 'completed' && styles.completedInspectionLabel
                        ]}
                        icon={getInspectionIcon(inspectionType)}
                      >
                        {status === 'completed' ? 'Completed' : inspectionType}
                      </Button>
                    );
                  })}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <Button
                  mode="outlined"
                  onPress={() => handleNominee(agreement)}
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonLabel}
                  icon="account-group"
                >
                  View Nominee
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => handleWitness(agreement)}
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonLabel}
                  icon="account-tie"
                >
                  View Witness
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}

   

      {aadharNumber.length === 0 && (
        <Text style={styles.initialText}>
          ** Enter Aadhar number to search agreements **
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  scrollContent: { 
    padding: 16, 
    paddingBottom: 30 
  },
  sectionCard: { 
    marginBottom: 16, 
    borderRadius: 12, 
    elevation: 2, 
    backgroundColor: "white" 
  },
  label: { 
    fontWeight: "600", 
    color: "#455A64", 
    marginBottom: 8, 
    fontSize: 14 
  },
  input: {
    backgroundColor: "white",
    height: 50,
    fontSize: 14,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  clearButton: {
    flex: 1,
    borderColor: "#ff6b6b",
  },
  clearButtonLabel: {
    color: "#ff6b6b",
    fontSize: 14,
  },
  searchButton: {
    flex: 2,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    elevation: 3,
    height: 39,
    justifyContent: "center",
  },
  searchButtonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  agreementCard: { 
    marginBottom: 16, 
    borderRadius: 12, 
    backgroundColor: "#fff", 
    elevation: 3 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#2E7D32", 
    marginBottom: 16 
  },
  headerDivider: { 
    backgroundColor: "#E0E0E0", 
    height: 1, 
    marginVertical: 8 
  },
  detailRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginVertical: 6 
  },
  detailContent: { 
    marginLeft: 8 
  },
  detailLabel: { 
    fontSize: 14, 
    color: "#555", 
    fontWeight: "500" 
  },
  detailValue: { 
    fontSize: 14, 
    color: "#1F2937", 
    fontWeight: "600", 
    marginTop: 2 
  },
  inspectionSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  inspectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  inspectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  inspectionButton: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 8,
    borderColor: "#666",
    marginBottom: 8,
  },
  completedInspection: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  inspectionButtonLabel: {
    fontSize: 13,
    color: "#333",
  },
  completedInspectionLabel: {
    color: "white",
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: "#666",
  },
  actionButtonLabel: {
    fontSize: 12,
  },
  loadingText: { 
    textAlign: "center", 
    marginTop: 10, 
    color: "#666" 
  },
  noDataText: { 
    marginTop: 16, 
    textAlign: "center", 
    color: "#999", 
    fontStyle: "italic" 
  },
  initialText: {
    marginTop: 16,
    textAlign: "center",
    color: "red",
    fontSize: 14,
  },
});

export default AgreementListScreen;