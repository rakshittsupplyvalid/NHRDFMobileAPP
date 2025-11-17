import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, TextInput, ScrollView } from "react-native";
import { Card, Text, Divider, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import apiClient from "../Service/apiInterceptors";
import CommonPicker from "../CommonComponent/CommonDropdown";
import { fetchCommodityTypes, fetchCommodity, fetchVariety } from "../Service/fetchCommodity";
import useForm from "../Form/UseForm";
import { useFormData } from "../Constants/FormContext";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";

const AgreementFormSimple: React.FC = () => {
  const { state, updateState } = useForm();
  const { setFormData } = useFormData();
  const navigation = useNavigation<any>();

  const [aadharData, setAadharData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Dropdown data
  const [commodityTypes, setCommodityTypes] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [varieties, setVarieties] = useState<any[]>([]);

  // 🆕 Season dropdown states
  const [seasonData, setSeasonData] = useState<any[]>([]);
  const [subSeasonList, setSubSeasonList] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedSubSeason, setSelectedSubSeason] = useState("");

  const aadharNumber = state.form?.aadharNumber || "";
  const selectedCommodityType = state.form?.commodityType || "";
  const selectedCommodity = state.form?.commodity || "";
  const selectedVariety = state.form?.variety || "";

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

  // 🆕 Fetch Season and SubSeason Data
  const fetchSeasonData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        "/api/season?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED"
      );
      const dropdownList = response.data?.map((item: any) => ({
        label: item?.name,
        value: item?.id,
      }));
      setSeasonData(dropdownList || []);
    } catch (error) {
      console.error("❌ Season API error:", error);
    } finally {
      setLoading(false);
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


  const handleFilter = async () => {
    if (!aadharNumber || aadharNumber.length !== 12) {
      setAadharData([]);
      alert("Please enter a valid 12-digit Aadhar number");
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

      const url = `/api/mobile/farmer/distribution/list?${params.toString()}`;
      const res = await apiClient.get(url);
      setAadharData(res.data || []);
    } catch (error) {
      console.error(error);
      setAadharData([]);
    } finally {
      setLoading(false);
    }
  };


  // Commodity change handlers
  const handleCommodityTypeChange = (value: string) => {
    updateState({
      form: { ...state.form, commodityType: value, commodity: "", variety: "" },
    });
    setCommodities([]);
    setVarieties([]);
  };

  const handleCommodityChange = (value: string) => {
    updateState({ form: { ...state.form, commodity: value, variety: "" } });
    setVarieties([]);
  };

  const handleNext = (record: any) => {
    const formPayload = {
      // farmerDistributionId: record.farmerid,
      // farmerId: record.id,
      farmerDistributionId: record.id,
      farmerId: record.farmerid,
      varietyId: record.varietyid || null,
      commodityId: record.commodityid || null,
      centerTargetId: record.centertargetid || null,
      billNumber: record.billnumber,
      area: record.area,
      lotNo: record.lotno,
      cropClassSeeds: record.cropclass,
      DistributionType: record.distributiontype,
    };

    setFormData(formPayload);
    navigation.navigate("Agreementland" as never);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.label}>Aadhar Number *</Text>
          <TextInput
            placeholder="Enter 12-digit Aadhar"
            value={aadharNumber}
            onChangeText={(text) =>
              updateState({
                form: { ...state.form, aadharNumber: text.replace(/[^0-9]/g, "") },
              })
            }
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
            onValueChange={(val) =>
              updateState({ form: { ...state.form, variety: val } })
            }
            items={varieties}
          />


          {/* 🆕 Year Dropdown */}
          <Text style={styles.label}>Year (Optional)</Text>
          <CommonPicker
            selectedValue={selectedSeason}
            onValueChange={(value) => handleSeasonSelect(value)}
            items={seasonData}
          />

          {/* 🆕 Season Dropdown */}
          <Text style={styles.label}>Season (Optional)</Text>
          <CommonPicker
            selectedValue={selectedSubSeason}
            onValueChange={(value) => setSelectedSubSeason(value)}
            items={subSeasonList}
          />

          <Button
  mode="contained"
  onPress={handleFilter}
  style={styles.filterButton}
  labelStyle={styles.filterButtonLabel}
 
>
  Search Farmer
</Button>



        </Card.Content>
      </Card>

      {loading && <Text style={{ textAlign: "center", marginTop: 10 }}>Loading...</Text>}

      {aadharData.length > 0 &&
        aadharData.map((record, index) => (
          <Card key={record.id || index} style={styles.farmerCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Farmer Details</Text>
              <Divider style={styles.headerDivider} />

              {[
                {
                  label: "Farmer",
                  value: `${record.farmername} ${record.relation} of ${record.relative}`
                },

                { label: "Center", value: record.centername },
                { label: "Crop Coblic Commodity", value: record.commodityname },
                { label: "Variety", value: record.varietyname },
                { label: "Year", value: record.season },
                { label: "Season", value: record.subseason },

              ].map((item, idx) => (
                <View key={idx} style={styles.detailRow}>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <Text style={styles.detailValue}>{String(item.value || "—")}</Text>
                  </View>
                </View>
              ))}

              <Button
                mode="contained"
                onPress={() => handleNext(record)}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
              >
                Create Agreement
              </Button>
            </Card.Content>
          </Card>
        ))}

      {!loading && aadharNumber.length  === 12 && aadharData.length === 0 && (
        <Text style={styles.noFarmerSelected}>No records found for this Aadhar.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  filterButton: {
  marginTop: 16,
  borderRadius: 10,
  backgroundColor: "#4CAF50", // vibrant blue
  elevation: 3,               // subtle shadow for Android
  shadowColor: "#000",        // subtle shadow for iOS
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  height: 39,
  justifyContent: "center",
},

filterButtonLabel: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600",
  letterSpacing: 0.5,
},
  scrollContent: { padding: 16, paddingBottom: 30 },
  sectionCard: { marginBottom: 16, borderRadius: 12, elevation: 2, backgroundColor: "white" },
  label: { fontWeight: "600", color: "#455A64", marginBottom: 8, fontSize: 14 },
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
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#2E7D32", marginBottom: 16 },
  headerDivider: { backgroundColor: "#E0E0E0", height: 1, marginVertical: 8 },
  farmerCard: { marginBottom: 16, borderRadius: 12, backgroundColor: "#fff", elevation: 3 },
  detailRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  detailLabel: { fontSize: 16, color: "#555", fontWeight: "500" },
  detailValue: { fontSize: 16, color: "#1F2937", fontWeight: "600", marginTop: 2 },
  submitButton: { marginTop: 12, backgroundColor: "#4CAF50", borderRadius: 8 },
  submitButtonContent: { paddingVertical: 6 },
  noFarmerSelected: { marginTop: 16, textAlign: "center", color: "#999", fontStyle: "italic" },
});

export default AgreementFormSimple;
