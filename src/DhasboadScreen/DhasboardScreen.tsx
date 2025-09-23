import React from 'react';
import { StyleSheet, ScrollView , View} from 'react-native';
import { Card, Text, TextInput, Button } from 'react-native-paper';

const DashboardScreen: React.FC = () => {


  return (
    <ScrollView contentContainerStyle={styles.container}>
     

     <View>
      <Text>
        Dashboard Screen
      </Text>
     </View>
    </ScrollView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  headerCard: {
    marginBottom: 16,
    backgroundColor: '#70B04F',
    borderRadius: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#fff',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#000',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#70B04F',
    paddingVertical: 6,
    borderRadius: 8,
  },
});
