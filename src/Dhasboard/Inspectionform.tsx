// DhasboardStyle.js
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F4F9F4",
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F5E8",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#455A64",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FAFFFA",
    fontSize: 14,
  },
  dateInput: {
    backgroundColor: "#FAFFFA",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  dropdown: {
    height: 50,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: "#FAFFFA",
  },
  dropdownError: {
    borderColor: "#B00020",
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#455A64",
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  radioLabel: {
    fontSize: 14,
    color: "#455A64",
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 30,
    borderRadius: 8,
    backgroundColor: "#2E7D32",
    paddingVertical: 6,
    elevation: 2,
  },
  submitButtonContent: {
    height: 48,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F9F4",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#2E7D32",
  },
});