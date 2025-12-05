import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  BackHandler,
} from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../Service/apiInterceptors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const [countData, setCountData] = useState(null);
  const [InspectionData, setInspectionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgreementCount();
  }, []);


  useEffect(() => {
    fetInspectionCount();
  }, []);

  const fetchAgreementCount = async () => {
    try {
      const response = await apiClient.get(
        '/api/dashboard/agreement/total/count?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED'
      );
      console.log('API Response:', response.data);
      setCountData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };


  const fetInspectionCount = async () => {
    try {
      const response = await apiClient.get(
        '/api/dashboard/inspection/total/count?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED'
      );
      console.log('API Response:', response.data);
      setInspectionData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Completely disable Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Just return true to block it
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      // cleanup
      return () => subscription.remove();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>

          </View>

        </View>

        <Divider style={styles.divider} />

        {/* Agreement Card */}
        <Card style={styles.actionCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="file-document-edit"
                size={26}
                color="#fff"
              />
              <Text style={styles.cardTitle}>Agreement List</Text>
            </View>
            <Text style={styles.cardSubtitle}>View Agreements</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardInfo}>
                Agreement Created {countData ?? 'No Data'}
              </Text>
              <Button
                mode="outlined"
                compact
                style={styles.actionBtn}
                textColor="#fff"
                onPress={() => navigation.navigate('Agreement List')}
              >
                View
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        {/* Inspection Report Card */}
        <Card style={styles.actionCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="clipboard-text"
                size={26}
                color="#fff"
              />
              <Text style={styles.cardTitle}>Inspection Report</Text>
            </View>
            <Text style={styles.cardSubtitle}>View Inspections</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardInfo}>Total inspection {InspectionData}</Text>
              <Button
                mode="outlined"
                compact
                style={styles.actionBtn}
                textColor="#fff"
                onPress={() => navigation.navigate('Inspection List')}
              >
                View
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        {/* Quick Actions Section */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Agreement Form')}
          >
            <MaterialCommunityIcons
              name="file-document-edit"
              size={36}
              color="#70B04F"
            />
            <Text style={styles.quickTitle}>Agreement Form</Text>
            <Text style={styles.quickDesc}>
              Create and manage agreements
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginBottom: 90,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  subTitle: {
    fontSize: 16,
    color: '#6B6B6B',
    marginTop: 4,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  divider: {
    marginVertical: 16,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  actionCard: {
    borderRadius: 16,
    backgroundColor: '#70B04F',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 20,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,

  },
  cardSubtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
    marginTop: 15
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 25
  },
  actionBtn: {
    borderColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,



  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 12,
    marginTop: 10,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    color: '#2C2C2C',
  },
  quickDesc: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default DashboardScreen;
