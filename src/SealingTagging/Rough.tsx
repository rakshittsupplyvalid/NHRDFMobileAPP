import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
 
export default function App() {
  return (
<KeyboardAwareScrollView
      style={styles.container}
      resetScrollToCoords={{ x: 0, y: 0 }}
      contentContainerStyle={styles.content}
      scrollEnabled={true}
>

</KeyboardAwareScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center' },
  input: { borderWidth: 1, margin: 10, padding: 10 },
});