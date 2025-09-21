import React, { useState } from 'react';
import { View, StyleSheet, Image, Text ,Button } from 'react-native';
import SignatureView from './SignatureScreen';


const Signature: React.FC = () => {
  const [signature, setSignature] = useState<string | null>(null);

  const handleSave = (signatureData: string) => {
    setSignature(signatureData);
  };


 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Digital Signature</Text>
      
      {signature ? (
        <View style={styles.signaturePreviewContainer}>
          <Text style={styles.previewTitle}>Signature Preview:</Text>
          <Image 
            source={{ uri: signature }} 
            style={styles.signatureImage} 
            resizeMode="contain"
          />
          <Button 
            title="Sign Again" 
            onPress={() => setSignature(null)} 
          />
        </View>
      ) : (
        <SignatureView onSave={handleSave} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  signaturePreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  signatureImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
 
  },
});

export default Signature;