import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import Dhasboard from '../Dhasboard/Dhasboard';
import Signature from '../Signature/Signature';
import DashboardScreen from '../DhasboadScreen/DhasboardScreen';
import AgreementForm from '../Agreement/AgreementForm';
import AgreementSecond from '../Agreement/AgreementSecond';

const Drawer = createDrawerNavigator();1

// ===== Custom Drawer Content =====
function CustomDrawerContent(props: any) {
  const navigation = useNavigation<any>();

    const handleLogout = () => {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            onPress: () => {
              // Add your logout logic here
              // For example: navigation.navigate('Login');
               navigation.navigate('Login' as never);
            },
          },
        ],
        { cancelable: false }
      );
    };

      return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props}>
        {/* Profile Section */}
        

        {/* Main Drawer Items */}
        <View style={styles.drawerContent}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Logout Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      
          <Text style={[styles.logoutText, { fontFamily: 'Poppins-Regular' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


}


export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
    id={undefined}
      drawerContent={(props) => <CustomDrawerContent {...props} />}

      screenOptions={{

        headerStyle: {
          backgroundColor: '#70B04F',
          height: 80,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'Poppins-SemiBold',
        },
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 290,
        },
        drawerActiveTintColor: '#818589',
        drawerInactiveTintColor: 'black',
        drawerLabelStyle: {
          fontFamily: 'Poppins-Regular',
          fontSize: 16,
        },
      }}
    >

         <Drawer.Screen
        name="DashboardScreen"
        component={DashboardScreen}
        options={{
         
          drawerItemStyle: { marginTop: 'auto' }, // Push to bottom
        }}
      />


      
       <Drawer.Screen
        name="AgreementForm"
        component={AgreementForm}
        options={{
         
          drawerItemStyle: { marginTop: 'auto' }, // Push to bottom
        }}
      />


      <Drawer.Screen
  name="AgreementSecond"
  component={AgreementSecond}
  options={{    headerShown: false,   drawerItemStyle: { display: 'none' }}}
/>



      {/* Dashboard (Bottom Item) */}
      <Drawer.Screen
        name="Inspection Form"
        component={Dhasboard}
        options={{
         
          drawerItemStyle: { marginTop: 'auto' }, // Push to bottom
        }}
      />


       <Drawer.Screen
        name="Signature"
        component={Signature}
        options={{
         
          drawerItemStyle: { marginTop: 'auto' }, // Push to bottom
        }}
      />


   

       {/* <Drawer.Screen
        name="TextInput"
        component={TextInput}
        options={{
         
          drawerItemStyle: { marginTop: 'auto' }, // Push to bottom
        }}
      /> */}


      {/* <Drawer.Screen
        name="SignatureScreen"
        component={SignatureScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="dashboard" size={size} color={color} />
          ),
          drawerItemStyle: { marginTop: 'auto' }, // Push to bottom
        }}
      /> */}







    </Drawer.Navigator>
  );
}

// = = = = = S t y l e s = = = = =
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  drawerContent: {
    flex: 1,
    paddingTop: 10,
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',

  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    // fallback solid color, replace with LinearGradient if needed
  },
  buttonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',

    padding: 2,
    width: 80,

    marginRight: 6,
  },
  buttonIcon: {
    marginLeft: 2,
  },
});