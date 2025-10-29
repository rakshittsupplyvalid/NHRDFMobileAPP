// utils/GlobalAlert.js
import { Alert } from "react-native";

let alertShown = false; // prevent repeated alerts while typing fast

export const showValidationAlert = (message) => {
  if (alertShown) return; // don't spam multiple alerts

  alertShown = true;
  Alert.alert("Validation Error ⚠️", message, [
    {
      text: "OK",
      onPress: () => {
        alertShown = false;
      },
    },
  ]);
};
