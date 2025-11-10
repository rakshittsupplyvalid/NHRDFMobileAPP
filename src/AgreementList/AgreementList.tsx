import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  TextInput,
} from "react-native";
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
  const [loading, setLoading] = useState(false);
  const [aadhar, setAadhar] = useState("");

  const navigation = useNavigation<AgreementListScreenNavigationProp>();

  // ✅ Auto API call when Aadhar becomes exactly 12 digits
  useEffect(() => {
    if (aadhar.length === 12) {
      fetchAgreements();
    }
  }, [aadhar]);

  // ✅ Fetch API only if Aadhar is 12 digits
  const fetchAgreements = async () => {
    try {
      if (aadhar.trim().length !== 12) return; // safety stop

      setLoading(true);

      const token = await retrieveToken();
      if (!token) {
        console.log("Token missing, login again");
        setLoading(false);
        return;
      }

      let url =
        `/api/agreement/list?AadharNo=${aadhar}` +
        "&ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED";

      console.log("Final URL:", url);

      const response = await apiClient.get(url);
      setAgreements(response.data);

      console.log("Agreements fetched:", response.data);
    } catch (error) {
      console.log("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Android Back Button → Dashboard
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Dashboard" as never);
        return true;
      };

      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => sub.remove();
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
          <MaterialCommunityIcons
            name="office-building"
            size={24}
            color="#70B04F"
          />
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
          <MaterialCommunityIcons
            name="file-document"
            size={22}
            color="#70B04F"
          />
          <Text style={styles.label}>Bill Number</Text>
          <Text style={styles.value}>{item.billnumber}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons
            name="seed-outline"
            size={22}
            color="#70B04F"
          />
          <Text style={styles.label}>Planting Material</Text>
          <Text style={styles.value}>{item.plantingmaterial}</Text>
        </View>
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button
          icon="account-group"
          mode="contained"
          onPress={() => handleNominee(item)}
          style={[styles.btn, styles.containedBtn]}
        >
          Nominee
        </Button>

        <Button
          icon="account-tie"
          mode="contained"
          onPress={() => handleWitness(item)}
          style={[styles.btn, styles.outlineBtn]}
        >
          Witness
        </Button>

        <Button
          icon="magnify"
          mode="contained"
          onPress={() => handleInspection(item)}
          style={[styles.btn, styles.inspectBtn]}
        >
          Inspection
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* ✅ Aadhar Stylish Auto Search UI */}
      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons
            name="card-account-details"
            size={24}
            color="#4CAF50"
            style={{ marginRight: 10 }}
          />

          <TextInput
            placeholder="Enter Aadhar Number"
            value={aadhar}
            maxLength={12}
            keyboardType="numeric"
            onChangeText={(text) => setAadhar(text)}
            style={styles.stylishInput}
            placeholderTextColor="#9BA0A8"
          />
        </View>

        {aadhar.length > 0 && aadhar.length < 12 && (
          <Text style={styles.helper}>Aadhar number must be 12 digits</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#70B04F" />
        </View>
      ) : (
        <FlatList
          data={agreements}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id + "_" + index}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default AgreementListScreen;

/* ✅ FINAL CLEAN UI STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f0f4f7",
  },

  /* ✅ Stylish Aadhar UI */
  searchContainer: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1.4,
    borderColor: "#d0d8df",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 3,
  },

  stylishInput: {
   
    fontSize: 17,
    fontWeight: "500",
    color: "#222",
    letterSpacing: 1,
  },

  helper: {
    marginTop: 6,
    color: "#d9534f",
    fontSize: 13,
    fontWeight: "500",
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
    paddingHorizontal: 10,
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
    width: 120,
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
