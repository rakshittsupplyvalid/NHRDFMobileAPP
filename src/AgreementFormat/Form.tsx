import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Appbar, useTheme, RadioButton, Text ,   Card, } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const SeedInspectionForm = ({ navigation }: { navigation: any }) => {
  const [formData, setFormData] = useState({
    classOfSeeds: '',
    sourceOfSeed: '',
    totalArea: '',
    inspectionArea: '',
    previousCrop: '',
    isolationDistance: '',
    contaminantStage: '',
    seedStage: '',
    fieldsCount: '',
    offtypePercentage: '',
  });

  const { colors } = useTheme();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#70B04F' }}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          title="Seed Inspection Form"
          titleStyle={{ color: 'white' }} 
        />
      </Appbar.Header>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >

          <Card style={[styles.card]}>
          <Card.Content>
        <Text style={styles.sectionHeader}>Seed Information</Text>
        
        <TextInput
          label="Class of Seeds *"
          mode="outlined"
          style={styles.input}
          value={formData.classOfSeeds}
              outlineColor="#999" // Outline color when not focused
              activeOutlineColor="#70B04F" // Outline color when focused
          onChangeText={(text) => handleChange('classOfSeeds', text)}
          left={<TextInput.Icon icon="seed" />}
        />

        <TextInput
          label="Source of Seed *"
          mode="outlined"
          style={styles.input}
          value={formData.sourceOfSeed}
              outlineColor="#999" // Outline color when not focused
              activeOutlineColor="#70B04F" // Outline color when focused
          onChangeText={(text) => handleChange('sourceOfSeed', text)}
          left={<TextInput.Icon icon="origin" />}
        />

        <TextInput
          label="Total Area Under Seed Production *"
          mode="outlined"
          style={styles.input}
          value={formData.totalArea}
              outlineColor="#999" // Outline color when not focused
              activeOutlineColor="#70B04F" // Outline color when focused
          onChangeText={(text) => handleChange('totalArea', text)}
          keyboardType="numeric"
          left={<TextInput.Icon icon="map-marker-distance" />}
        />

        <TextInput
          label="Area of Field Inspection  *"
          mode="outlined"
          style={styles.input}
          value={formData.inspectionArea}
              outlineColor="#999" // Outline color when not focused
              activeOutlineColor="#70B04F" // Outline color when focused
          onChangeText={(text) => handleChange('inspectionArea', text)}
          keyboardType="numeric"
          left={<TextInput.Icon icon="ruler-square" />}
        />

        <TextInput
          label="Previous Crop *"
          mode="outlined"
          style={styles.input}
          value={formData.previousCrop}
              outlineColor="#999" // Outline color when not focused
              activeOutlineColor="#70B04F" // Outline color when focused
          onChangeText={(text) => handleChange('previousCrop', text)}
          left={<TextInput.Icon icon="sprout" />}
        />

        <TextInput
          label="Isolation Distance (m) *"
          mode="outlined"
          style={styles.input}
          value={formData.isolationDistance}
          onChangeText={(text) => handleChange('isolationDistance', text)}
          keyboardType="numeric"
              outlineColor="#999" // Outline color when not focused
              activeOutlineColor="#70B04F" // Outline color when focused
          left={<TextInput.Icon icon="ruler"/>}
             
        />

        <Text style={styles.sectionHeader}>Growth Stage Information</Text>

        

        <TextInput
          label="Stage of Growth of Contaminant *"
          mode="outlined"
          style={styles.input}
          value={formData.contaminantStage}
              outlineColor="#999" // Outline color when not focused
              activeOutlineColor="#70B04F" // Outline color when focused
          onChangeText={(text) => handleChange('contaminantStage', text)}
          left={<TextInput.Icon icon="sprout" />}
        />

        <TextInput
          label="Stage of Seed at this Inspection *"
          mode="outlined"
          style={styles.input}
          value={formData.seedStage}
              outlineColor="#999" // Outline color when not focused
              activeOutlineColor="#70B04F" // Outline color when focused
          onChangeText={(text) => handleChange('seedStage', text)}
          left={<TextInput.Icon icon="calendar-check" />}
        />

        <Text style={styles.sectionHeader}>Inspection Results</Text>

        <TextInput
          label="Fields Count (100 plants per count) *"
          mode="outlined"
          style={styles.input}
          value={formData.fieldsCount}
              outlineColor="#999" // Outline color when not focused
              activeOutlineColor="#70B04F" // Outline color when focused
          onChangeText={(text) => handleChange('fieldsCount', text)}
          keyboardType="numeric"
          left={<TextInput.Icon icon="counter" />}
        />

        <TextInput
          label="Percentage of Offtype (%) *"
          mode="outlined"
          style={styles.input}
          value={formData.offtypePercentage}
              outlineColor="#999" // Outline color when not focused
              activeOutlineColor="#70B04F" // Outline color when focused
          onChangeText={(text) => handleChange('offtypePercentage', text)}
          keyboardType="numeric"
          left={<TextInput.Icon icon="percent" />}
        />

        <Button 
          mode="contained" 
        onPress={() => navigation.navigate('FormScreensecond')}
          style={styles.submitButton}
        
           
        >
         Next
        </Button>
        </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    
  },
  card: {
    padding: 8,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  
    
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
    backgroundColor: '#70B04F',
    
  },
  
  buttonLabel: {
    fontSize: 16,
    color: 'white',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  }, 
});

export default SeedInspectionForm;