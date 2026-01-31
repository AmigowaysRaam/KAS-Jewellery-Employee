import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Image,
    Modal,
    PanResponder,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { hp, wp } from "../../app/resources/dimensions";

export default function ImageViewerModal({ visible, uri, onClose }) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });
  const initialDistance = useRef(0);

  useEffect(() => {
    if (!visible) reset();
  }, [visible]);

  const reset = () => {
    lastScale.current = 1;
    lastTranslate.current = { x: 0, y: 0 };
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
  };

  const closeWithAnimation = () => {
    Animated.timing(translateY, {
      toValue: hp(100),
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      reset();
      onClose();
    });
  };

  const getDistance = (t) => {
    const dx = t[0].pageX - t[1].pageX;
    const dy = t[0].pageY - t[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (e) => {
        if (e.nativeEvent.touches.length === 2) {
          initialDistance.current = getDistance(e.nativeEvent.touches);
        }
      },

      onPanResponderMove: (e, g) => {
        // PINCH
        if (e.nativeEvent.touches.length === 2) {
          const distance = getDistance(e.nativeEvent.touches);
          let newScale = (distance / initialDistance.current) * lastScale.current;
          newScale = Math.max(1, Math.min(newScale, 4));
          scale.setValue(newScale);
        }

        // PAN (only if zoomed)
        if (e.nativeEvent.touches.length === 1 && lastScale.current > 1) {
          translateX.setValue(lastTranslate.current.x + g.dx);
          translateY.setValue(lastTranslate.current.y + g.dy);
        }

        // SWIPE DOWN TO CLOSE
        if (lastScale.current === 1 && g.dy > 0) {
          translateY.setValue(g.dy);
        }
      },

      onPanResponderRelease: (e, g) => {
        lastScale.current = scale.__getValue();
        lastTranslate.current = {
          x: translateX.__getValue(),
          y: translateY.__getValue(),
        };

        if (lastScale.current === 1 && g.dy > 120) {
          closeWithAnimation();
          return;
        }

        if (lastScale.current === 1) {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!uri) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        {/* Background tap */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,1)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "85%",
  },
  closeBtn: {
    position: "absolute",
    top: hp(5),
    right: wp(4),
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: wp(6),
    padding: wp(2),
  },
});
