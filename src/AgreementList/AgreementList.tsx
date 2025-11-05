import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator, BackHandler } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import apiClient, { retrieveToken } from "../Service/apiInterceptors";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DrawerParamList } from "../Type/type";

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
        console.log("Token missing, login again");
        setLoading(false);
        return;
      }

      const response = await apiClient.get(
        "/api/agreement/list?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAgreements(response.data);
      console.log("Agreements fetched:", response.data);
    } catch (error) {
      console.log("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Android back press handle — navigate to Dashboard
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Dashboard" as never);
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const handleNominee = (item) => {
    navigation.navigate("NomineeScreen", { agreementId: item.id });
  };

  const handleWitness = (item) => {
    navigation.navigate("WitnessScreen", { agreementId: item.id });
  };

  const handleInspection = (item) => {
    navigation.navigate("InspectionScreen", { agreementId: item.id });
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons name="office-building" size={24} color="#70B04F" />
          <Text style={styles.centerName}>{item.centername}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="account" size={22} color="#70B04F" />
          <Text style={styles.label}>Farmer</Text>
          <Text style={styles.value}>{item.farmername}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="seed" size={22} color="#70B04F" />
          <Text style={styles.label}>Commodity</Text>
          <Text style={styles.value}>{item.commodityname}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="numeric" size={22} color="#70B04F" />
          <Text style={styles.label}>Lot Number</Text>
          <Text style={styles.value}>{item.lotnumber}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="tag" size={22} color="#70B04F" />
          <Text style={styles.label}>Tag Number</Text>
          <Text style={styles.value}>{item.tagnumber}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="file-document" size={22} color="#70B04F" />
          <Text style={styles.label}>Bill Number</Text>
          <Text style={styles.value}>{item.billnumber}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="seed-outline" size={22} color="#70B04F" />
          <Text style={styles.label}>Planting Material</Text>
          <Text style={styles.value}>{item.plantingmaterial}</Text>
        </View>
      </Card.Content>

      {/* ✅ Updated Button UI */}
      <Card.Actions style={styles.actions}>
        <Button
          icon="account-group"
          mode="contained"
          onPress={() => handleNominee(item)}
          style={[styles.btn, styles.containedBtn]}
          textColor="#fff"
        >
          Nominee
        </Button>

        <Button
          icon="account-tie"
          mode="contained"
          onPress={() => handleWitness(item)}
          style={[styles.btn, styles.outlineBtn]}
          textColor="#fff"
        >
          Witness
        </Button>

        <Button
          icon="magnify"
          mode="contained"
          onPress={() => handleInspection(item)}
          style={[styles.btn, styles.inspectBtn]}
          textColor="#fff"
        >
          Inspection
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

export default AgreementListScreen;

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
    elevation: 5,
    paddingVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
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
  alignItems: "flex-start",
  paddingVertical: 7,
  paddingHorizontal: 10,
  backgroundColor: "#f9fafb",
  borderRadius: 10,
  marginVertical: 5,
  flexWrap: "wrap",
},

label: {
  fontSize: 15,
  color: "#444",
  fontWeight: "500",
  marginLeft: 10,
  width: 120,  // fixed width so label stable rahe
},

value: {
  fontSize: 15,
  color: "#70B04F",
  fontWeight: "600",
  flexShrink: 1,
  flex: 1,
  textAlign: "right",
},

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 3,
  },
  containedBtn: {
    backgroundColor: "#70B04F",
  },
  outlineBtn: {
    backgroundColor: "#4C8E3B",
  },
  inspectBtn: {
    backgroundColor: "#3A6F2A",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
