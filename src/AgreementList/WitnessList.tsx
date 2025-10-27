import React, { useEffect, useState ,  useCallback  } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Card, Text, Avatar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import apiClient from "../Service/apiInterceptors";
import { DrawerParamList } from "../Type/type";
import { BackHandler } from 'react-native';
import { useFocusEffect  } from "@react-navigation/native";
type Witness = {
  name: string;
  mobileno: string;
  email: string;
  addrline: string;
  pincode: string;
  statename: string;
  districtname: string;
  villagename: string;
};

type NomineeScreenRouteProp = RouteProp<DrawerParamList, "NomineeScreen">;

const WitnessScreen = () => {
  const route = useRoute<NomineeScreenRouteProp>();
  const navigation = useNavigation();
  const { agreementId } = route.params;

  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [loading, setLoading] = useState(true);


      useFocusEffect(
        useCallback(() => {
          const onBackPress = () => {
            navigation.navigate("AgreementListScreen" as never);
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
  

  useEffect(() => {
    fetchWitnesses();
  }, []);

  const fetchWitnesses = async () => {
    try {
      const response = await apiClient.get(
        `/api/witness/agreement/${agreementId}`
      );
      if (response.data && response.data.witnesses) {
        setWitnesses(response.data.witnesses);
      }
    } catch (error) {
      console.log("Error fetching witnesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderWitness = ({ item }: { item: Witness }) => (
    <Card style={styles.card} elevation={5}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Text
          size={40}
          label={item.name ? item.name.charAt(0).toUpperCase() : "?"}
          style={{ backgroundColor: "#70B04F" }}
          color="#fff"
        />
        <View style={styles.infoContainer}>
          <Text style={styles.witnessName}>{item.name}</Text>

          <View style={styles.row}>
            <MaterialCommunityIcons name="phone" size={18} color="#70B04F" />
            <Text style={styles.infoText}>{item.mobileno || "-"}</Text>
          </View>

          {item.email ? (
            <View style={styles.row}>
              <MaterialCommunityIcons name="email-outline" size={18} color="#70B04F" />
              <Text style={styles.infoText}>{item.email}</Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <MaterialCommunityIcons name="home-outline" size={18} color="#70B04F" />
            <Text style={styles.infoText}>{item.addrline || "-"}</Text>
          </View>

          <View style={styles.row}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color="#70B04F" />
            <Text style={styles.infoText}>
              {item.villagename || "-"}, {item.districtname || "-"}, {item.statename || "-"}
            </Text>
          </View>

          <View style={styles.row}>
            <MaterialCommunityIcons name="map-marker-distance" size={18} color="#70B04F" />
            <Text style={styles.infoText}>Pincode: {item.pincode || "-"}</Text>
          </View>
        </View>
      </Card.Content>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("AgreementListScreen" as never)}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Witnesses</Text>
      </View>

      {witnesses.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="account-off-outline"
            size={80}
            color="#ccc"
          />
          <Text style={styles.emptyText}>No Witness Found</Text>
        </View>
      ) : (
        <FlatList
          data={witnesses}
          renderItem={renderWitness}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default WitnessScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f7" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#70B04F",
    paddingVertical: 16,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  backButton: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },

  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 10,
  },
  cardContent: { flexDirection: "row" },
  infoContainer: { marginLeft: 12, flex: 1 },
  witnessName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#70B04F",
    marginBottom: 6,
  },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 2 },
  infoText: { fontSize: 14, color: "#444", marginLeft: 6 },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, color: "#aaa", marginTop: 10 },
});
