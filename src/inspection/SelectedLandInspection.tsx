import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
   KeyboardAvoidingView,
  Platform
} from "react-native";
import { useRoute, useNavigation, NavigationProp } from "@react-navigation/native";
import { Card, Checkbox } from "react-native-paper"; // Install: npm install react-native-paper

import apiClient from "../Service/apiInterceptors";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { useCallback } from "react";
import { useFormData } from "../Constants/FormContext";


interface Land {
  landdetailid: string;
  agreementlandid: string;
  landimage: string;
  number: string;
  subnumber: string;
  sowingarea: number;
  unit: string;
  area: number;
}

interface SelectedLand extends Land {
  selected: boolean;
}

const AgreementLandSelector = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<any>>();
   
  
    const { formData, setFormData } = useFormData();


  const [lands, setLands] = useState<SelectedLand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);



  useEffect(() => {
    fetchAgreement();
  }, [formData?.agreementId]);

  useEffect(() => {
    // Update selected count whenever lands change
    const count = lands.filter((land) => land.selected).length;
    setSelectedCount(count);
  }, [lands]);


  
    useFocusEffect(
      useCallback(() => {
        const onBackPress = () => {
          navigation.navigate("Farmer Agreement");
          return true;
        };
  
        const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => subscription.remove();
      }, [navigation])
    );

  const fetchAgreement = async () => {
    try {
      const res = await apiClient.get(`api/agreement/${formData?.agreementId}`);
      const landsData: Land[] = res.data.agreementlands || [];
      const formattedLands: SelectedLand[] = landsData.map((land) => ({
        ...land,
        selected: false,
      }));
      setLands(formattedLands);

      console.log("🔥 Fetched Lands:", formattedLands);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const toggleLandSelection = (landId: string) => {
  setLands(
    lands.map((land) => ({
      ...land,
      selected: land.agreementlandid === landId ? !land.selected : false,
    }))
  );
};


  const selectAllLands = () => {
    const allSelected = lands.every((land) => land.selected);
    setLands(
      lands.map((land) => ({
        ...land,
        selected: !allSelected,
      }))
    );
  };

 const handleConfirmSelection = () => {
  // Filter lands that are selected
  const selectedLands = lands.filter((land) => land.selected);

  // Extract only the agreementlandid for navigation
  const selectedLandIds = selectedLands.map((land) => land.agreementlandid);

  console.log("Selected Land IDs:", selectedLandIds);

      setFormData({

        ...formData,
        selectedLandIds: selectedLandIds,
      });

  navigation.navigate("FetchInspection", {
    selectedLandIds, // array of selected agreementlandid
  });
};

  const renderLandCard = ({ item }: { item: SelectedLand }) => (
    <TouchableOpacity
      onPress={() => toggleLandSelection(item.agreementlandid)}
      activeOpacity={0.7}
    >
      <Card style={[styles.card, item.selected && styles.selectedCard]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.checkboxContainer}>
            <Checkbox.Android
              status={item.selected ? "checked" : "unchecked"}
              onPress={() => toggleLandSelection(item.agreementlandid)}
              color="#4CAF50"
            />
          </View>

          <View style={styles.cardBody}>
            <View style={styles.headerRow}>
              <View style={styles.landNumberContainer}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color="#666"
                />
                <Text style={styles.landNumber}>
                  Plot: {item.number}
                  {item.subnumber ? `-${item.subnumber}` : ""}
                </Text>
              </View>
              {item.selected && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color="#4CAF50"
                />
              )}
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="seed"
                  size={18}
                  color="#666"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailLabel}>Sowing Area:</Text>
                <Text style={styles.detailValue}>
                  {item.sowingarea} {item.unit}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="square"
                  size={18}
                  color="#666"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailLabel}>Total Area:</Text>
                <Text style={styles.detailValue}>
                  {item.area} {item.unit}
                </Text>
              </View>

              
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Lands...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={64}
          color="#F44336"
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchAgreement();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (lands.length === 0) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons
          name="map-search"
          size={64}
          color="#9E9E9E"
        />
        <Text style={styles.emptyText}>No lands available</Text>
        <Text style={styles.emptySubText}>
          This agreement doesn't have any lands assigned yet.
        </Text>
      </View>
    );
  }

  return (
     <KeyboardAvoidingView
         style={{ flex: 1 }}
         behavior={Platform.OS === "ios" ? "padding" : undefined}
         keyboardVerticalOffset={60}
       >
         <View style={styles.container}>  

       <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Farmer Agreement" as never)}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Lands for Inspection</Text>
          <View style={{ width: 24 }} />
        </View>


        <View style={styles.content}>


      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Lands for Inspection</Text>
       
        
        <View style={styles.selectionInfo}>
          <View style={styles.selectionRow}>
            <MaterialCommunityIcons
              name="checkbox-multiple-marked"
              size={20}
              color="#4CAF50"
            />
            <Text style={styles.selectionText}>
              {selectedCount} of {lands.length} lands selected
            </Text>
          </View>
          
        
        </View>
      </View> */}

      <FlatList
        data={lands}
        keyExtractor={(item) => item.agreementlandid}
        renderItem={renderLandCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.listHeader}>
            Available Lands ({lands.length})
          </Text>
        }
      />

      {selectedCount > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmSelection}
          >
            <MaterialCommunityIcons name="check" size={24} color="white" />
            <Text style={styles.confirmButtonText}>
              Confirm Selection ({selectedCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}
         </View>


     </View>
     </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

    content: { padding: 14 },

   backButton: {
     padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)"
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
  },

  errorText: {
    marginTop: 14,
    fontSize: 16,
    color: "#D9534F",
    textAlign: "center",
    marginBottom: 20,
  },

  emptyText: {
    marginTop: 10,
    fontSize: 18,
    color: "#555",
    fontWeight: "600",
  },

  emptySubText: {
    marginTop: 6,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },

  /* ------------------------------------- HEADER ------------------------------------- */
  header: {
  flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#4CAF50",
    justifyContent: "space-between",

  },

  headerTitle: {
   fontSize: 20, color: "#fff", fontWeight: "bold" 
  },

  selectionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },

  selectionRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  selectionText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },

  selectAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#EAF7EC",
    borderRadius: 6,
  },

  selectAllText: {
    color: "#3E8E41",
    fontWeight: "600",
    fontSize: 14,
  },

  /* -------------------------------- LAND LIST ------------------------------- */
  listContainer: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 40,
  },

  listHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#777",
    marginBottom: 12,
  },

  /* -------------------------------- CARD ------------------------------- */
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "white",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },

  selectedCard: {
    backgroundColor: "#F0F8ED",
    borderColor: "#4CAF50",
    borderWidth: 1,
  },

  cardContent: {
    flexDirection: "row",
    paddingVertical: 10,
  },

  checkboxContainer: {
    justifyContent: "center",
    paddingLeft: 12,
    paddingRight: 8,
  },

  cardBody: {
    flex: 1,
    paddingVertical: 8,
    paddingRight: 12,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  landNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  landNumber: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginLeft: 6,
  },

  detailsContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    padding: 10,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  detailIcon: {
    marginRight: 6,
  },

  detailLabel: {
    fontSize: 14,
    color: "#666",
    width: 95,
    fontWeight: "500",
  },

  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },

  /* ------------------------------- FOOTER BUTTON -------------------------------- */
  footer: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E2E2",
    marginBottom: "40%",
  },

  confirmButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
  },

  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 6,
  },
});

export default AgreementLandSelector;