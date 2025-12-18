import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../Service/apiInterceptors";
import { useFormData } from "../Constants/FormContext";

interface Tag {
  id: string;
  tagno: string;
}

interface SeedLeaving {
  date: string;
  drivercontactno: string;
  drivername: string;
  noofbags: number;
  remarks: string;
  staffname: string;
  transportationmode: string;
  unprocessedseed: number;
  vehiclenumber: string;
}

interface HarvestingDetails {
  id: string;
  harvestingdate: string;
  threshingdate: string;
  sealingtaggingdate: string;
  commodityname: string;
  varietyname: string;
  farmername: string;
  createddate: string;
  tags: Tag[];
  seedlefting: SeedLeaving[];
}

interface SeedLeavingFormData {
  drivername: string;
  drivercontactno: string;
  vehiclenumber: string;
  transportationmode: string;
  noofbags: string;
  unprocessedseed: string;
  staffname: string;
  remarks: string;
}

export default function SealingTaggingDetails() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { formData } = useFormData();
  const { harvestingId } = formData;
  
  const [loading, setLoading] = useState(true);
  const [harvestingDetails, setHarvestingDetails] = useState<HarvestingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seedLeavingModalVisible, setSeedLeavingModalVisible] = useState(false);
  const [viewSeedLeavingModalVisible, setViewSeedLeavingModalVisible] = useState(false);
  const [selectedSeedLeaving, setSelectedSeedLeaving] = useState<SeedLeaving | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [seedLeavingForm, setSeedLeavingForm] = useState<SeedLeavingFormData>({
    drivername: "",
    drivercontactno: "",
    vehiclenumber: "",
    transportationmode: "",
    noofbags: "",
    unprocessedseed: "",
    staffname: "",
    remarks: "",
  });

  // Handle back press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Sealing Tagging List");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  // Fetch harvesting details
  useEffect(() => {
    if (harvestingId) {
      fetchHarvestingDetails();
    }
  }, [harvestingId]);

  const fetchHarvestingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/harvesting/${harvestingId}`);
      console.log("Harvesting Details Response:", response.data);
      setHarvestingDetails(response.data);
    } catch (err) {
      console.error("Error fetching harvesting details:", err);
      setError("Failed to load harvesting details");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

 

  const handleViewSeedLeaving = (seedLeaving: SeedLeaving) => {
    setSelectedSeedLeaving(seedLeaving);
    setViewSeedLeavingModalVisible(true);
  };

  const handleAddSeedLeaving = () => {
  navigation.navigate("Add Seed Lifting", {
    harvestingId: harvestingId,
    commodityname: harvestingDetails?.commodityname,
    varietyname: harvestingDetails?.varietyname,
  });
};


  // Header component
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Sealing Tagging List")}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Harvesting Details</Text>
      <View style={styles.headerRightPlaceholder} />
    </View>
  );

 

  // View Seed Leaving Modal
  const ViewSeedLeavingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={viewSeedLeavingModalVisible}
      onRequestClose={() => setViewSeedLeavingModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seed Leaving Details</Text>
            <TouchableOpacity
              onPress={() => setViewSeedLeavingModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {selectedSeedLeaving && (
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate(selectedSeedLeaving.date)}</Text>
              </View>
              
              <View style={styles.detailGrid}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Driver Name</Text>
                  <Text style={styles.detailValue}>{selectedSeedLeaving.drivername}</Text>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Contact No.</Text>
                  <Text style={styles.detailValue}>{selectedSeedLeaving.drivercontactno}</Text>
                </View>
              </View>
              
              <View style={styles.detailGrid}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Vehicle Number</Text>
                  <Text style={styles.detailValue}>{selectedSeedLeaving.vehiclenumber}</Text>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Transport Mode</Text>
                  <Text style={styles.detailValue}>{selectedSeedLeaving.transportationmode}</Text>
                </View>
              </View>
              
              <View style={styles.detailGrid}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Number of Bags</Text>
                  <Text style={styles.detailValue}>{selectedSeedLeaving.noofbags}</Text>
                </View>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Unprocessed Seed</Text>
                  <Text style={styles.detailValue}>{selectedSeedLeaving.unprocessedseed.toLocaleString()}</Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Staff Name</Text>
                <Text style={styles.detailValue}>{selectedSeedLeaving.staffname}</Text>
              </View>
              
              {selectedSeedLeaving.remarks && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Remarks</Text>
                  <Text style={styles.detailValue}>{selectedSeedLeaving.remarks}</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={64} color="#D32F2F" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchHarvestingDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No data state
  if (!harvestingDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.centered}>
          <Ionicons name="document-outline" size={64} color="#666" />
          <Text style={styles.noDataText}>No details available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />
      <Header />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="leaf-outline" size={28} color="#2E7D32" />
            <View style={styles.summaryTitleContainer}>
              <Text style={styles.summaryTitle}>Harvest Summary</Text>
              <Text style={styles.summarySubtitle}>
                {harvestingDetails.commodityname} • {harvestingDetails.varietyname}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Farmer</Text>
              <Text style={styles.infoValue}>{harvestingDetails.farmername}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total Tags</Text>
              <View style={styles.tagCountBadge}>
                <Text style={styles.tagCountText}>
                  {harvestingDetails.tags.length}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Timeline Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timeline</Text>
          
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Ionicons name="calendar-outline" size={20} color="#2E7D32" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Harvesting Date</Text>
              <Text style={styles.timelineValue}>
                {formatDate(harvestingDetails.harvestingdate)}
              </Text>
            </View>
          </View>
          
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Ionicons name="hammer-outline" size={20} color="#2E7D32" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Threshing Date</Text>
              <Text style={styles.timelineValue}>
                {formatDate(harvestingDetails.threshingdate)}
              </Text>
            </View>
          </View>
          
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Ionicons name="pricetag-outline" size={20} color="#2E7D32" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Sealing & Tagging Date</Text>
              <Text style={styles.timelineValue}>
                {formatDate(harvestingDetails.sealingtaggingdate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Tags Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Assigned Tags</Text>
            <View style={styles.tagCountPill}>
              <Text style={styles.tagCountPillText}>
                {harvestingDetails.tags.length} tags
              </Text>
            </View>
          </View>
          
          <View style={styles.tagsContainer}>
            {harvestingDetails.tags.map((tag, index) => (
              <View key={tag.id} style={styles.tagItem}>
                <View style={styles.tagIndicator}>
                  <Ionicons name="pricetag" size={16} color="#2E7D32" />
                </View>
                <View style={styles.tagDetails}>
                  <Text style={styles.tagNumber}>{tag.tagno}</Text>
                  <Text style={styles.tagId}>Tag #{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Seed Leaving Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Seed Leaving</Text>
            {harvestingDetails.seedlefting && harvestingDetails.seedlefting.length > 0 ? (
              <View style={styles.seedLeavingBadge}>
                <Text style={styles.seedLeavingBadgeText}>
                  {harvestingDetails.seedlefting.length} record{harvestingDetails.seedlefting.length > 1 ? 's' : ''}
                </Text>
              </View>
            ) : null}
          </View>
          
          {harvestingDetails.seedlefting && harvestingDetails.seedlefting.length > 0 ? (
            <View style={styles.seedLeavingList}>
              {harvestingDetails.seedlefting.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.seedLeavingItem}
                  onPress={() => handleViewSeedLeaving(item)}
                >
                  <View style={styles.seedLeavingIcon}>
                    <Ionicons name="car-outline" size={20} color="#2E7D32" />
                  </View>
                  <View style={styles.seedLeavingDetails}>
                    <Text style={styles.seedLeavingTitle}>
                      {item.drivername} • {item.vehiclenumber}
                    </Text>
                    <Text style={styles.seedLeavingSubtitle}>
                      {formatDateOnly(item.date)} • {item.noofbags} bags • {item.unprocessedseed.toLocaleString()} seeds
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noSeedLeavingContainer}>
              <Ionicons name="leaf-outline" size={48} color="#CCC" />
              <Text style={styles.noSeedLeavingText}>No seed leaving records found</Text>
              {/* <TouchableOpacity
                style={styles.addSeedLeavingButton}
                onPress={handleAddSeedLeaving}
              >
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.addSeedLeavingButtonText}>Add Seed Lifting</Text>
              </TouchableOpacity> */}
            </View>
          )}
          
       
        
        </View>

        {/* Created Date Footer */}
        <View style={styles.footerCard}>
          <Text style={styles.footerText}>
            Record created on {formatDate(harvestingDetails.createddate)}
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      
      <ViewSeedLeavingModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#6ba94bff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 24,
  },
  noDataText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  retryButton: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32",
  },
  summarySubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 16,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  tagCountBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  tagCountText: {
    color: "#2E7D32",
    fontWeight: "700",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  tagCountPill: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagCountPillText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  seedLeavingBadge: {
    backgroundColor: "#FFEBEE",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  seedLeavingBadgeText: {
    fontSize: 12,
    color: "#C62828",
    fontWeight: "600",
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  tagsContainer: {
    marginTop: 8,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tagIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tagDetails: {
    flex: 1,
  },
  tagNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  tagId: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  seedLeavingList: {
    marginTop: 8,
  },
  seedLeavingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  seedLeavingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  seedLeavingDetails: {
    flex: 1,
  },
  seedLeavingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  seedLeavingSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  noSeedLeavingContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  noSeedLeavingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  addSeedLeavingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addSeedLeavingButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  addRecordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addRecordButtonText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  footerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 400,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  detailItem: {
    marginBottom: 16,
  },
  detailGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
});