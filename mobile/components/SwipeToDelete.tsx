import React, { useRef } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ACTION_WIDTH = 88;
const DESTRUCTIVE = "#DC2626";

interface SwipeToDeleteProps {
  onDelete: () => void;
  children: React.ReactNode;
}

/** Swipe left to reveal a delete button. */
export function SwipeToDelete({ onDelete, children }: SwipeToDeleteProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const offset = useRef(0);

  const snapTo = (value: number) => {
    offset.current = value;
    Animated.spring(translateX, {
      toValue: value,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      // Only claim clearly horizontal drags so vertical scrolling still works.
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.5,
      onPanResponderMove: (_, { dx }) => {
        translateX.setValue(
          Math.min(0, Math.max(-ACTION_WIDTH * 1.5, offset.current + dx)),
        );
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        const position = offset.current + dx;
        snapTo(position < -ACTION_WIDTH / 2 || vx < -0.5 ? -ACTION_WIDTH : 0);
      },
      onPanResponderTerminate: () => snapTo(offset.current),
    }),
  ).current;

  return (
    <View
      style={styles.container}
      accessibilityActions={[{ name: "delete", label: "Supprimer" }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "delete") onDelete();
      }}
    >
      <TouchableOpacity
        style={styles.action}
        onPress={onDelete}
        accessibilityLabel="Supprimer"
      >
        <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
        <Text style={styles.actionText}>Supprimer</Text>
      </TouchableOpacity>
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: "hidden",
  },
  action: {
    ...StyleSheet.absoluteFillObject,
    left: undefined,
    width: ACTION_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    backgroundColor: DESTRUCTIVE,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
