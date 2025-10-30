// CommonPickerstyles.ts
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
   color: "#455A64",
    marginBottom: 8,
  },
  picker: {
    height: 38,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,   // ✅ Add this line
    paddingHorizontal: 17,
    backgroundColor: '#FFFFFF',
  },
  dropdown: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
  },
});
