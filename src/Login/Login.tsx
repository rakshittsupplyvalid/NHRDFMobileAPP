import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Dimensions } from 'react-native';

const Login = ({ navigation }: any) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isFocusedMobile, setIsFocusedMobile] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );
    const dimensionListener = Dimensions.addEventListener('change', ({ window }) => {
      setScreenHeight(window.height);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      dimensionListener?.remove();
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { minHeight: screenHeight }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.contentContainer, keyboardVisible && styles.keyboardActive]}>
            {/* Logo at the top */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/nhrdf.png')} // Adjust the path to your logo image
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            
            {/* Mobile Number Input */}
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={[styles.input, isFocusedMobile && styles.inputFocused]}
              placeholder="Enter your mobile number"
              placeholderTextColor={styles.placeholder.color}
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              onFocus={() => setIsFocusedMobile(true)}
              onBlur={() => setIsFocusedMobile(false)}
            />
            
            {/* Password Input */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, isFocusedPassword && styles.inputFocused]}
              placeholder="Enter your password"
              placeholderTextColor={styles.placeholder.color}
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setIsFocusedPassword(true)}
              onBlur={() => setIsFocusedPassword(false)}
            />
            
            {/* Remember Device and Forgot Password Row */}
            <View style={styles.bottomRow}>
              <View style={styles.rememberContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, rememberDevice && styles.checkboxChecked]} 
                  onPress={() => setRememberDevice(!rememberDevice)}
                >
                  {rememberDevice && <View style={styles.checkboxInner} />}
                </TouchableOpacity>
                <Text style={styles.rememberText}>Remember this Device</Text>
              </View>
              
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
  style={styles.signInButton}
  activeOpacity={0.7}
  onPress={() => navigation.navigate('DrawerNavigator')}
 
 
>
  <Text style={styles.signInButtonText}>LogIn</Text>
</TouchableOpacity>

          </View>
       
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  keyboardActive: {
    paddingBottom: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 260,
    height: 150,

  },
  label: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  inputFocused: {
    borderColor: '#70B04F',
    borderWidth: 2,
  },
  placeholder: {
    color: '#9E9E9E',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#70B04F',
    backgroundColor: '#70B04F',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  rememberText: {
    fontSize: 14,
    color: '#333333',
  },
  forgotPassword: {
    color: '#70B04F',
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#70B04F',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  footerText: {
    color: '#666666',
    fontSize: 14,
  },
  signUpText: {
    color: '#70B04F',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Login;