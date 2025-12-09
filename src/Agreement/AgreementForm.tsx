import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  BackHandler,
} from "react-native";
import { Card, Text, Divider, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import apiClient from "../Service/apiInterceptors";
import CommonPicker from "../CommonComponent/CommonDropdown";

import {
  fetchCommodityTypes,
  fetchCommodity,
  fetchVariety,
} from "../Service/fetchCommodity";

import useForm from "../Form/UseForm";
import { useFormData } from "../Constants/FormContext";

const AgreementFormSimple: React.FC = () => {
  const { state, updateState } = useForm();
  const { setFormData } = useFormData();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(false);
  const [farmerList, setFarmerList] = useState<any[]>([]);

  // Dropdown states
  const [commodityTypes, setCommodityTypes] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [varieties, setVarieties] = useState<any[]>([]);

  const [seasonList, setSeasonList] = useState<any[]>([]);
  const [subSeasonList, setSubSeasonList] = useState<any[]>([]);

  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedSubSeason, setSelectedSubSeason] = useState("");

  const aadhar = state.form?.aadharNumber || "";
  const selectedType = state.form?.commodityType || "";
  const selectedCommodity = state.form?.commodity || "";
  const selectedVariety = state.form?.variety || "";


  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Dashboard" as never);
        return true;
      };

      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => sub.remove();
    }, [navigation])
  );

  // -----------------------------------------------------------
  // 📌 Fetch Commodity Type (initial load)
  // -----------------------------------------------------------
  useEffect(() => {
    const loadCommodityTypes = async () => {
      try {
        const list = await fetchCommodityTypes();
        setCommodityTypes(list);
      } catch (err) {
        console.error("Commodity type error:", err);
      }
    };

    loadCommodityTypes();
  }, []);

  // -----------------------------------------------------------
  // 📌 Fetch Commodity when Type changes
  // -----------------------------------------------------------
  useEffect(() => {
    if (!selectedType) {
      setCommodities([]);
      setVarieties([]);
      return;
    }

    const loadCommodities = async () => {
      try {
        const list = await fetchCommodity(selectedType);
        setCommodities(list);
      } catch (err) {
        console.error("Commodity error:", err);
      }
    };

    loadCommodities();
  }, [selectedType]);

  // -----------------------------------------------------------
  // 📌 Fetch Variety when Commodity changes
  // -----------------------------------------------------------
  useEffect(() => {
    if (!selectedCommodity) {
      setVarieties([]);
      return;
    }

    const loadVariety = async () => {
      try {
        const list = await fetchVariety(selectedCommodity);
        setVarieties(list);
      } catch (err) {
        console.error("Variety error:", err);
      }
    };

    loadVariety();
  }, [selectedCommodity]);

  // -----------------------------------------------------------
  // 📌 Fetch Seasons (initial load)
  // -----------------------------------------------------------
  useEffect(() => {
    const loadSeasonData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(
          "/api/season?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED"
        );

        const formatted =
          res.data?.map((item: any) => ({
            label: item.name,
            value: item.id,
          })) || [];

        setSeasonList(formatted);
      } catch (err) {
        console.error("Season error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSeasonData();
  }, []);

  
  const handleSeasonSelect = async (id: string) => {
    setSelectedSeason(id);
    if (!id) {
      setSubSeasonList([]);
      setSelectedSubSeason("");
      return;
    }

    try {
      const res = await apiClient.get(`/api/subseason/${id}`);

      const formatted =
        res.data?.map((item: any) => ({
          label: item.name,
          value: item.id,
        })) || [];

      setSubSeasonList(formatted);
    } catch (err) {
      console.error("Sub-season error:", err);
    }
  };

  // -----------------------------------------------------------
  // 🔍 Search Farmer by Filters
  // -----------------------------------------------------------
  const handleSearchFarmer = async () => {
    if (!aadhar || aadhar.length !== 12) {
      alert("Please enter a valid 12-digit Aadhar number");
      setFarmerList([]);
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        AadharNo: aadhar,
        ApprovalStatus: "PENDING",
      });

      params.append("ApprovalStatus", "APPROVED");
      params.append("ApprovalStatus", "REJECTED");

      if (selectedCommodity) params.append("CommodityId", selectedCommodity);
      if (selectedVariety) params.append("VarietyId", selectedVariety);
      if (selectedSeason) params.append("SeasonId", selectedSeason);
      if (selectedSubSeason) params.append("SubSeasonId", selectedSubSeason);

      const url = `/api/mobile/farmer/distribution/list?${params.toString()}`;
      const res = await apiClient.get(url);

      setFarmerList(res.data || []);
    } catch (err) {
      console.error("Farmer fetch error:", err);
      setFarmerList([]);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------
  // 📝 Save & Navigate
  // -----------------------------------------------------------
  const handleNext = (record: any) => {
    const payload = {
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

    setFormData(payload);
    navigation.navigate("Agreementland" as never);
  };

  // -----------------------------------------------------------
  // UI Rendering
  // -----------------------------------------------------------
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Main Form */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          {/* Aadhaar Input */}
          <Text style={styles.label}>Aadhar Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 12-digit Aadhar"
            value={aadhar}
            maxLength={12}
            keyboardType="number-pad"
            onChangeText={(txt) =>
              updateState({
                form: { ...state.form, aadharNumber: txt.replace(/[^0-9]/g, "") },
              })
            }
          />

          {/* Dropdowns */}
          <Text style={styles.label}>Commodity Type</Text>
          <CommonPicker
            selectedValue={selectedType}
            onValueChange={(v) =>
              updateState({
                form: { ...state.form, commodityType: v, commodity: "", variety: "" },
              })
            }
            items={commodityTypes}
          />

          <Text style={styles.label}>Commodity</Text>
          <CommonPicker
            selectedValue={selectedCommodity}
            onValueChange={(v) =>
              updateState({
                form: { ...state.form, commodity: v, variety: "" },
              })
            }
            items={commodities}
          />

          <Text style={styles.label}>Variety</Text>
          <CommonPicker
            selectedValue={selectedVariety}
            onValueChange={(v) =>
              updateState({ form: { ...state.form, variety: v } })
            }
            items={varieties}
          />

          {/* Season Filters */}
          <Text style={styles.label}>Year</Text>
          <CommonPicker
            selectedValue={selectedSeason}
            onValueChange={handleSeasonSelect}
            items={seasonList}
          />

          <Text style={styles.label}>Season</Text>
          <CommonPicker
            selectedValue={selectedSubSeason}
            onValueChange={setSelectedSubSeason}
            items={subSeasonList}
          />

          {/* Search Button */}
          <Button
            mode="contained"
            onPress={handleSearchFarmer}
            style={styles.filterButton}
            labelStyle={styles.filterButtonLabel}
          >
            Search Farmer
          </Button>
        </Card.Content>
      </Card>

      {/* Loader */}
      {loading && <Text style={styles.center}>Loading...</Text>}

      {/* Farmer List */}
      {farmerList.map((record, idx) => (
        <Card key={idx} style={styles.farmerCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Farmer Details</Text>
            <Divider style={styles.headerDivider} />

            {[
              { label: "Farmer", value: `${record.farmername} ${record.relation} of ${record.relative}` },
              { label: "Center", value: record.centername },
              { label: "Commodity", value: record.commodityname },
              { label: "Variety", value: record.varietyname },
              { label: "Year", value: record.season },
              { label: "Season", value: record.subseason },
            ].map((item, i) => (
              <View key={i} style={styles.detailRow}>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value || "—"}</Text>
                </View>
              </View>
            ))}

            <Button
              mode="contained"
              onPress={() => handleNext(record)}
              style={styles.submitButton}
            >
              Create Agreement
            </Button>
          </Card.Content>
        </Card>
      ))}

      {/* No Records */}
      {!loading && aadhar.length === 12 && farmerList.length === 0 && (
        <Text style={styles.noData}>No records found for this Aadhaar.</Text>
      )}
    </ScrollView>
  );
};

export default AgreementFormSimple;

// -----------------------------------------------------------
// Styles
// -----------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContent: { padding: 16, paddingBottom: 40 },

  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },
  label: {
    fontWeight: "600",
    color: "#455A64",
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#fff",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 14,
  },
  filterButton: {
    marginTop: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    height: 45,
    justifyContent: "center",
  },
  filterButtonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 18,
    color: "#2E7D32",
    fontWeight: "bold",
    marginBottom: 10,
  },
  headerDivider: { height: 1, backgroundColor: "#E0E0E0", marginVertical: 8 },

  farmerCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    paddingBottom: 10,
  },
  detailRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  detailLabel: { fontSize: 14, color: "#666", fontWeight: "500" },
  detailValue: { fontSize: 15, fontWeight: "600", color: "#333" },

  submitButton: {
    marginTop: 14,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },

  center: { textAlign: "center", marginVertical: 10 },
  noData: {
    marginTop: 15,
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
  },
});
