import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Card, Divider } from "react-native-paper";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import apiClient from "../Service/apiInterceptors";
import { useFocusEffect , useNavigation, NavigationProp,  } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { useCallback } from "react";

const { width, height } = Dimensions.get("window");

interface InspectionDetail {
  id: string;
  inspectionno: string;
  inspectiondate: string;
  farmername: string;
  centername: string;
  commodityname: string;
  varietyname: string;
  cropcondition: string;
  inspectedarea: number;
  latitude: number;
  longitude: number;
  geoimage: string;
  remarks: string;
}

type RouteParams = {
  params: {
    id: string;
  };
};

const InspectionDetailScreen = () => {
  const route = useRoute<RouteProp<RouteParams, "params">>();
    const navigation = useNavigation<NavigationProp<any>>();
  const { id } = route.params;

  const [data, setData] = useState<InspectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchInspectionDetail();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchInspectionDetail = async () => {
    try {
      const response = await apiClient.get(`/api/inspection/${id}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching inspection detail", error);
    } finally {
      setLoading(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "excellent":
      case "good":
        return "#10B981";
      case "average":
        return "#F59E0B";
      case "poor":
      case "bad":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };


   useFocusEffect(
      useCallback(() => {
        const onBackPress = () => {
          navigation.navigate("Inspection List");
          return true;
        };
  
        const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => subscription.remove();
      }, [navigation])
    );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          <ActivityIndicator size={70} color="#4F46E5" />
          <Text style={styles.loaderText}>Loading Inspection Details</Text>
          <Text style={styles.loaderSubText}>Please wait...</Text>
        </View>
      </View>
    );
  }

  if (!data) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inspection Report</Text>
          <Text style={styles.headerSubtitle}>Detailed View</Text>
        </View>

        {/* IMAGE SECTION */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: data.geoimage }}
              style={styles.geoImage}
              resizeMode="cover"
            />
            
            {/* IMAGE OVERLAY */}
            <View style={styles.imageOverlay}>
              {/* EYE ICON */}
              <TouchableOpacity
                style={styles.eyeIconContainer}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
              >
                <View style={styles.eyeIconBackground}>
                  <Ionicons name="eye" size={22} color="#FFFFFF" />
                  <Text style={styles.eyeIconText}>View</Text>
                </View>
              </TouchableOpacity>

              {/* LOCATION INFO */}
              <View style={styles.locationInfo}>
                <MaterialCommunityIcons 
                  name="map-marker-radius" 
                  size={20} 
                  color="#FFFFFF" 
                />
                <View style={styles.coordinatesContainer}>
                  <Text style={styles.coordinatesLabel}>Coordinates</Text>
                  <Text style={styles.coordinatesText}>
                    {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* MAIN DETAILS CARD */}
        <Card style={styles.mainCard}>
          <Card.Content>
            {/* CARD HEADER */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <MaterialCommunityIcons name="clipboard-text" size={24} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Inspection Details</Text>
                <Text style={styles.cardSubtitle}>Complete information</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* DETAILS GRID */}
            <View style={styles.detailsGrid}>
              <DetailItem 
                icon="file-document-outline" 
                label="Inspection No" 
                value={data.inspectionno}
                iconColor="#4F46E5"
              />
              <DetailItem 
                icon="calendar-month-outline" 
                label="Date" 
                value={data.inspectiondate}
                iconColor="#10B981"
              />
              <DetailItem 
                icon="office-building" 
                label="Center" 
                value={data.centername}
                iconColor="#8B5CF6"
              />
              <DetailItem 
                icon="account-outline" 
                label="Farmer" 
                value={data.farmername}
                iconColor="#F59E0B"
              />
              <DetailItem 
                icon="sprout-outline" 
                label="Crop" 
                value={data.commodityname}
                iconColor="#10B981"
              />
              <DetailItem 
                icon="grass" 
                label="Variety" 
                value={data.varietyname}
                iconColor="#10B981"
              />
              <DetailItem 
                icon="chart-areaspline" 
                label="Inspected Area" 
                value={`${data.inspectedarea} Acre`}
                iconColor="#3B82F6"
              />
              
              {/* CROP CONDITION WITH BADGE */}
              <View style={styles.detailRow}>
                <MaterialCommunityIcons 
                  name="weather-cloudy" 
                  size={20} 
                  color={getConditionColor(data.cropcondition)} 
                />
                <Text style={styles.label}>Condition:</Text>
                <View style={[
                  styles.conditionBadge,
                  { backgroundColor: getConditionColor(data.cropcondition) + '20' }
                ]}>
                  <Text style={[
                    styles.conditionText,
                    { color: getConditionColor(data.cropcondition) }
                  ]}>
                    {data.cropcondition}
                  </Text>
                </View>
              </View>

              {/* REMARKS SECTION */}
              <View style={styles.remarksContainer}>
                <View style={styles.remarksHeader}>
                  <MaterialCommunityIcons 
                    name="note-text-outline" 
                    size={20} 
                    color="#6B7280" 
                  />
                  <Text style={styles.remarksLabel}>Remarks</Text>
                </View>
                <View style={styles.remarksContent}>
                  <Text style={styles.remarksText}>
                    {data.remarks || "No remarks provided"}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* SUMMARY STATS */}
        <View style={styles.statsContainer}>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: "#10B981" }]}>
              <MaterialCommunityIcons name="map-marker-distance" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.statValue}>{data.inspectedarea} Acre</Text>
              <Text style={styles.statLabel}>Area</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FULL SCREEN IMAGE MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* MODAL HEADER */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
              <Text style={styles.modalBackText}>Back</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Geo Image</Text>
            
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* IMAGE CONTAINER */}
          <View style={styles.imageModalContainer}>
            <Image
              source={{ uri: data.geoimage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>

          {/* MODAL FOOTER */}
          <View style={styles.modalFooter}>
            <View style={styles.modalInfo}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#FFFFFF" />
              <View style={styles.modalInfoContent}>
                <Text style={styles.modalInfoLabel}>Location Coordinates</Text>
                <Text style={styles.modalInfoValue}>
                  {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
            
            <View style={styles.modalInfo}>
              <MaterialCommunityIcons name="information" size={20} color="#FFFFFF" />
              <View style={styles.modalInfoContent}>
                <Text style={styles.modalInfoLabel}>Inspection ID</Text>
                <Text style={styles.modalInfoValue}>{data.inspectionno}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

interface DetailItemProps {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
}

const DetailItem = ({ icon, label, value, iconColor = "#6B7280" }: DetailItemProps) => (
  <View style={styles.detailRow}>
    <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value} numberOfLines={1}>{value}</Text>
  </View>
);

export default InspectionDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
    
  },
  
  // Loader Styles
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F8FAFC",
  },
  loaderContent: {
    alignItems: 'center',
    padding: 30,
  },
  loaderText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  loaderSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },

  // Header Styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    backgroundColor: '#6ba94bff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },

  // Image Section
  imageSection: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  imageContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  geoImage: {
    width: '100%',
    height: 220,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  eyeIconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  eyeIconBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#6ba94bff',
  },
  eyeIconText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  coordinatesContainer: {
    marginLeft: 10,
  },
  coordinatesLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 2,
  },
  coordinatesText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Main Card Styles
  mainCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#6ba94bff',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E5E7EB',
  },
  detailsGrid: {
    gap: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    minWidth: 120,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  remarksContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  remarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  remarksLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 10,
    fontWeight: '500',
  },
  remarksContent: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  remarksText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',

   
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#4F46E5',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalBackText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  imageControls: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 8,
    gap: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFooter: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    marginBottom : 40,
  },
  modalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalInfoContent: {
    marginLeft: 12,
    flex: 1,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});