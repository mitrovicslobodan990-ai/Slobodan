import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function NotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sharedNote, updateSharedNote, currentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(sharedNote.content);

  const handleSave = async () => {
    await updateSharedNote(draft);
    setIsEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCancel = () => {
    setDraft(sharedNote.content);
    setIsEditing(false);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString("bs-BA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.primary,
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
          },
        ]}
      >
        <Text style={styles.headerTitle}>📒 Naše Bilješke</Text>
        <TouchableOpacity
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setDraft(sharedNote.content);
              setIsEditing(true);
            }
          }}
          style={[styles.editBtn, { backgroundColor: "rgba(255,255,255,0.25)" }]}
        >
          <Feather
            name={isEditing ? "check" : "edit-2"}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Meta info */}
      <View style={[styles.metaBar, { backgroundColor: colors.muted, borderBottomColor: colors.border }]}>
        <Feather name="clock" size={13} color={colors.mutedForeground} />
        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
          Zadnja izmjena: {sharedNote.lastEditedBy} · {formatDate(sharedNote.lastEditedAt)}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.noteContainer,
          {
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {isEditing ? (
          <>
            <TextInput
              style={[
                styles.noteInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.primary,
                },
              ]}
              value={draft}
              onChangeText={setDraft}
              multiline
              autoFocus
              textAlignVertical="top"
              placeholder="Pišite ovdje..."
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={handleCancel}
                style={[styles.actionBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Odustani</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              >
                <Feather name="check" size={16} color="#fff" />
                <Text style={[styles.actionBtnText, { color: "#fff" }]}>Sačuvaj</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setDraft(sharedNote.content);
              setIsEditing(true);
            }}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.noteDisplay,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.noteText, { color: colors.foreground }]}>
                {sharedNote.content || "Nema sadržaja. Dodirnite za uređivanje."}
              </Text>
              <View style={styles.tapHint}>
                <Feather name="edit-2" size={13} color={colors.mutedForeground} />
                <Text style={[styles.tapHintText, { color: colors.mutedForeground }]}>
                  Dodirnite za uređivanje
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  metaBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  noteContainer: {
    padding: 16,
  },
  noteDisplay: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    minHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  noteText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
  },
  noteInput: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    minHeight: 300,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  tapHintText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  actionBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
