import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  BackHandler,
} from "react-native";
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native";
import apiClient from "../Service/apiInterceptors";
import { useFormData } from "../Constants/FormContext";
import { MaterialIcons } from "@expo/vector-icons";

const inspectionButtons = ["FIRST", "SECOND", "THIRD", "FOURTH"];

const FetchInspection = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { formData, setFormData } = useFormData();

  const [inspectionData, setInspectionData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<any[]>([]);

  console.log("**************Agreement ID from route params:", formData?.agreementId);

  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true);
      try {
        const data: Record<string, any[]> = {};
        for (const landId of formData?.selectedLandIds || []) {
          const res = await apiClient.get(`/api/inspection/by/${landId}`);
          data[landId] = res.data.map((insp: any) => ({ ...insp, landId })) || [];
        }
        setInspectionData(data);
      } catch (err) {
        console.error("Error fetching inspections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInspections();
  }, [formData?.selectedLandIds]);

  const handleButtonPress = (landId: string, inspectionNo: string) => {
    const inspections = inspectionData[landId] || [];
    const foundInspection = inspections.find(
      (insp) => insp.inspectionno.toUpperCase() === inspectionNo
    );

    if (foundInspection) {
      setModalContent([foundInspection]);
      setModalVisible(true);
    } else {
      setFormData({
        ...formData,
        landId,
        agreementId: formData?.agreementId,
        inspectionno: inspectionNo,
      });

      navigation.navigate("Inspection Screen", {
        landId,
        agreementId: formData?.agreementId,
        inspectionNo,
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("AgreementLandSelector");
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("AgreementLandSelector" as never)}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Lands for Inspection</Text>
        <View style={{ width: 24 }} />
      </View>

      {formData?.selectedLandIds.map((landId) => {
        const completedCount = inspectionData[landId]?.length || 0;

        return (
          <View key={landId} style={styles.landContainer}>
            <Text style={styles.inspectionInfo}>
              {completedCount > 0
                ? completedCount === inspectionButtons.length
                  ? `${completedCount} inspection completed — All stages done`
                  : `${completedCount} inspection completed — Next Start ${inspectionButtons[completedCount]} Inspection`
                : "Select Inspection Stage"}
            </Text>

            <View style={styles.buttonRow}>
              {inspectionButtons.map((insp) => (
                <TouchableOpacity
                  key={insp}
                  style={[
                    styles.button,
                    {
                      backgroundColor: inspectionData[landId]?.some(
                        (i) => i.inspectionno.toUpperCase() === insp
                      )
                        ? "#2196F3"
                        : "#4CAF50",
                    },
                  ]}
                  onPress={() => handleButtonPress(landId, insp)}
                >
                  <Text style={styles.buttonText}>
                    {inspectionData[landId]?.some(
                      (i) => i.inspectionno.toUpperCase() === insp
                    )
                      ? `View ${insp}`
                      : `Create ${insp}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}

      {/* Modal for inspection details */}
   <Modal
  visible={modalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalBackground}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Inspection Details</Text>
      {modalContent.map((insp) => (
        <View key={insp.inspectionid} style={styles.modalRow}>
          
          <Text>Inspection No: {insp.inspectionno}</Text>
          <Text>Inspection No Code: {insp.inspectionnocode || 'N/A'}</Text>
          <Text>Inspection Date: {insp.inspectiondate}</Text>
          <Text>Harvesting Date: {insp.harvestingdate}</Text>
          <Text>Duration From: {insp.durationfrom}</Text>
          <Text>Duration To: {insp.durationto}</Text>
          <Text>Source of Seed: {insp.sourceofseed}</Text>
          <Text>Inspected Area: {insp.inspectedarea}</Text>
          <Text>Previous Crop: {insp.previouscrop}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
};

export default FetchInspection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 100,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    marginHorizontal: 10,
  },
  
  // Content Styles
  landContainer: {
    margin: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inspectionInfo: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    fontWeight: "500",
    lineHeight: 20,
  },
  
  // Button Styles
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    width: "48%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  
  // Modal Styles
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  modalRow: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  modalLabel: {
    fontWeight: "600",
    color: "#555",
    fontSize: 14,
    marginBottom: 2,
  },
  modalValue: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#F44336",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  
  // Additional Styles
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
  },
  
  // Status Indicators
  statusCompleted: {
    backgroundColor: "#2196F3",
  },
  statusPending: {
    backgroundColor: "#4CAF50",
  },
  statusDisabled: {
    backgroundColor: "#9E9E9E",
  },
  
  // Progress Indicator
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 8,
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F7F9",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
});
