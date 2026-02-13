import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Image,
    Modal,
    PanResponder,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function MediaViewerModal({
  visible,
  uri,
  type, // "image" or "video"
  onClose,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });
  const initialDistance = useRef(0);

  const videoRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      reset();
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    }
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
      onStartShouldSetPanResponder: () => type === "image",
      onMoveShouldSetPanResponder: () => type === "image",

      onPanResponderGrant: (e) => {
        if (e.nativeEvent.touches.length === 2) {
          initialDistance.current = getDistance(e.nativeEvent.touches);
        }
      },

      onPanResponderMove: (e, g) => {
        if (type !== "image") return;

        // PINCH
        if (e.nativeEvent.touches.length === 2) {
          const distance = getDistance(e.nativeEvent.touches);
          let newScale =
            (distance / initialDistance.current) * lastScale.current;
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
        if (type !== "image") return;

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
      <SafeAreaView style={styles.safeArea}>
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
                transform:
                  type === "image"
                    ? [{ translateX }, { translateY }, { scale }]
                    : [{ translateY }],
              },
            ]}
            {...(type === "image" ? panResponder.panHandlers : {})}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={30} color={COLORS?.primary} />
            </TouchableOpacity>

            {type === "image" ? (
              <Image
                source={{ uri }}
                style={styles.media}
                resizeMode="contain"
              />
            ) : (
              <Video
                ref={videoRef}
                source={{ uri }}
                style={styles.media}
                resizeMode="contain"
                useNativeControls
                shouldPlay
                isLooping
              />
            )}
          </Animated.View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,1)",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,1)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: wp(95),
    height: hp(85),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: wp(0.5),
    borderColor: "#ccc",
    borderRadius: wp(4),
    overflow: "hidden",
    backgroundColor: "#000",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  closeBtn: {
    position: "absolute",
    top: hp(2),
    right: wp(3),
    zIndex: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: wp(8),
    padding: wp(2),
    borderWidth: wp(0.6),
    borderColor: COLORS?.primary,
  },
});
