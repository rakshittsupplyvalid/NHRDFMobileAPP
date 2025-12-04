
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { FormProvider } from './src/Constants/FormContext';
import ForgetPassword from './src/Login/ForgetPassword';

import Login from './src/Login/Login';
import DrawerNavigator from './src/Navigation/DrawerNavigator';
import apiClient, { removeToken, retrieveToken } from './src/Service/apiInterceptors';

const Stack = createNativeStackNavigator();

// 🎨 GLOBAL THEME
const theme = {
  ...MD3LightTheme,
  roundness: 10, // global roundness for inputs/buttons
  colors: {
    ...MD3LightTheme.colors,
    primary: '#aa0404ff',           // Focus + Button color
    secondary: '#1565C0',
    outline: '#BDBDBD',           // Border color for TextInput
    background: '#F5F5F5',
    surface: '#FFFFFF',
    onSurfaceVariant: '#000000',  // Prevents glow/light issue
    surfaceVariant: '#FFFFFF',
  },
};

const App = () => { 
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await retrieveToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await apiClient.get("api/login/validate", {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response?.status === 200) {
          console.log('✅ Token valid:', token);
          setUserToken(token);
        } else {
          console.warn('❌ Invalid or expired token:', response?.status);
          await removeToken(); // remove from storage
          setUserToken(null);
        }
      } catch (error) {
        // Token expired or invalid
        if (error.response?.status === 401) {
          console.warn('⚠️ Token expired. Logging out user.');
          await removeToken();
          setUserToken(null);
        } else {
          console.error('Error fetching token:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkLogin();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    // ✅ Global theme applied here
    <PaperProvider theme={theme}>

      <NavigationContainer>
        <Stack.Navigator
          id={undefined}
          initialRouteName={userToken ? 'DrawerNavigator' : 'Login'}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
          {/* ✅ Wrap DrawerNavigator inside FormProvider */}
          <Stack.Screen
            name="DrawerNavigator"
            children={() => (
              <FormProvider>
                <DrawerNavigator />
              </FormProvider>
            )}
          />

        </Stack.Navigator>
      </NavigationContainer>

    </PaperProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
