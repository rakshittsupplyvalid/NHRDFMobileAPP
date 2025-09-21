import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 50,
    paddingHorizontal: 15,
    fontSize: 16,

    backgroundColor: '#ffffff',
  },
  inputFocused: {
    borderColor: '#3498db',
    backgroundColor: '#fff',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});