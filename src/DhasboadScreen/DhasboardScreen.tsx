import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

const DashboardScreen = () => {
  const cards = [
    { title: 'Total Inspections', value: 24, icon: 'clipboard-list' },
    { title: 'Pending Approvals', value: 5, icon: 'timer-sand' },
    { title: 'Completed', value: 19, icon: 'check-circle' },
    { title: 'Farmers Registered', value: 12, icon: 'account-group' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardRow}>
        {cards.map((item, index) => (
          <Card key={index} style={styles.infoCard}>
            <Card.Content style={styles.infoCardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoCard: {
    width: '48%',
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: '#70B04F',
    elevation: 4,
  },
  infoCardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;
