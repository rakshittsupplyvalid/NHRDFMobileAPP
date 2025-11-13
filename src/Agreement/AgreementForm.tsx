import React, { useEffect, useState } from "react";
import { View, StyleSheet, TextInput, ScrollView } from "react-native";
import { Card, Text, Divider, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import apiClient from "../Service/apiInterceptors";
import CommonPicker from "../CommonComponent/CommonDropdown";
import { fetchCommodityTypes, fetchCommodity, fetchVariety } from "../Service/fetchCommodity";
import useForm from "../Form/UseForm";
import { useFormData } from "../Constants/FormContext";
import { useNavigation } from "@react-navigation/native";

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

  const aadharNumber = state.form?.aadharNumber || "";
  const selectedCommodityType = state.form?.commodityType || "";
  const selectedCommodity = state.form?.commodity || "";
  const selectedVariety = state.form?.variety || "";

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

  useEffect(() => {
    const fetchData = async () => {
      if (!aadharNumber || aadharNumber.length !== 12) {
        setAadharData([]);
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
    fetchData();
  }, [aadharNumber, selectedCommodity, selectedVariety]);

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
    farmerId: record.farmerid,
    varietyId: record.varietyid || null,
    commodityId: record.commodityid || null,
    centerTargetId: record.centertargetid || null,

    // Additional fields
    billNumber: record.billnumber,
    area: record.area ,
    lotNo: record.lotno ,
    cropClassSeeds: record.cropclass, // if the field has a space in key
    DistributionType : record.distributiontype
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
        </Card.Content>
      </Card>

      {loading && <Text style={{ textAlign: "center", marginTop: 10 }}>Loading...</Text>}

      {aadharData.length > 0 &&
        aadharData.map((record, index) => (
          <Card key={record.id || index} style={styles.farmerCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>
             
                Farmer Details
              </Text>
              <Divider style={styles.headerDivider} />

              {[
                    { label: "Farmer Name", value: record.farmername},
                { label: "Relation", value: ` ${record.relation} of ${record.relative}` },
                { label: "Variety", value: record.varietyname },
                { label: "Center", value: record.centername },
                { label: "Commodity", value: record.commodityname },
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
                Next
              </Button>
            </Card.Content>
          </Card>
        ))}

      {!loading && aadharNumber.length === 12 && aadharData.length === 0 && (
        <Text style={styles.noFarmerSelected}>No records found for this Aadhar.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContent: { padding: 16, paddingBottom: 30 },
  sectionCard: { marginBottom: 16, borderRadius: 12, elevation: 2, backgroundColor: "white" },
  label: { fontWeight: "600", color: "#455A64", marginBottom: 8, fontSize: 14 },
  input: { backgroundColor: "white", height: 50, fontSize: 14, borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, borderWidth: 1, borderColor: "#ddd" },
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
