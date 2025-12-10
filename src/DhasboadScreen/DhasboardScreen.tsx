import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  BackHandler,
} from "react-native";
import { Card, Text, Button, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import apiClient from "../Service/apiInterceptors";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const DashboardScreen = () => {
  const navigation = useNavigation<any>();

  const [agreementCount, setAgreementCount] = useState<number | null>(null);
  const [inspectionCount, setInspectionCount] = useState<number | null>(null);
  const [loadingAgreement, setLoadingAgreement] = useState(true);
  const [loadingInspection, setLoadingInspection] = useState(true);


const fetchAgreementCount = async () => {
    try {
      const response = await apiClient.get(
        "/api/dashboard/agreement/total/count?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED"
      );
      setAgreementCount(response.data);
    } catch (error) {
      console.error("Agreement Error:", error);
      Alert.alert("Error", "Failed to load agreement count");
    } finally {
      setLoadingAgreement(false);
    }
};


const fetchInspectionCount = async () => {
    try {
      const response = await apiClient.get(
        "/api/dashboard/inspection/total/count?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED"
      );
      setInspectionCount(response.data);
    } catch (error) {
      console.error("Inspection Error:", error);
      Alert.alert("Error", "Failed to load inspection count");
    } finally {
      setLoadingInspection(false);
    }
};

 
useEffect(() => {
    fetchAgreementCount();
    fetchInspectionCount();
}, []);

 
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true; // block back
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Agreement Card */}
        <Card style={styles.actionCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="file-document-edit" size={26} color="#fff" />
              <Text style={styles.cardTitle}>Agreement List</Text>
            </View>

            <Text style={styles.cardSubtitle}>View Agreements</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.cardInfo}>
                Agreement Created{" "}
                {loadingAgreement ? "Loading..." : agreementCount ?? "No Data"}
              </Text>

              <Button
                mode="outlined"
                compact
                style={styles.actionBtn}
                textColor="#fff"
                onPress={() => navigation.navigate("Farmer Agreement")}
              >
                View
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        {/* Inspection Card */}
        <Card style={styles.actionCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="clipboard-text" size={26} color="#fff" />
              <Text style={styles.cardTitle}>Inspection List</Text>
            </View>

            <Text style={styles.cardSubtitle}>View Inspections</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.cardInfo}>
                Total Inspections{" "}
                {loadingInspection ? "Loading..." : inspectionCount ?? "No Data"}
              </Text>

              <Button
                mode="outlined"
                compact
                style={styles.actionBtn}
                textColor="#fff"
                onPress={() => navigation.navigate("Inspection List")}
              >
                View
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate("Agreement Form")}
          >
            <MaterialCommunityIcons name="file-document-edit" size={36} color="#70B04F" />
            <Text style={styles.quickTitle}>Agreement Form</Text>
            <Text style={styles.quickDesc}>Create and manage agreements</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginBottom: 90,
  },
  header: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C2C2C",
  },
  divider: {
    marginVertical: 16,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  actionCard: {
    borderRadius: 16,
    backgroundColor: "#70B04F",
    marginBottom: 10,
    paddingVertical: 20,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  cardSubtitle: {
    color: "#fff",
    fontSize: 14,
    marginTop: 15,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardInfo: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 25,
  },
  actionBtn: {
    borderColor: "#fff",
    borderRadius: 10,
    width: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 12,
    marginTop: 10,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 40,
  },
  quickCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 3,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    color: "#2C2C2C",
  },
  quickDesc: {
    fontSize: 12,
    color: "#6B6B6B",
    textAlign: "center",
    marginTop: 4,
  },
});
