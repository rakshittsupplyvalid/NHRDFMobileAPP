import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DashboardScreen = () => {
  const cards = [
    { title: 'Total Inspections', value: 24, icon: 'clipboard-list', color: '#4CAF50' },
    { title: 'Pending Approvals', value: 5, icon: 'timer-sand', color: '#FF9800' },
    { title: 'Completed', value: 19, icon: 'check-circle', color: '#2196F3' },
    { title: 'Farmers Registered', value: 12, icon: 'account-group', color: '#9C27B0' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardRow}>
        {cards.map((item, index) => (
          <TouchableOpacity key={index} activeOpacity={0.85} style={styles.cardWrapper}>
            <Card style={[styles.infoCard, { backgroundColor: item.color }]}>
              <Card.Content style={styles.infoCardContent}>
                <MaterialCommunityIcons
                  name={item.icon as any} // 👈 Type assertion to fix TS error
                  size={40}
                  color="#fff"
                  style={styles.iconStyle}
                />
                <Text style={styles.cardValue}>{item.value}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginVertical: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  infoCard: {
    borderRadius: 16,
    elevation: 0,
  },
  infoCardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconStyle: {
    marginBottom: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  cardValue: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DashboardScreen;
