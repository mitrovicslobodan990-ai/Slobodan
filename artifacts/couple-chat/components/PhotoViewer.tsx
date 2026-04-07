import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PhotoViewerProps {
  visible: boolean;
  uri: string;
  onClose: () => void;
}

export function PhotoViewer({ visible, uri, onClose }: PhotoViewerProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef(1);

  const getDistance = (touches: any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        initialDistance.current = null;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.numberActiveTouches === 2) {
          if (evt.nativeEvent.changedTouches.length >= 2) {
            const touches = evt.nativeEvent.changedTouches;
            const dist = getDistance(touches);
            if (initialDistance.current === null) {
              initialDistance.current = dist;
              initialScale.current = lastScale.current;
            }
            const newScale = Math.max(
              0.5,
              Math.min(5, (dist / initialDistance.current) * initialScale.current)
            );
            scale.setValue(newScale);
          }
        } else if (gestureState.numberActiveTouches === 1) {
          translateX.setValue(lastTranslateX.current + gestureState.dx);
          translateY.setValue(lastTranslateY.current + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        lastTranslateX.current += gestureState.dx;
        lastTranslateY.current += gestureState.dy;
        if (gestureState.numberActiveTouches === 0) {
          lastScale.current = (scale as any).__getValue();
        }
      },
    })
  ).current;

  const resetZoom = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
  };

  const handleClose = () => {
    resetZoom();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <StatusBar hidden />
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Feather name="x" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetBtn} onPress={resetZoom}>
          <Feather name="maximize-2" size={22} color="#fff" />
        </TouchableOpacity>
        <Animated.View
          style={{
            transform: [
              { scale },
              { translateX },
              { translateY },
            ],
          }}
          {...panResponder.panHandlers}
        >
          <Image
            source={{ uri }}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.85,
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 8,
  },
  resetBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 8,
  },
});
