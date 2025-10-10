// import React, { useEffect, useState } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import Login from './src/Login/Login';
// import { Provider as PaperProvider } from 'react-native-paper';

// import DrawerNavigator from './src/Navigation/DrawerNavigator';
// import { storeToken } from './src/Service/apiInterceptors';





// const Stack = createNativeStackNavigator();

// const App = () => {

//   const [isLoading, setIsLoading] = useState(true);
//   const [userToken, setUserToken] = useState(null);

//   useEffect(() => {
//     const checkLogin = async () => {
//       const token = storeToken
//       console.log("token from first", token)
//       setUserToken(token);
//       setIsLoading(false);
//     };
//     checkLogin();
//   }, []);


//   if (isLoading) {
//     return null; // or a SplashScreen
//   }



//   return (
//     <PaperProvider>
//       <NavigationContainer>
//         <Stack.Navigator id={undefined} initialRouteName="Login" screenOptions={{ headerShown: true }}>

//           <Stack.Screen name="Login"
//             component={Login}
//             options={{ headerShown: false }}

//           />




//           <Stack.Screen name="DrawerNavigator"
//             component={DrawerNavigator}
//             options={{ headerShown: false }}

//           />


//         </Stack.Navigator>
//       </NavigationContainer>
//     </PaperProvider>
//   );
// };

// export default App;




import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

import Login from './src/Login/Login';
import DrawerNavigator from './src/Navigation/DrawerNavigator';
import { retrieveToken } from './src/Service/apiInterceptors';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        // ✅ Correct way to call the function
        const token = await retrieveToken();
        console.log("Token from first:", token);
        setUserToken(token);
      } catch (error) {
        console.log("Error fetching token:", error);
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
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
        id={undefined}
          initialRouteName={userToken ? "DrawerNavigator" : "Login"}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
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

