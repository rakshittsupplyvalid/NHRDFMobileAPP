import { StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F4F9F4",
  },
   
  iconButton: {
    backgroundColor: "#EAF0FF",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    flexDirection: "row",
    gap: 8,
  },
  placeholderStyle: { color: "#000", fontSize: 14 },
selectedTextStyle: { color: "#000", fontSize: 14 },
inputError: { borderColor: "red" },

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

  paddingHorizontal: 10,
  fontSize: 14,
  backgroundColor: "#fff",
  marginBottom: 6,
   borderWidth: 1,
    borderColor: '#a6a8acff',
    
    borderRadius: 10,   // ✅ Add this line
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#a6a8acff',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#a6a8acff",
    borderRadius: 10,
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
    borderRadius: 10,
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
   dateButton: {
    marginTop: 8,
    borderColor: '#a6a8acff',
  },
  
  imagePickerContainer: {
    marginBottom: 16,
  },
  
  imagePickerButton: {
    marginTop: 8,
    borderColor: '#a6a8acff',
  },
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  
  previewImage: {
    width: 100,
    height: 100,
    marginTop: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  signatureFieldContainer: {
    marginBottom: 20,
  },
  signaturePreviewContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  signatureImage: {
    width: '100%',
    height: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  signatureActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  signatureButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  clearButton: {
    borderColor: '#FF3B30',
  },
  signatureModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: height * 0.8,
  },
  signatureModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  signatureModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  signatureModalContent: {
    height: 400,
  },
  
offtypeRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
  padding: 12,
  backgroundColor: '#f8f9fa',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#e9ecef',
},

countNumber: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#2E7D32',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},

countNumberText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},

offtypeInputs: {
  flex: 1,
  flexDirection: 'row',
  gap: 12,
},

offtypeInputContainer: {
  flex: 1,
},

offtypeLabel: {
  fontSize: 12,
  fontWeight: '500',
  marginBottom: 4,
  color: '#495057',
},

offtypeInput: {
  borderWidth: 1,
  borderColor: '#ced4da',
  borderRadius: 4,
  padding: 8,
  backgroundColor: 'white',
  fontSize: 14,
},

removeButton: {
  marginLeft: 8,
  alignSelf: 'flex-start',
},

addMoreButton: {
  marginTop: 16,
  borderColor: '#2E7D32',
},

sectionDescription: {
  fontSize: 14,
  color: '#6c757d',
  marginBottom: 16,
  fontStyle: 'italic',
},
});