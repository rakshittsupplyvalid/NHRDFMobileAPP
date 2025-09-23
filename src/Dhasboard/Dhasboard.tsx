import React, { useState } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  useTheme,
  Snackbar,
  Portal,
} from 'react-native-paper';
import CommonPicker from '../CommonComponent/CommonDropdown';
import { NameofCenter, variety } from '../Constants/constants';
import { InspectionNo, crop } from '../Constants/constants';
import { FormData } from '../Type/type';
import CustomDateTimePicker from '../CommonComponent/DateTimePicker';

const Dashboard = ({ navigation }: { navigation: any }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
 

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    country: null,
    InspectionNo: null,
    crop: null,
    Variety: null,
    seedType: null,
    FarmerName: null,
    bio: '',
  });
  const [isFocused, setIsFocused] = useState<Record<keyof FormData, boolean>>({
    name: false,
    email: false,
    password: false,
    country: false,
    crop: false,
    InspectionNo: false,
    Variety: false,
    bio: false,
    FarmerName: false,
    seedType: false,
  });
  const [visibleSnackbar, setVisibleSnackbar] = useState(false);

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFocus = (field: keyof FormData) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof FormData) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setVisibleSnackbar(true);
  };

  const onDismissSnackBar = () => setVisibleSnackbar(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={[styles.card]}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.header}>
              Inspection Form
            </Text>
            <Divider style={styles.divider} />

            {/* Grower Information Section */}
            <Text variant="titleMedium" style={styles.sectionHeader}>
              Grower Information
            </Text>
            <View style={styles.sectionSpacer} />
            
            <TextInput
              label="Name Of Grower with Address"
              mode="outlined"
              style={styles.input}
              placeholder="Enter grower name and address"
              value={formData.name}
              onChangeText={value => handleChange('name', value)}
              onFocus={() => handleFocus('name')}
              onBlur={() => handleBlur('name')}
              left={<TextInput.Icon icon="account" />}
              outlineColor="#999"
              activeOutlineColor="#70B04F"
              theme={{
                colors: {
                  primary: '#6200ee',
                  placeholder: '#999',
                  text: '#000',
                },
              }}
            />

            {/* Inspection Details Section */}
            <Text variant="titleMedium" style={styles.sectionHeader}>
              Inspection Details
            </Text>
            <View style={styles.sectionSpacer} />
            
            <View style={styles.inputGroup}>
              <Text variant="labelLarge" style={styles.label}>
                Name of Center
              </Text>
              <CommonPicker
                selectedValue={formData.country}
                onValueChange={value => handleChange('country', value)}
                items={NameofCenter}
                isFocused={isFocused.country}
                onFocus={() => handleFocus('country')}
                onBlur={() => handleBlur('country')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="labelLarge" style={styles.label}>
                Inspection Number
              </Text>
              <CommonPicker
                selectedValue={formData.InspectionNo}
                onValueChange={value => handleChange('InspectionNo', value)}
                items={InspectionNo}
                isFocused={isFocused.InspectionNo}
                onFocus={() => handleFocus('InspectionNo')}
                onBlur={() => handleBlur('InspectionNo')}
              />
            </View>

            <Text variant="labelLarge" style={styles.label}>
              Date
            </Text>
            <CustomDateTimePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              mode="date"
            />

            {/* Field Details Section */}
            <Text variant="titleMedium" style={styles.sectionHeader}>
              Field Details
            </Text>
            <View style={styles.sectionSpacer} />
            
            <TextInput
              label="Survey No"
              mode="outlined"
              style={styles.input}
              placeholder="Survey No"
              value={formData.name}
              onChangeText={value => handleChange('name', value)}
              onFocus={() => handleFocus('name')}
              onBlur={() => handleBlur('name')}
              left={<TextInput.Icon icon="map-marker" />}
              outlineColor="#999"
              activeOutlineColor="#70B04F"
              theme={{
                colors: {
                  primary: '#6200ee',
                  placeholder: '#999',
                  text: '#000',
                },
              }}
            />

            {/* Crop Information Section */}
            <Text variant="titleMedium" style={styles.sectionHeader}>
              Crop Information
            </Text>
            <View style={styles.sectionSpacer} />
            
            <View style={styles.inputGroup}>
              <Text variant="labelLarge" style={styles.label}>
                Season
              </Text>
              <CommonPicker
                selectedValue={formData.country}
                onValueChange={value => handleChange('country', value)}
                items={NameofCenter}
                isFocused={isFocused.country}
                onFocus={() => handleFocus('country')}
                onBlur={() => handleBlur('country')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="labelLarge" style={styles.label}>
                Crop
              </Text>
              <CommonPicker
                selectedValue={formData.crop}
                onValueChange={value => handleChange('crop', value)}
                items={crop}
                isFocused={isFocused.crop}
                onFocus={() => handleFocus('crop')}
                onBlur={() => handleBlur('crop')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="labelLarge" style={styles.label}>
                Variety
              </Text>
              <CommonPicker
                selectedValue={formData.Variety}
                onValueChange={value => handleChange('Variety', value)}
                items={variety}
                isFocused={isFocused.Variety}
                onFocus={() => handleFocus('Variety')}
                onBlur={() => handleBlur('Variety')}
              />
            </View>

            {/* Harvest Information Section */}
            <Text variant="titleMedium" style={styles.sectionHeader}>
              Harvest Information
            </Text>
            <View style={styles.sectionSpacer} />
            
            <Text variant="labelLarge" style={styles.label}>
              Expected Date of Harvest
            </Text>
            <CustomDateTimePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              mode="date"
            />

            <Text variant="labelLarge" style={styles.label}>
              Duration From
            </Text>
            <CustomDateTimePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              mode="date"
            />

            <Text variant="labelLarge" style={styles.label}>
              Duration To
            </Text>
            <CustomDateTimePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              mode="date"
            />

            <Button
              mode="contained"
              onPress={() => navigation.navigate('FromScreen')}
              style={styles.button}
            
              icon="send"
            >
              Next
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Snackbar
          visible={visibleSnackbar}
          onDismiss={onDismissSnackBar}
          duration={3000}
          action={{
            label: 'OK',
            onPress: () => {
              onDismissSnackBar();
            },
          }}
        >
          Inspection submitted successfully!
        </Snackbar>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    padding: 8,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
    marginBottom: 16,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    height: 46,
    backgroundColor: '#ffffff'
  },
  button: {
    marginTop: 16,
    borderRadius: 4,
    backgroundColor: '#70B04F'
  },
  buttonContent: {
    height: 48,
  },
  sectionHeader: {
   fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  sectionSpacer: {
    height: 8,
  },
});

export default Dashboard;