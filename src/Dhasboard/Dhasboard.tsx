import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import CommonPicker from '../CommonComponent/CommonDropdown';
import styles from './DhasboardStyle';
import { NameofCenter, variety } from '../Constants/constants';
import { InspectionNo , crop } from '../Constants/constants';
import { FormData } from '../Type/type';


const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    country: null,
    InspectionNo: null,
    crop : null,
    Variety: null,
    bio: '',
  });
  const [isFocused, setIsFocused] = useState<Record<keyof FormData, boolean>>({
    name: false,
    email: false,
    password: false,
    country: false,
    crop : false,
    InspectionNo: false,
    Variety: false,
    bio: false,
  });

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
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.header}>Inspection Form</Text>
          <View style={styles.form}>
            {/* Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name Of Grower with Address</Text>
              <TextInput
                style={[styles.input, isFocused.name && styles.inputFocused]}
                placeholder="Enter grower name and address"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={value => handleChange('name', value)}
                onFocus={() => handleFocus('name')}
                onBlur={() => handleBlur('name')}
              />
            </View>

            {/* Country Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name of Center</Text>
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
              <Text style={styles.label}>Inspection Number</Text>
              <CommonPicker
                selectedValue={formData.InspectionNo}
                onValueChange={value => handleChange('InspectionNo', value)}
                items={InspectionNo}
                isFocused={isFocused.InspectionNo}
                onFocus={() => handleFocus('InspectionNo')}
                onBlur={() => handleBlur('InspectionNo')}
                
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Survey No.</Text>
              <TextInput
                style={[styles.input, isFocused.password && styles.inputFocused]}
                placeholder="Enter survey number"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={value => handleChange('password', value)}
                onFocus={() => handleFocus('password')}
                onBlur={() => handleBlur('password')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Season</Text>
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
              <Text style={styles.label}>Crop</Text>
              <CommonPicker
                selectedValue={formData.crop}
                onValueChange={value => handleChange('InspectionNo', value)}
                items={crop}
                isFocused={isFocused.InspectionNo}
                onFocus={() => handleFocus('InspectionNo')}
                onBlur={() => handleBlur('InspectionNo')}
                
              />
            </View>


            <View style={styles.inputGroup}>
              <Text style={styles.label}>Veriety</Text>
              <CommonPicker
                selectedValue={formData.Variety}
                onValueChange={value => handleChange('InspectionNo', value)}
                items={variety}
                isFocused={isFocused.InspectionNo}
                onFocus={() => handleFocus('InspectionNo')}
                onBlur={() => handleBlur('InspectionNo')}
                
              />
            </View>


          

            <TouchableOpacity
              style={[styles.button, !formData.name && styles.buttonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.9}
              disabled={!formData.name}
            >
              <Text style={styles.buttonText}>Submit Inspection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Dashboard;