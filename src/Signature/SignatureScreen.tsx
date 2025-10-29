import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

type SignatureViewProps = {
  onSave: (signatureData: string) => void;
};

const SignatureView: React.FC<SignatureViewProps> = ({ onSave }) => {
  const webViewRef = useRef<WebView>(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
  const [webViewLoaded, setWebViewLoaded] = useState(false);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <script src="https://cdn.jsdelivr.net/npm/signature_pad@4.0.0/dist/signature_pad.umd.min.js"></script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        #signature-pad { width: 100%; height: 100%; touch-action: none; }
      </style>
    </head>
    <body>
      <canvas id="signature-pad"></canvas>
      <script>
        const canvas = document.getElementById('signature-pad');
        const signaturePad = new SignaturePad(canvas, {
          backgroundColor: 'rgb(255, 255, 255)',
          penColor: 'rgb(0, 0, 0)'
        });

        function resizeCanvas() {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext('2d').scale(ratio, ratio);
          signaturePad.clear();
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'webViewReady' }));

        signaturePad.addEventListener('beginStroke', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'signatureChange', isEmpty: false }));
        });

        window.clearSignature = function() {
          signaturePad.clear();
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'signatureCleared' }));
        };

        window.getSignature = function() {
          if (signaturePad.isEmpty()) {
            return null;
          }
          return signaturePad.toDataURL('image/png');
        };
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Received message:', data);

      switch (data.type) {
        case 'webViewReady':
          setWebViewLoaded(true);
          break;
        case 'signatureChange':
          setIsSignatureEmpty(data.isEmpty);
          break;
        case 'signatureCleared':
          setIsSignatureEmpty(true);
          break;
        case 'signatureSaved':
          handleSave(data.data);
          break;
        case 'signatureEmpty':
          Alert.alert('Error', 'Please provide a signature before saving.');
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }, []);

  const clearSignature = useCallback(() => {
    if (webViewLoaded) {
      webViewRef.current?.injectJavaScript('window.clearSignature(); true;');
    }
  }, [webViewLoaded]);

  const saveSignature = useCallback(() => {
    if (!webViewLoaded) {
      Alert.alert('Error', 'Signature pad is not ready yet. Please wait.');
      return;
    }

    console.log('Attempting to save signature...');
    webViewRef.current?.injectJavaScript(`
      (function() {
        try {
          const signature = window.getSignature();
          if (signature) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              type: 'signatureSaved', 
              data: signature 
            }));
          } else {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'signatureEmpty' }));
          }
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: error.message
          }));
        }
      })();
      true;
    `);
  }, [webViewLoaded]);

  const handleSave = useCallback(
    (signatureData: string) => {
      console.log('Signature data received:', signatureData.substring(0, 30) + '...');
      onSave(signatureData);
      Alert.alert('Success', 'Signature saved successfully!');

      // ✅ Clear canvas automatically after save
      clearSignature();

      // ✅ Disable Save button again until new signature is drawn
      setIsSignatureEmpty(true);
    },
    [onSave, clearSignature]
  );

  return (
    <View style={styles.container}>
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html }}
          style={styles.webview}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          mixedContentMode="always"
          scrollEnabled={false}
          onError={(error) => console.error('WebView error:', error)}
          onLoadEnd={() => console.log('WebView loaded')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Clear" onPress={clearSignature} color="#FF3B30" />
         <Button
  title="Save Signature"
  onPress={saveSignature}
  disabled={isSignatureEmpty || !webViewLoaded}
  color="green" // ✅ Green background on Android, green text on iOS
/>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webviewContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
});

export default SignatureView;
