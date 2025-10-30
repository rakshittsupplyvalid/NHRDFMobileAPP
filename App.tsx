
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { FormProvider } from './src/Constants/FormContext';
import ForgetPassword from './src/Login/ForgetPassword';

import Login from './src/Login/Login';
import DrawerNavigator from './src/Navigation/DrawerNavigator';
import { retrieveToken } from './src/Service/apiInterceptors';

const Stack = createNativeStackNavigator();

// 🎨 GLOBAL THEME
const theme = {
  ...MD3LightTheme,
  roundness: 10, // global roundness for inputs/buttons
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1565C0',           // Focus + Button color
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
        console.log('Token from first:', token);
        setUserToken(token);
      } catch (error) {
        console.log('Error fetching token:', error);
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
