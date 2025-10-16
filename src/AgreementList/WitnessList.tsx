import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";

import { DrawerParamList } from "../Type/type";

type NomineeScreenRouteProp = RouteProp<DrawerParamList, "NomineeScreen">;

const  WitnessScreen = () => {
  const route = useRoute<NomineeScreenRouteProp>();
  const { agreementId } = route.params;

  return (
  
      

      <View >
        <Text >Agreement ID:</Text>
        <Text >{agreementId}</Text>
      </View>

  
      
  );
};

export default WitnessScreen;


    
