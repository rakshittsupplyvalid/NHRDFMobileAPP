import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Dhasboard from '../Dhasboard/Dhasboard';
import AgreementForm from '../Agreement/AgreementForm';
import AgreementSecond from '../Agreement/AgreementSecond';
import  DashboardScreen from '../DhasboadScreen/DhasboardScreen'

const Drawer = createDrawerNavigator();

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
  
       
      </View>

      <DrawerContentScrollView {...props} style={{ marginTop: 10 }}>
        {/* Drawer Items */}

         <DrawerItem
          label="Dhasboard"
          icon={({ color, size }) => <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />}
          onPress={() => props.navigation.navigate('DashboardScreen')}
          labelStyle={styles.drawerLabel}
        />


        <DrawerItem
          label="Inspection Form"
          icon={({ color, size }) => <MaterialCommunityIcons name="file-document" size={size} color={color} />}
          onPress={() => props.navigation.navigate('Inspection Form')}
          labelStyle={styles.drawerLabel}
        />

        <DrawerItem
          label="Agreement Form"
          icon={({ color, size }) => <MaterialCommunityIcons name="file-document" size={size} color={color} />}
          onPress={() => props.navigation.navigate('AgreementForm')}
          labelStyle={styles.drawerLabel}
        />

        {/* Hidden Screen */}
        <DrawerItem
          label="Agreement"
          icon={({ color, size }) => <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />}
          onPress={() => props.navigation.navigate('Agreement')}
          style={{ display: 'none' }}
        />
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
      <Drawer.Screen name="Inspection Form" component={Dhasboard} />
      <Drawer.Screen name="AgreementForm" component={AgreementForm} />
       <Drawer.Screen name="DashboardScreen" component={DashboardScreen} />
      <Drawer.Screen name="Agreement" component={AgreementSecond} options={{ drawerItemStyle: { display: 'none' } }} />
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
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,


  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 25,
   
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
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
