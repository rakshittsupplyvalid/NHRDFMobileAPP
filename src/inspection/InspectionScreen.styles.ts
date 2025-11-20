import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Width-percentage
const wp = (percent) => (width * percent) / 100;

// Height-percentage
const hp = (percent) => (height * percent) / 100;

// Responsive font
const rf = (size) => Math.sqrt((height * height) + (width * width)) * (size / 1000);


export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(4),
    backgroundColor: "#F4F9F4",
  },

  iconButton: {
    backgroundColor: "#EAF0FF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(3),
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: hp(1.2),
    flexDirection: "row",
    gap: wp(2),
  },

  placeholderStyle: { 
    color: "#666", 
    fontSize: rf(14),
  },
  selectedTextStyle: { 
    color: "#000", 
    fontSize: rf(14),
  },

  inputError: { borderColor: "red" },

  card: {
    marginBottom: hp(2),
    borderRadius: wp(3),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp(0.3) },
    shadowOpacity: 0.1,
    shadowRadius: wp(1),
    backgroundColor: "#fff",
  },

  header: {
    backgroundColor: "#E8F5E8",
    padding: wp(4),
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    color: "#2E7D32",
    fontSize: rf(18),
    fontWeight: "bold",
    marginLeft: wp(2.5),
  },

  content: { padding: wp(4) },

  label: {
    fontSize: rf(14),
    fontWeight: "600",
    marginBottom: hp(0.7),
    color: "#333",
    marginTop: hp(1.2),
  },

  input: {
    height: hp(5.5),
    paddingHorizontal: wp(3),
    fontSize: rf(14),
    backgroundColor: "#fff",
    marginBottom: hp(0.5),
    borderWidth: 1,
    borderColor: '#a6a8ac',
    borderRadius: wp(2),
  },

  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },

  textArea: {
    height: hp(12),
    textAlignVertical: 'top',
  },

  dateInput: {
    borderWidth: 1,
    borderColor: '#a6a8ac',
    borderRadius: wp(2.5),
    padding: wp(3),
    backgroundColor: '#fff',
  },

  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#a6a8ac",
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    marginBottom: hp(0.5),
    height: hp(5.5),
    justifyContent: 'center',
  },

  dropdownError: { borderColor: "#D32F2F" },

  error: {
    color: "#D32F2F",
    fontSize: rf(12),
    marginTop: hp(0.3),
    marginBottom: hp(1),
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  halfInput: { width: "48%" },

  radioGroup: { marginVertical: hp(1) },

  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(0.5),
  },

  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: wp(4),
  },

  radioLabel: {
    marginLeft: wp(1),
    fontSize: rf(14),
    color: "#333",
  },

  submitButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: hp(1.6),
    marginHorizontal: wp(4),
    marginBottom: hp(3),
    borderRadius: wp(2),
    elevation: 2,
  },

  submitButtonText: {
    color: "#fff",
    fontSize: rf(16),
    fontWeight: "bold",
    textAlign: "center",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F9F4",
  },

  loadingText: {
    marginTop: hp(2),
    fontSize: rf(16),
    color: "#2E7D32",
  },

  dateButton: {
    marginTop: hp(1),
    borderColor: '#a6a8ac',
    height: hp(5.5),
    justifyContent: 'center',
  },

  dateDisplayContainer: {
    borderWidth: 1,
    borderColor: '#a6a8ac',
    borderRadius: wp(2),
    padding: wp(3),
    backgroundColor: '#f0f8f0',
    marginTop: hp(1),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: hp(5.5),
  },

  dateDisplayText: {
    fontSize: rf(14),
    color: '#2E7D32',
    fontWeight: '500',
  },

  todayBadge: {
    backgroundColor: '#2E7D32',
    color: 'white',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(1.5),
    fontSize: rf(10),
    fontWeight: 'bold',
  },

  errorContainer: {
    marginHorizontal: wp(4),
    marginBottom: hp(2),
  },

  signatureFieldContainer: {
    marginBottom: hp(3),
  },

  signaturePreviewContainer: {
    alignItems: 'center',
    marginBottom: hp(1.2),
  },

  signatureImage: {
    width: '100%',
    height: hp(20),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp(2),
    backgroundColor: '#f9f9f9',
    marginBottom: hp(1),
  },

  signatureActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  signatureButton: {
    flex: 1,
    marginHorizontal: wp(1),
    height: hp(5.5),
    justifyContent: 'center',
  },

  clearButton: { borderColor: '#FF3B30' },

  signatureModal: {
    backgroundColor: 'white',
    margin: wp(5),
    borderRadius: wp(3),
    maxHeight: height * 0.8,
  },

  signatureModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  signatureModalTitle: {
    fontSize: rf(18),
    fontWeight: 'bold',
    color: '#333',
  },

  signatureModalContent: { height: hp(50) },

  offtypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
    padding: wp(3),
    backgroundColor: '#f8f9fa',
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  countNumber: {
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },

  countNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: rf(16),
  },

  offtypeInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: wp(3),
  },

  offtypeInputContainer: { flex: 1 },

  offtypeLabel: {
    fontSize: rf(12),
    fontWeight: '500',
    marginBottom: hp(0.5),
    color: '#495057',
  },

  offtypeInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: wp(1),
    padding: wp(2),
    backgroundColor: 'white',
    fontSize: rf(14),
    height: hp(5),
  },

  removeButton: {
    marginLeft: wp(2),
    alignSelf: 'flex-start',
  },

  addMoreButton: {
    marginTop: hp(2),
    borderColor: '#2E7D32',
    height: hp(5.5),
    justifyContent: 'center',
  },

  sectionDescription: {
    fontSize: rf(14),
    color: '#6c757d',
    marginBottom: hp(2),
    fontStyle: 'italic',
  },

  imagePickerContainer: { marginVertical: hp(1.4) },

  imagePickerButton: { marginBottom: hp(1.2) },

  imagePreviewContainer: {
    position: "relative",
    alignItems: "center",
    marginTop: hp(1.5),
  },

  previewImage: {
    width: "70%",
    height: hp(25),
    borderRadius: wp(2),
    resizeMode: "cover",
  },

  geoOverlay: {
    position: "absolute",
    bottom: hp(3),
    left: "48%",
    transform: [{ translateX: -wp(25) }],
    minWidth: wp(50),
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingVertical: hp(0.7),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
  },

  geoText: {
    color: "#fff",
    fontSize: rf(14),
    fontWeight: "500",
  },

  imagePreviewText: {
    marginTop: hp(0.5),
    fontSize: rf(14),
    color: "#2E7D32",
  },
});
