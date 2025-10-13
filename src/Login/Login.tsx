import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Dimensions, StyleSheet, Image, Alert } from 'react-native';
import { TextInput, Text, Button, Checkbox, useTheme } from 'react-native-paper';
import apiClient from '../Service/apiInterceptors';
import { storeToken } from '../Service/apiInterceptors';


const Login = ({ navigation }: any) => {
  const [mobileNumber, setMobileNumber] = useState('8976865879');
  const [password, setPassword] = useState('Password@123');

  const [rememberDevice, setRememberDevice] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const primaryColor = '#70B04F';


  

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
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

  // 🔹 Login API Call
 // 🔹 Login API Call
const handleLogin = async () => {
  if (!mobileNumber || !password) {
    Alert.alert("Error", "Please enter both Mobile Number and Password");
    return;
  }

  try {
    setLoading(true);

    const requestData = {
      mobilenumber: mobileNumber,
      assayerpassword: password,
    };
    console.log("Request data:", requestData);

    const response = await apiClient.post(
      "/api/mobile/assayer/login",
      requestData
    );

    console.log("Login response:", response.data);

    if (response.data?.token) {
      // ✅ Token save karna zaroori hai
      storeToken(response.data.token);
      console.log("✅ Token saved:", response.data.token);

      navigation.navigate("DrawerNavigator");
    } else {
      Alert.alert(
        "Login Failed",
        response.data?.message || "Invalid credentials"
      );
    }
  } catch (error: any) {
    console.error("Login error:", error?.response?.data || error.message);
    Alert.alert("Error", "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};



  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { minHeight: screenHeight }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.contentContainer, keyboardVisible && styles.keyboardActive]}>
            
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/nhrdf.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Mobile Number */}
            <TextInput
              label="Mobile Number"
              mode="outlined"
              style={styles.input}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              left={<TextInput.Icon icon="phone" />}
              outlineColor="#E0E0E0"
              activeOutlineColor={primaryColor}
              theme={{ colors: { primary: primaryColor }, roundness: 50 }}
            />

            {/* Password */}
            <TextInput
              label="Password"
              mode="outlined"
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry={secureTextEntry}
              value={password}
              onChangeText={setPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? "eye-off" : "eye"}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                />
              }
              outlineColor="#E0E0E0"
              activeOutlineColor={primaryColor}
              theme={{ colors: { primary: primaryColor }, roundness: 50 }}
            />

            {/* Remember + Forgot */}
            <View style={styles.bottomRow}>
              <View style={styles.rememberContainer}>
                <Checkbox.Android
                  status={rememberDevice ? 'checked' : 'unchecked'}
                  onPress={() => setRememberDevice(!rememberDevice)}
                  color={primaryColor}
                />
                <Text style={styles.rememberText}>Remember this Device</Text>
              </View>
              <Button
                mode="text"
                onPress={() => console.log('Forgot password pressed')}
                labelStyle={{ color: primaryColor }}
                compact
              >
                Forgot Password?
              </Button>
            </View>

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={[styles.signInButton, { backgroundColor: primaryColor }]}
              labelStyle={styles.signInButtonText}
              contentStyle={styles.buttonContent}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', backgroundColor: '#ffffff' },
  contentContainer: { paddingHorizontal: 24, paddingBottom: 24 },
  keyboardActive: { paddingBottom: 10 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 260, height: 150 },
  input: { marginBottom: 20, backgroundColor: '#FFFFFF' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  rememberContainer: { flexDirection: 'row', alignItems: 'center' },
  rememberText: { fontSize: 14, color: '#333333', marginLeft: 8 },
  signInButton: { borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  signInButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonContent: { height: 44 },
});

export default Login;
