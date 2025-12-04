import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F4F9F4",
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#E8F5E8",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#2E7D32",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
    marginTop: 12,
  },
  input: {



    height: 38,
    fontSize: 14,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#fff',
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#A5D6A7",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  dropdownError: {
    borderColor: "#D32F2F",
  },
  error: {
    color: "#D32F2F",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  radioGroup: {
    marginVertical: 8,
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
    marginLeft: 4,
    fontSize: 14,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F9F4",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#2E7D32",
  },
});