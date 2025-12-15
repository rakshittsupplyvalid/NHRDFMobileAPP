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

const inspectionButtons = ["FIRST", "SECOND", "THIRD", "FOURTH"];

const FetchInspection = () => {
  const navigation = useNavigation<NavigationProp<any>>();



  const [inspectionData, setInspectionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const { formData, setFormData } = useFormData();





  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true);
      try {
        const data = {};
        for (const landId of formData?.selectedLandIds) {
          const res = await apiClient.get(`/api/inspection/by/${landId}`);
          console.log("kitna inspection", res.data)


          // Save inspections along with agreementId
          data[landId] = res.data.map((insp: any) => ({
            ...insp,
            landId, // optional, for reference
          })) || [];
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


  // Button press handler

  const handleButtonPress = (landId: string, inspectionNo: string) => {
    const inspections = inspectionData[landId] || [];
    const foundInspection = inspections.find(
      (insp) => insp.inspectionno.toUpperCase() === inspectionNo
    );

    if (foundInspection) {
      setModalContent([foundInspection]);
      setModalVisible(true);
    } else {
      // Get agreementId from first inspection of this land
      const agreementId = inspections[0]?.agreementid || null;


      setFormData({

        ...formData,

        landId: landId,
        agreementId: agreementId,
        inspectionno : inspectionNo,


      })

      navigation.navigate("Inspection Screen", {
        landId,
        agreementId,
        inspectionNo,


      });
    }
  };


  // Back handler
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
      {formData?.selectedLandIds.map((landId) => {
        const completedCount = inspectionData[landId]?.length || 0;

        return (
          <View key={landId} style={styles.landContainer}>


            {/* ⭐ English Heading ⭐ */}
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
                <Text>Date: {insp.inspectiondate}</Text>
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
    padding: 16,
    backgroundColor: "#F6F7F9"
  },

  landContainer: {
    marginBottom: 54,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "white",
    elevation: 2
  },

  landTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: "#333"
  },

  inspectionInfo: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginBottom: 14,
    fontWeight: "500",
  },

  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },

  button: {
    width: "45%",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center"
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },

  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center"
  },

  modalRow: {
    marginBottom: 8
  },

  closeButton: {
    marginTop: 18,
    backgroundColor: "#F44336",
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  },

  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15
  },
});
