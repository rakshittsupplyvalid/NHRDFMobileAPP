import React, { useRef, useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  ImageStyle,
  Text,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  uri?: string | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");

const GlobalImageViewer: React.FC<Props> = ({ visible, uri, onClose }) => {
  if (!uri) return null;

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);

  // 🤏 Pinch-to-zoom state
  const lastScale = useRef(1);
  const lastDistance = useRef(0);
  const initialDistance = useRef(0);

  // Calculate distance between two touches
  const getDistance = (touches: any[]) => {
    const [touch1, touch2] = touches;
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 👆 Pan and Pinch handling
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Allow pan for single touch or pinch for multi-touch
        return gesture.numberActiveTouches === 1
          ? Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2
          : gesture.numberActiveTouches === 2;
      },
      onPanResponderGrant: (evt) => {
        // Initialize pinch gesture
        if (evt.nativeEvent.touches.length === 2) {
          const distance = getDistance(evt.nativeEvent.touches);
          initialDistance.current = distance;
          lastDistance.current = distance;
          lastScale.current = currentZoom;
        }
      },
      onPanResponderMove: (evt, gesture) => {
        if (evt.nativeEvent.touches.length === 2) {
          // 🤏 Pinch-to-zoom
          const distance = getDistance(evt.nativeEvent.touches);
          const scaleChange = distance / initialDistance.current;
          const newZoom = Math.max(1, Math.min(20, lastScale.current * scaleChange));
          
          setCurrentZoom(newZoom);
          scale.setValue(newZoom);
        } else if (evt.nativeEvent.touches.length === 1) {
          // 👆 Single finger pan
          translateX.setValue(gesture.dx);
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (evt) => {
        // Reset pinch state
        if (evt.nativeEvent.touches.length === 0) {
          lastScale.current = currentZoom;
          
          // Only reset position if not zoomed
          if (currentZoom <= 1) {
            Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
            Animated.spring(translateY, { toValue: 0, useNativeDriver: false }).start();
          }
        }
      },
    })
  ).current;

  // 🔍 Zoom handling (double tap cycles through zoom levels)
  const handleDoubleTap = () => {
    let newZoom = 1;
    if (currentZoom === 1) newZoom = 3;
    else if (currentZoom === 3) newZoom = 6;
    else newZoom = 1;

    setCurrentZoom(newZoom);
    lastScale.current = newZoom;
    Animated.spring(scale, {
      toValue: newZoom,
      useNativeDriver: false,
    }).start();

    // Reset position when zooming out
    if (newZoom === 1) {
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
      Animated.spring(translateY, { toValue: 0, useNativeDriver: false }).start();
    }
  };

  // 🔍 Zoom controls
  const handleZoomIn = () => {
    const newZoom = Math.min(currentZoom + 2, 20);
    setCurrentZoom(newZoom);
    lastScale.current = newZoom;
    Animated.spring(scale, {
      toValue: newZoom,
      useNativeDriver: false,
    }).start();
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(currentZoom - 2, 1);
    setCurrentZoom(newZoom);
    lastScale.current = newZoom;
    Animated.spring(scale, {
      toValue: newZoom,
      useNativeDriver: false,
    }).start();

    if (newZoom === 1) {
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
      Animated.spring(translateY, { toValue: 0, useNativeDriver: false }).start();
    }
  };

  // 🔄 Reset to default view
  const handleReset = () => {
    setCurrentZoom(1);
    lastScale.current = 1;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: false }),
    ]).start();
    setRotation(0);
    setFlipped(false);
  };

  // ✅ Reset everything on close
  const handleClose = () => {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    setRotation(0);
    setFlipped(false);
    setCurrentZoom(1);
    lastScale.current = 1;
    onClose();
  };

  // ✅ Typed transform style
  const animatedStyle: Animated.WithAnimatedObject<ImageStyle> = {
    transform: [
      { scale },
      { translateX },
      { translateY },
      { rotate: `${rotation}deg` },
      { scaleX: flipped ? -1 : 1 },
    ],
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {/* Top Toolbar */}
        <View style={styles.topToolbar}>
          <View style={styles.toolbarLeft}>
            <View style={styles.zoomIndicator}>
              <MaterialCommunityIcons name="magnify" size={18} color="#fff" />
              <Text style={styles.zoomText}>{currentZoom.toFixed(1)}x</Text>
            </View>
          </View>

          <View style={styles.toolbarRight}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setRotation((r) => r - 90)}>
              <MaterialCommunityIcons name="rotate-left" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => setRotation((r) => r + 90)}>
              <MaterialCommunityIcons name="rotate-right" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => setFlipped((f) => !f)}>
              <MaterialCommunityIcons name="flip-horizontal" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleReset}>
              <MaterialCommunityIcons name="restore" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image container */}
        <View style={styles.imageContainer} {...panResponder.panHandlers}>
          <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap}>
            <Animated.Image
              source={{ uri }}
              style={[styles.image, animatedStyle]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Zoom Controls */}
        <View style={styles.bottomToolbar}>
          <TouchableOpacity
            style={[styles.zoomButton, currentZoom === 1 && styles.zoomButtonDisabled]}
            onPress={handleZoomOut}
            disabled={currentZoom === 1}
          >
            <MaterialCommunityIcons
              name="minus"
              size={28}
              color={currentZoom === 1 ? "#666" : "#fff"}
            />
          </TouchableOpacity>

          <View style={styles.zoomSlider}>
            <View style={styles.zoomTrack}>
              <View
                style={[
                  styles.zoomProgress,
                  { width: `${((currentZoom - 1) / 19) * 100}%` },
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.zoomButton, currentZoom === 20 && styles.zoomButtonDisabled]}
            onPress={handleZoomIn}
            disabled={currentZoom === 20}
          >
            <MaterialCommunityIcons
              name="plus"
              size={28}
              color={currentZoom === 20 ? "#666" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        {/* Hint Text */}
        {currentZoom === 1 && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>Double tap to zoom • Pinch to zoom • Drag to move</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default GlobalImageViewer;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  topToolbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  toolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  toolbarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  zoomIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  zoomText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,0,0,0.2)",
    borderRadius: 22,
  },
  imageContainer: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width * 0.95,
    height: height * 0.75,
  },
  bottomToolbar: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 15,
  },
  zoomButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 25,
  },
  zoomButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  zoomSlider: {
    flex: 1,
    height: 50,
    justifyContent: "center",
  },
  zoomTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  zoomProgress: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  hintContainer: {
    position: "absolute",
    bottom: 110,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintText: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.8,
  },
});