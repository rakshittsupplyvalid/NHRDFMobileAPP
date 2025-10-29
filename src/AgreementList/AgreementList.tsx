import React, { useEffect, useState  , useCallback} from "react";
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import apiClient, { retrieveToken } from "../Service/apiInterceptors";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DrawerParamList } from "../Type/type";
import {  useFocusEffect } from "@react-navigation/native";
import { BackHandler } from 'react-native';


type AgreementListScreenNavigationProp = NativeStackNavigationProp<
  DrawerParamList,
  "AgreementListScreen"
>;




const AgreementListScreen = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  
 const navigation = useNavigation<AgreementListScreenNavigationProp>();

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      const token = await retrieveToken();
      if (!token) {
        console.log("Token not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await apiClient.get("/api/agreement/list?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAgreements(response.data);
      console.log("Fetched agreements:", response.data);
    } catch (error) {
      console.log("Error fetching agreements:", error);
    } finally {
      setLoading(false);
    }
  };



     useFocusEffect(
        useCallback(() => {
          const onBackPress = () => {
            navigation.navigate("Dashboard" as never);
            return true; // prevent default behavior
          };
    
          // ✅ Add the event listener
          const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            onBackPress
          );
    
          // ✅ Clean up correctly
          return () => subscription.remove();
        }, [navigation])
      );
  

  const handleNominee = (item) => {
    console.log("Nominee clicked:", item.id);
    navigation.navigate("NomineeScreen", { agreementId: item.id });
  };

  const handleWitness = (item) => {
    console.log("Witness clicked:", item.id);
    navigation.navigate("WitnessScreen", { agreementId: item.id });
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons name="office-building" size={24} color="#70B04F" />
          <Text style={styles.centerName}>{item.centername}</Text>
        </View>

        {/* <View style={styles.row}>
          <MaterialCommunityIcons name="identifier" size={22} color="#70B04F" />
          <View style={styles.spacer} />
          <Text style={styles.label}>ID</Text>
          <View style={styles.flexSpacer} />
          <Text style={styles.value}>{item.id}</Text>
        </View> */}

        <View style={styles.row}>
          <MaterialCommunityIcons name="account" size={22} color="#70B04F" />
          <View style={styles.spacer} />
          <Text style={styles.label}>Farmer</Text>
          <View style={styles.flexSpacer} />
          <Text style={styles.value}>{item.farmername}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="seed" size={22} color="#70B04F" />
          <View style={styles.spacer} />
          <Text style={styles.label}>Commodity</Text>
          <View style={styles.flexSpacer} />
          <Text style={styles.value}>{item.commodityname}</Text>
        </View>
{/* 
        <View style={styles.row}>
          <MaterialCommunityIcons name="flower" size={22} color="#70B04F" />
          <View style={styles.spacer} />
          <Text style={styles.label}>Variety</Text>
          <View style={styles.flexSpacer} />
          <Text style={styles.value}>{item.varietyname}</Text>
        </View> */}

        <View style={styles.row}>
          <MaterialCommunityIcons name="numeric" size={22} color="#70B04F" />
          <View style={styles.spacer} />
          <Text style={styles.label}>Lot Number</Text>
          <View style={styles.flexSpacer} />
          <Text style={styles.value}>{item.lotnumber}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="tag" size={22} color="#70B04F" />
          <View style={styles.spacer} />
          <Text style={styles.label}>Tag Number</Text>
          <View style={styles.flexSpacer} />
          <Text style={styles.value}>{item.tagnumber}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="file-document" size={22} color="#70B04F" />
          <View style={styles.spacer} />
          <Text style={styles.label}>Bill Number</Text>
          <View style={styles.flexSpacer} />
          <Text style={styles.value}>{item.billnumber}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="seed-outline" size={22} color="#70B04F" />
          <View style={styles.spacer} />
          <Text style={styles.label}>Planting Material</Text>
          <View style={styles.flexSpacer} />
          <Text style={styles.value}>{item.plantingmaterial}</Text>
        </View>
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button
          icon="account-group"
          mode="contained"
          onPress={() => handleNominee(item)}
          style={styles.btn}
          buttonColor="#70B04F"
        >
          Nominee
        </Button>
        <Button
          icon="account-tie"
          mode="outlined"
          onPress={() => handleWitness(item)}
          style={styles.btn}
          textColor="#70B04F"
        >
          Witness
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#70B04F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={agreements}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id + "_" + index}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f0f4f7",
  },
  card: {
    marginBottom: 15,
    borderRadius: 16,
    backgroundColor: "#fff",
    elevation: 6,
    paddingVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  centerName: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginVertical: 5,
  },
  spacer: {
    width: 10,
  },
  flexSpacer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
  value: {
    fontSize: 15,
    color: "#70B04F",
    fontWeight: "600",
    textAlign: "right",
  },
  actions: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  btn: {
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AgreementListScreen;
