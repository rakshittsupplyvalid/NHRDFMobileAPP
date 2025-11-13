import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
  
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-paper";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFormData } from "../Constants/FormContext";
import { getFarmerLandDetail, farmerDetails } from "../Service/fetchCommodity";

const Agreementland: React.FC = () => {
  const { formData } = useFormData();
    const { setFormData } = useFormData();
  const navigation = useNavigation();
  const [landDetails, setLandDetails] = useState<any[]>([]);
  const [farmerDetils, setFarmerDetils] = useState<any>(null);
  const [loading, setLoading] = useState(false);


  console.log("abcd", formData);

  useEffect(() => {
    if (formData?.farmerId) {
      fetchFarmerDetails(formData.farmerId);
      fetchLandDetails(formData.farmerId);
    }
  }, [formData?.farmerId]);

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
    if (data && data.length > 0) {
      setLandDetails(data);
      const landId = data[0].id; // <-- this is the land ID
      console.log("Land ID:", landId);
      return landId; // you can return it if you want to use it outside
    }
  } catch (error) {
    console.log("Error fetching land details:", error);
  } finally {
    setLoading(false);
  }
};



 const handleNext = (record: any) => {
  const formPayload = {
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

  // Merge old formData with new payload
  setFormData({ ...formData, ...formPayload });

  navigation.navigate("Agreement" as never);
};




  return (
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
            <View key={index} style={styles.card}>

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
                {/* {land.document && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(land.document)}
                    style={styles.documentButton}
                  >
                    <Text style={styles.documentLink}>View Document</Text>
                  </TouchableOpacity>
                )} */}
              </View>
            </View>
          ))}






        <View style={styles.card}>
          {/* Bill Number */}



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



          {/* Area */}
          <View style={styles.inputContainer}>
            <View style={styles.labelWithIcon}>
              <MaterialCommunityIcons name="vector-square" size={20} color="#2E7D32" style={{ marginRight: 6 }} />
              <Text style={styles.inputLabel}>Area  in Hectare</Text>
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
              <Text style={styles.inputLabel}> Distribution Type</Text>
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


          {/* Lot Number */}
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

         

        </View>


         
         <Button
  mode="contained"
  style={styles.submitButton}
  contentStyle={styles.submitButtonContent}
  onPress={() => handleNext(formData)} // Pass the current formData
>
  Next
</Button>


      </View>
    </ScrollView>
  );
};

// Detail Row Component
const DetailRow = ({
  icon,
  label,
  value,
  valueColor,
}: {
  icon?: string;
  label: string;
  value: string | number | null;
  valueColor?: string;
}) => (
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#2E7D32",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
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
  labelWithIcon: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  landLabel: { fontWeight: "700", color: "#1B5E20", marginBottom: 8, fontSize: 16 },
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
  documentButton: { marginTop: 6, paddingVertical: 4 },
  documentLink: { color: "#1B5E20", fontWeight: "600", fontSize: 15 },
  loadingText: { fontSize: 15, color: "#555", marginVertical: 8, fontStyle: "italic" },
    submitButton: { marginTop: 12, backgroundColor: "#4CAF50", borderRadius: 8 },
  submitButtonContent: { paddingVertical: 6 },
});

export default Agreementland;
