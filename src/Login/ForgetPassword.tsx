import React, { useState, useEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Dimensions,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { TextInput, Text, Button, useTheme } from "react-native-paper";
import apiClient from "../Service/apiInterceptors";

const ForgetPassword = ({ navigation }: any) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureOld, setSecureOld] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get("window").height);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const primaryColor = "#70B04F";

  // Handle keyboard visibility
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    const dimension = Dimensions.addEventListener("change", ({ window }) => setScreenHeight(window.height));

    return () => {
      show.remove();
      hide.remove();
      dimension?.remove();
    };
  }, []);

  // 🔹 Validate and Call API
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Weak Password", "New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and Confirm password must match.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        oldpassword: oldPassword,
        newpassword: newPassword,
        confirmpassword: confirmPassword,
      };

      console.log("🔐 Password Change Request:", payload);

      const response = await apiClient.post("/api/mobile/changepassword", payload);

      console.log("✅ Response:", response.data);

      if (response.data?.success) {
        Alert.alert("Success", "Password changed successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", response.data?.message || "Failed to change password.");
      }
    } catch (error: any) {
      console.error("Change Password Error:", error?.response?.data || error.message);
      Alert.alert("Error", error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { minHeight: screenHeight }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.contentContainer, keyboardVisible && styles.keyboardActive]}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/nhrdf.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.heading}>Change Password</Text>

            {/* Old Password */}
            <TextInput
              label="Old Password"
              mode="outlined"
              secureTextEntry={secureOld}
              value={oldPassword}
              onChangeText={setOldPassword}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={secureOld ? "eye-off" : "eye"}
                  onPress={() => setSecureOld(!secureOld)}
                />
              }
              style={styles.input}
            />

            {/* New Password */}
            <TextInput
              label="New Password"
              mode="outlined"
              secureTextEntry={secureNew}
              value={newPassword}
              onChangeText={setNewPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={secureNew ? "eye-off" : "eye"}
                  onPress={() => setSecureNew(!secureNew)}
                />
              }
              style={styles.input}
            />

            {/* Confirm Password */}
            <TextInput
              label="Confirm Password"
              mode="outlined"
              secureTextEntry={secureConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={secureConfirm ? "eye-off" : "eye"}
                  onPress={() => setSecureConfirm(!secureConfirm)}
                />
              }
              style={styles.input}
            />

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleChangePassword}
              loading={loading}
              disabled={loading}
              style={[styles.button, { backgroundColor: primaryColor }]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {loading ? "Changing..." : "Update Password"}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", backgroundColor: "#fff" },
  contentContainer: { paddingHorizontal: 24, paddingBottom: 24 },
  keyboardActive: { paddingBottom: 10 },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  logo: { width: 220, height: 120 },
  heading: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
    marginBottom: 24,
  },
  input: { marginBottom: 20, backgroundColor: "white" },
  button: {
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonContent: { height: 44 },
  buttonLabel: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default ForgetPassword;
