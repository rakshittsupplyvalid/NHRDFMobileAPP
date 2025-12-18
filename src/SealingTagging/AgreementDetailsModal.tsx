// AgreementDetailsScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  BackHandler,
  SafeAreaView,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Divider,
  IconButton,
  ActivityIndicator,
  Chip,
  Button,
  Appbar,
} from 'react-native-paper';
import apiClient from '../Service/apiInterceptors';
import { useNavigation, useRoute, RouteProp,   NavigationProp } from '@react-navigation/native';
import { useFormData } from "../Constants/FormContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';

type RootStackParamList = {
  AgreementDetails: {
    agreementId: string;
  };
};

interface AgreementData {
  id: string;
  codeno: string;
  season: string;
  cropcode: string;
  centername: string;
  commodityname: string;
  varietyname: string;
  farmername: string;
  lotnumber: string;
  seedclass: string;
  tagnumber: string;
  billdate: string;
  billnumber: string;
  plantingmaterial: string;
  growerproof: string;
  growersignature: string;
  officersignature: string;
  createddate: string;
  agreementlands: Array<{
    landdetailid: string;
    agreementlandid: string;
    landimage: string;
    number: string;
    subnumber: string;
    sowingarea: number;
    unit: string;
    area: number;
  }>;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const PRIMARY_COLOR = '#6ba94bff';
const SECONDARY_COLOR = '#1a237e';
const BACKGROUND_COLOR = '#F5F7FA';

export default function AgreementDetailsScreen() {

  const { formData } = useFormData();
    const navigation = useNavigation<NavigationProp<any>>();

  const [agreementData, setAgreementData] = useState<AgreementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState<string>('');

 

  // Handle back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (imageModalVisible) {
          setImageModalVisible(false);
          return true;
        }
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation, imageModalVisible])
  );


   useFocusEffect(
      useCallback(() => {
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

  const fetchAgreementDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📡 Calling API with Agreement ID:", formData?.agreementId);
      
      const response = await apiClient.get(`/api/agreement/${formData?.agreementId}`);
      console.log('✅ Agreement Details Response:', response.data);
      setAgreementData(response.data);
    } catch (err: any) {
      console.error('❌ Error fetching agreement details:', err);
      setError(err.message || 'Failed to fetch agreement details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (formData?.agreementId) {
      fetchAgreementDetails();
    }
  }, [formData?.agreementId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAgreementDetails();
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '0001-01-01') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };

  const openImageModal = (url: string, title: string) => {
    if (url) {
      setSelectedImageUrl(url);
      setSelectedImageTitle(title);
      setImageModalVisible(true);
    }
  };

 

  const ImageModal = () => (
    <Modal
      visible={imageModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setImageModalVisible(false)}
    >
      <View style={styles.imageModalContainer}>
        <View style={styles.imageModalHeader}>
          <View style={styles.imageModalTitleContainer}>
            <MaterialCommunityIcons 
              name="image" 
              size={24} 
              color="#FFFFFF" 
              style={styles.modalIcon}
            />
            <Text style={styles.imageModalTitle} numberOfLines={1}>
              {selectedImageTitle}
            </Text>
          </View>
          <IconButton
            icon="close"
            size={24}
            iconColor="#FFFFFF"
            onPress={() => setImageModalVisible(false)}
            style={styles.modalCloseButton}
          />
        </View>

        <View style={styles.imageModalContent}>
          {selectedImageUrl ? (
            <Image
              source={{ uri: selectedImageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noImageModal}>
              <MaterialCommunityIcons 
                name="image-off" 
                size={60} 
                color="#9e9e9e" 
              />
              <Text style={styles.noImageModalText}>No image available</Text>
            </View>
          )}
        </View>

       
      </View>
    </Modal>
  );

  const renderImageSection = (title: string, url: string) => (
    <View style={styles.imageSection}>
      <Text style={styles.imageTitle}>{title}</Text>
      {url ? (
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={() => openImageModal(url, title)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: url }}
            style={styles.image}
            resizeMode="cover"
            onError={() => console.log(`Failed to load ${title}`)}
          />
          <View style={styles.imageOverlay}>
            <MaterialCommunityIcons name="magnify-plus-outline" size={24} color="#FFFFFF" />
            <Text style={styles.viewImageText}>Tap to view full image</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.noImageContainer}>
          <MaterialCommunityIcons name="image-off" size={40} color="#9e9e9e" />
          <Text style={styles.noImageText}>No image available</Text>
        </View>
      )}
    </View>
  );

  const renderLandDetails = () => {
    if (!agreementData?.agreementlands?.length) return null;

    return (
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="land-plots" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Land Details</Text>
          </View>
          {agreementData.agreementlands.map((land, index) => (
            <View key={land.agreementlandid} style={styles.landItem}>
              <View style={styles.landHeader}>
                <View style={styles.plotHeader}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={SECONDARY_COLOR} />
                  <Text style={styles.landNumber}>Plot {index + 1}</Text>
                </View>
                <Chip 
                  mode="outlined" 
                  style={styles.plotChip}
                  avatar={
                    <MaterialCommunityIcons name="map-search" size={20} color="#7b1fa2" />
                  }
                >
                  Survey: {land.number}/{land.subnumber}
                </Chip>
              </View>
              
              <View style={styles.landDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelContainer}>
                    <MaterialCommunityIcons name="ruler-square" size={16} color="#546e7a" />
                    <Text style={styles.detailLabel}>Sowing Area:</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {land.sowingarea} {land.unit}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelContainer}>
                    <MaterialCommunityIcons name="earth" size={16} color="#546e7a" />
                    <Text style={styles.detailLabel}>Total Area:</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {land.area} {land.unit}
                  </Text>
                </View>
              </View>

              {land.landimage && (
                <TouchableOpacity 
                  style={styles.landImageContainer}
                  onPress={() => openImageModal(land.landimage, `Land Plot ${index + 1}`)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: land.landimage }}
                    style={styles.landImage}
                    resizeMode="cover"
                  />
                  <View style={styles.landImageOverlay}>
                    <MaterialCommunityIcons name="magnify-expand" size={20} color="#FFFFFF" />
                    <Text style={styles.viewLandImageText}>View Land Image</Text>
                  </View>
                </TouchableOpacity>
              )}
              
              {index < agreementData.agreementlands.length - 1 && (
                <Divider style={styles.landDivider} />
              )}
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const renderInfoCard = (title: string, items: Array<{ label: string; value: string }>, iconName: keyof typeof MaterialCommunityIcons.glyphMap) => (
    <Card style={styles.infoCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name={iconName} size={24} color={PRIMARY_COLOR} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {items.map((item, index) => (
          <View key={index} style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <MaterialCommunityIcons name="circle-small" size={16} color="#546e7a" />
              <Text style={styles.infoLabel}>{item.label}:</Text>
            </View>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading Agreement Details...</Text>
        
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons 
            name="alert-circle" 
            size={80} 
            color="#d32f2f" 
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            mode="contained"
            style={[styles.retryButton, { backgroundColor: PRIMARY_COLOR }]}
            onPress={fetchAgreementDetails}
            icon="refresh"
          >
            Retry
          </Button>
        </View>
      );
    }

    if (!agreementData) {
      return (
        <View style={styles.noDataContainer}>
          <MaterialCommunityIcons 
            name="database-off" 
            size={80} 
            color="#78909c" 
            style={styles.noDataIcon}
          />
          <Text style={styles.noDataText}>No agreement data available</Text>
          <Button
            mode="contained"
            style={[styles.retryButton, { backgroundColor: PRIMARY_COLOR }]}
            onPress={fetchAgreementDetails}
            icon="refresh"
          >
            Load Data
          </Button>
        </View>
      );
    }

    return (
      <>
        {/* Header with Agreement ID */}
       

        {/* Basic Information */}
        {renderInfoCard('Basic Information', [
          { label: 'Code No', value: agreementData.codeno || 'N/A' },
          { label: 'Season', value: agreementData.season || 'N/A' },
          { label: 'Crop Code', value: agreementData.cropcode || 'N/A' },
          { label: 'Center Name', value: agreementData.centername || 'N/A' },
          { label: 'Commodity', value: agreementData.commodityname || 'N/A' },
          { label: 'Variety', value: agreementData.varietyname || 'N/A' },
        ], 'information-variant')}

        {/* Farmer & Lot Information */}
        {renderInfoCard('Farmer & Lot Details', [
          { label: 'Farmer Name', value: agreementData.farmername || 'N/A' },
          { label: 'Lot Number', value: agreementData.lotnumber || 'N/A' },
          { label: 'Seed Class', value: agreementData.seedclass || 'N/A' },
          { label: 'Tag Number', value: agreementData.tagnumber || 'N/A' },
          { label: 'Planting Material', value: agreementData.plantingmaterial || 'N/A' },
          { label: 'Bill Date', value: formatDate(agreementData.billdate) },
          { label: 'Bill Number', value: agreementData.billnumber || 'N/A' },
        ], 'account-details')}

        {/* Land Details Section */}
        {renderLandDetails()}

        {/* Images Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="image-multiple" size={24} color={PRIMARY_COLOR} />
              <Text style={styles.sectionTitle}>Documentation</Text>
            </View>
            
            <View style={styles.imagesGrid}>
              <View style={styles.imageColumn}>
                {renderImageSection('Grower Proof', agreementData.growerproof)}
              </View>
              <View style={styles.imageColumn}>
                {renderImageSection('Grower Signature', agreementData.growersignature)}
                {renderImageSection('Officer Signature', agreementData.officersignature)}
              </View>
            </View>
          </Card.Content>
        </Card>

       
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={[styles.appbar, { backgroundColor: PRIMARY_COLOR }]}>
        <Appbar.BackAction 
          onPress={() =>  navigation.navigate("Sealing Tagging List")} 
          color="#FFFFFF"
        />
        <Appbar.Content 
          title="Agreement Details" 
          titleStyle={styles.appbarTitle}
        />
        <Appbar.Action 
          icon="refresh" 
          onPress={onRefresh}
          disabled={refreshing}
          color="#FFFFFF"
        />
      </Appbar.Header>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_COLOR}
            colors={[PRIMARY_COLOR]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
      </ScrollView>

      <ImageModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  appbar: {
    backgroundColor: PRIMARY_COLOR,
    elevation: 4,
  },
  appbarTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    padding: 20,
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ed',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: PRIMARY_COLOR,
  },
  idTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  idLabel: {
    fontSize: 14,
    color: '#546e7a',
    fontWeight: '600',
    marginBottom: 4,
  },
  idValue: {
    fontSize: 16,
    color: '#263238',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  statusBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusChip: {
    flex: 1,
    marginRight: 8,
    borderColor: '#4caf50',
  },
  dateChip: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#ff9800',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SECONDARY_COLOR,
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 6,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#546e7a',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#263238',
    flex: 1.5,
    textAlign: 'right',
    flexWrap: 'wrap',
    marginLeft: 12,
  },
  sectionCard: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SECONDARY_COLOR,
    marginLeft: 8,
  },
  landItem: {
    marginBottom: 20,
  },
  landHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  plotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  landNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37474f',
  },
  plotChip: {
    backgroundColor: '#f3e5f5',
    borderColor: '#7b1fa2',
  },
  landDetails: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#546e7a',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#263238',
    flex: 1,
    textAlign: 'right',
  },
  landImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  landImage: {
    width: '100%',
    height: 180,
  },
  landImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  viewLandImageText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  landDivider: {
    marginVertical: 20,
    backgroundColor: '#e0e0e0',
    height: 1,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  imageColumn: {
    flex: 1,
    minWidth: '50%',
    paddingHorizontal: 8,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#546e7a',
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  image: {
    width: '100%',
    height: 150,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(107, 169, 75, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  noImageContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  noImageText: {
    fontSize: 13,
    color: '#9e9e9e',
    fontStyle: 'italic',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 10,
    paddingVertical: 8,
    borderColor: PRIMARY_COLOR,
  },
  loaderContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 17,
    color: '#546e7a',
    fontWeight: '500',
  },
  agreementIdText: {
    marginTop: 12,
    fontSize: 15,
    color: '#78909c',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 17,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 10,
  },
  noDataContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataIcon: {
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 17,
    color: '#78909c',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  // Image Modal Styles
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: PRIMARY_COLOR,
  },
  imageModalTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  modalIcon: {
    marginRight: 8,
  },
  imageModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  modalCloseButton: {
    margin: 0,
  },
  imageModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  fullImage: {
    width: screenWidth - 20,
    height: screenHeight * 0.7,
    borderRadius: 4,
  },
  noImageModal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageModalText: {
    fontSize: 16,
    color: '#9e9e9e',
    marginTop: 12,
  },
  imageModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
  },
  downloadButton: {
    backgroundColor: '#2196F3',
  },
  shareButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  externalButton: {
    backgroundColor: '#FF9800',
  },
  modalActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
});