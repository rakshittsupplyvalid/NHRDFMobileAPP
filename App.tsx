import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/Login/Login';
import { Provider as PaperProvider } from 'react-native-paper';

import DrawerNavigator from './src/Navigation/DrawerNavigator';





const Stack = createNativeStackNavigator();

const App = () => {
  return (
        <PaperProvider> 
    <NavigationContainer>
      <Stack.Navigator id={undefined} initialRouteName="Login" screenOptions={{ headerShown: true }}>

        <Stack.Screen name="Login"
          component={Login}
          options={{ headerShown: false }}

        />




        <Stack.Screen name="DrawerNavigator"
          component={DrawerNavigator}
          options={{ headerShown: false }}

        />


      </Stack.Navigator>
    </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
