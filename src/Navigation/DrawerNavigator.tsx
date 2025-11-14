import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Dimensions, Platform } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import AgreementForm from '../Agreement/AgreementForm';
import AgreementSecond from '../Agreement/AgreementSecond';
import DashboardScreen from '../DhasboadScreen/DhasboardScreen'
import AgreementListScreen from '../AgreementList/AgreementList';
import NomineeScreen from '../AgreementList/NomineeList';
import WitnessScreen from '../AgreementList/WitnessList';
import Signature from '../Signature/Signature';
import CameraExample from '../Agreement/CameraExample';
import Agreementland from '../Agreement/Agreementland';

import InspectionScreen from '../inspection/IInspectionScreen';


const Drawer = createDrawerNavigator();


const { width } = Dimensions.get('window');


// ===== Custom Drawer Content =====
function CustomDrawerContent(props: any) {
  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: processLogout },
    ]);
  };

  const processLogout = () => {
    console.log('User logged out successfully');
    props.navigation.reset({ routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Sidebar Header */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/nhrdf_logo.jpg')} // replace with dynamic profile
          style={styles.profileImage}
        />

        <Text style={styles.profileName}>
          NHRDF
        </Text>


      </View>

      <DrawerContentScrollView {...props} style={{ marginTop: 10 }}>
        {/* Drawer Items */}

        <DrawerItem
          label="Dhasboard"
          icon={({ color, size }) => <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />}
            onPress={() => {
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          }}
          labelStyle={styles.drawerLabel}
        />

        <DrawerItem
          label="Agreement Form"
          icon={({ color, size }) => <MaterialCommunityIcons name="file-document" size={size} color={color} />}
               onPress={() => {
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'Agreement Form' }],
            });
          }}
          labelStyle={styles.drawerLabel}
        />


        <DrawerItem
          label="Agreement List"
          icon={({ color, size }) => <MaterialCommunityIcons name="file-document" size={size} color={color} />}
          onPress={() => props.navigation.navigate('Agreement List')}
          labelStyle={styles.drawerLabel}
        />



        
        <DrawerItem
          label="InspectionScreen"
          icon={({ color, size }) => <MaterialCommunityIcons name="file-document" size={size} color={color} />}
          onPress={() => props.navigation.navigate('Inspection Screen')}
            style={{ display: 'none' }}
        />

        {/* Hidden Screen */}
        <DrawerItem
          label="Agreement"
          icon={({ color, size }) => <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />}
          onPress={() => props.navigation.navigate('Agreement')}
          style={{ display: 'none' }}
        />


         <DrawerItem
          label="Agreementland"
          icon={({ color, size }) => <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />}
          onPress={() => props.navigation.navigate('Agreementland')}
          style={{ display: 'none' }}
        />




        {/* <DrawerItem
          label="Signature"
          icon={({ color, size }) => <MaterialCommunityIcons name="file-document" size={size} color={color} />}
          onPress={() => props.navigation.navigate('Signature')}
          labelStyle={styles.drawerLabel}
        /> */}
      </DrawerContentScrollView>

      {/* Logout Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={22} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      id={undefined}
      initialRouteName="Dashboard"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#70B04F',
          height: 80,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'Poppins-SemiBold',
          fontSize: 20,
        },
        drawerStyle: {
          backgroundColor: '#f2f2f2',
          width: 280,
        },
        drawerActiveTintColor: '#70B04F',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: {
          fontFamily: 'Poppins-Regular',
          fontSize: 16,
        },
      }}
    >
    


      <Drawer.Screen
        name="Signature"
        component={Signature}
        options={{
          headerShown: false,
          drawerItemStyle: { display: 'none' } // optional if you want to hide from drawer
        }}
      />



      <Drawer.Screen name="Agreement Form" component={AgreementForm} />
      <Drawer.Screen name="Agreement List" component={AgreementListScreen} />
     
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
        <Drawer.Screen
  name="InspectionScreen"
  component={InspectionScreen}
  options={{
    drawerItemStyle: { display: 'none' }, // hides from the drawer
  }}
/>

      <Drawer.Screen name="CameraExample" component={CameraExample} />
      <Drawer.Screen name="Agreement" component={AgreementSecond} options={{ drawerItemStyle: { display: 'none' }, headerShown: false, }} />
            <Drawer.Screen name="Agreementland" component={Agreementland} options={{ drawerItemStyle: { display: 'none' }, headerShown: false, }} />
      <Drawer.Screen name="NomineeScreen" component={NomineeScreen} options={{ drawerItemStyle: { display: 'none' }, headerShown: false, }} />
    

      <Drawer.Screen name="WitnessScreen" component={WitnessScreen} options={{ drawerItemStyle: { display: 'none' }, headerShown: false, }} />
    </Drawer.Navigator>
  );
}

// = = = = = Styles = = = =
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  headerContainer: {
    backgroundColor: '#70B04F',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  profileImage: {
    width: width * 0.25,         // 25% of screen width
    height: width * 0.25,
    borderRadius: (width * 0.25) / 2,
    borderWidth: 2,
    borderColor: '#fff',
    marginTop: 10,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },

  profileName: {
    fontSize: width < 360 ? 16 : 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginTop: 10,
  },

  profileEmail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },

  drawerLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },

  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
    position : 'relative',
    bottom : 50
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#70B04F',
    paddingVertical: 12,
    borderRadius: 10,
  },

  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
});

