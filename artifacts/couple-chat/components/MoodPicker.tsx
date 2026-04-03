import React, { useRef } from "react";
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

const MOODS = [
  { emoji: "😊", label: "Sretno" },
  { emoji: "❤️", label: "Ljubav" },
  { emoji: "😍", label: "Zaljubljen/a" },
  { emoji: "🥰", label: "Presretan/a" },
  { emoji: "😘", label: "Pusa" },
  { emoji: "😴", label: "Umoran/a" },
  { emoji: "😔", label: "Tužno" },
  { emoji: "😤", label: "Nervozan/a" },
  { emoji: "🤒", label: "Bolestan/a" },
  { emoji: "😂", label: "Smijeh" },
  { emoji: "🤗", label: "Zagrljaj" },
  { emoji: "🥺", label: "Molim te" },
  { emoji: "😏", label: "Zločesto" },
  { emoji: "🤩", label: "Oduševljen/a" },
  { emoji: "😌", label: "Miran/a" },
  { emoji: "🤔", label: "Razmišljam" },
  { emoji: "😎", label: "Cool" },
  { emoji: "🥳", label: "Slavlje" },
  { emoji: "💪", label: "Snažan/a" },
  { emoji: "🙏", label: "Zahvalan/a" },
];

interface MoodPickerProps {
  visible: boolean;
  currentMood: string;
  onSelect: (mood: string) => void;
  onClose: () => void;
}

export function MoodPicker({
  visible,
  currentMood,
  onSelect,
  onClose,
}: MoodPickerProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>
            Kako se osjećaš? 💭
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Tvoj partner će vidjeti tvoje raspoloženje
          </Text>
          <FlatList
            data={MOODS}
            numColumns={4}
            keyExtractor={(item) => item.emoji}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.moodItem,
                  currentMood === item.emoji && {
                    backgroundColor: colors.secondary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => {
                  onSelect(item.emoji);
                  onClose();
                }}
              >
                <Text style={styles.moodEmoji}>{item.emoji}</Text>
                <Text style={[styles.moodLabel, { color: colors.mutedForeground }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    borderRadius: 24,
    padding: 20,
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    shadowColor: "#e84393",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 16,
  },
  moodItem: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    margin: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 2,
  },
});
