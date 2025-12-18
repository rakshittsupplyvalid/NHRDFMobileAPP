import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  BackHandler,
} from "react-native";
import { Card, Text, Button, ActivityIndicator } from "react-native-paper";
import apiClient from "../Service/apiInterceptors";
import { useNavigation, useFocusEffect, NavigationProp } from "@react-navigation/native";
import { useFormData } from "../Constants/FormContext";

export default function SealingTaggingList() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { formData, setFormData } = useFormData();

  const fetchList = async () => {
    try {
      const res = await apiClient.get(
        "/api/harvesting/list?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED"
      );
      setData(res?.data || []);
      console.log("LIST DATA:", res?.data);
    } catch (err) {
      console.log("LIST ERROR:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);


  const handleViewAgreement = (item) => {
    setFormData({
      ...formData,

      agreementId: item.agreementid,
    });
    navigation.navigate("Agreement Details Modal");
  };


  const handleViewDetails = (item) => {
    setFormData({
      ...formData,
      harvestingId: item.id,
    });
    navigation.navigate("Sealing Tagging Details");
  };


  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Dashboard");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchList();
  };

  // Format date to DD-MM-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString.split("T")[0] || "N/A";
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#1E88E5"
          colors={["#1E88E5"]}
        />
      }
    >
      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No records found</Text>
        </View>
      ) : (
        data.map((item, index) => (
          <Card key={item.id || index} style={styles.card}>
            <Card.Content>
              {/* Harvesting Date */}
              <View style={styles.infoRow}>
                <Text style={styles.label}>Harvesting Date:</Text>
                <Text style={styles.value}>{formatDate(item.harvestingdate)}</Text>
              </View>

              {/* Sealing & Tagging Date */}
              <View style={styles.infoRow}>
                <Text style={styles.label}>Sealing & Tagging Date:</Text>
                <Text style={styles.value}>{formatDate(item.sealingtaggingdate)}</Text>
              </View>

              {/* Threshing Date */}
              <View style={styles.infoRow}>
                <Text style={styles.label}>Threshing Date:</Text>
                <Text style={styles.value}>{formatDate(item.threshingdate)}</Text>
              </View>
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="contained"
                style={[styles.button, styles.primaryButton]}
                labelStyle={styles.buttonLabel}
                onPress={() => handleViewAgreement(item)}
              >
                View Agreement
              </Button>

              <Button
                mode="contained"
                style={[styles.button, styles.secondaryButton]}
                labelStyle={styles.buttonLabel}
                onPress={() => handleViewDetails(item)}
              >
                View Details
              </Button>


            </Card.Actions>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#1E88E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#546E7A",
    flex: 1.2,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#263238",
    flex: 1.8,
    textAlign: "right",
    flexWrap: "wrap",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexWrap: "wrap",
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 0,
    marginHorizontal: 4,
    marginVertical: 4,
    minWidth: 100,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: "#1E88E5", // Blue color for primary action
  },
  secondaryButton: {
    backgroundColor: "#6ba94bff", // Green color for secondary action
  },
  tertiaryButton: {
    backgroundColor: "#FF9800", // Orange color for tertiary action
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    fontWeight: "500",
  },
});