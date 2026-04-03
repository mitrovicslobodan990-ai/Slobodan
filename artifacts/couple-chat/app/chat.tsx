import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { MessageBubble } from "@/components/MessageBubble";
import { GifPicker } from "@/components/GifPicker";
import { MoodPicker } from "@/components/MoodPicker";

function HeaderAvatar({
  avatarBase64,
  mood,
  size = 44,
  borderColor,
  onPress,
}: {
  avatarBase64?: string;
  mood: string;
  size?: number;
  borderColor: string;
  onPress?: () => void;
}) {
  const uri = avatarBase64 ? `data:image/jpeg;base64,${avatarBase64}` : null;
  const content = uri ? (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.5 }}>{mood}</Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      style={{
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor,
        overflow: "hidden",
      }}
    >
      {content}
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { palette, isFullscreen } = useTheme();
  const {
    currentUser,
    partner,
    messages,
    sendMessage,
    sendPoke,
    giphyApiKey,
    updateMood,
  } = useApp();
  const [text, setText] = useState("");
  const [gifPickerVisible, setGifPickerVisible] = useState(false);
  const [moodPickerVisible, setMoodPickerVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const topPad = isFullscreen
    ? 10
    : insets.top + (Platform.OS === "web" ? 67 : 0);

  const handleSend = useCallback(async () => {
    if (!text.trim()) return;
    await sendMessage({ type: "text", text: text.trim() });
    setText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [text, sendMessage]);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Dozvola odbijena", "Potrebna je dozvola za pristup galeriji.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0].base64) {
      await sendMessage({
        type: "media",
        mediaBase64: result.assets[0].base64,
        mediaType: "image",
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [sendMessage]);

  const handlePoke = useCallback(async () => {
    await sendPoke();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Bocnuto! 👉", `Bocnuo/la si ${partner.name}!`);
  }, [sendPoke, partner.name]);

  const handleGifSelect = useCallback(
    async (gif: { id: string; url: string; preview: string; title: string }) => {
      await sendMessage({ type: "gif", gifUrl: gif.url });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [sendMessage]
  );

  const reversedMessages = [...messages].reverse();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: palette.headerBg, paddingTop: topPad },
        ]}
      >
        {/* My avatar + mood picker trigger */}
        <TouchableOpacity
          onPress={() => setMoodPickerVisible(true)}
          style={styles.mySection}
        >
          <HeaderAvatar
            avatarBase64={currentUser.avatarBase64}
            mood={currentUser.mood}
            size={42}
            borderColor={colors.primary}
            onPress={() => setMoodPickerVisible(true)}
          />
          <View
            style={[styles.moodBadge, { backgroundColor: colors.primary + "30" }]}
          >
            <Text style={styles.moodBadgeEmoji}>{currentUser.mood}</Text>
          </View>
        </TouchableOpacity>

        {/* Center: partner name */}
        <View style={styles.headerCenter}>
          <Text style={[styles.partnerName, { color: colors.foreground }]}>
            {partner.name}
          </Text>
          <View style={styles.onlineRow}>
            <View
              style={[styles.onlineDot, { backgroundColor: colors.primary }]}
            />
            <Text style={[styles.onlineLabel, { color: colors.mutedForeground }]}>
              Online
            </Text>
          </View>
        </View>

        {/* Partner section: mood + avatar + poke */}
        <View style={styles.partnerSection}>
          {/* Partner mood badge */}
          <View
            style={[
              styles.partnerMoodWrap,
              { backgroundColor: colors.accent + "25", borderColor: colors.accent + "40" },
            ]}
          >
            <Text style={{ fontSize: 9, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
              raspoloženje
            </Text>
            <Text style={{ fontSize: 20 }}>{partner.mood}</Text>
          </View>

          {/* Partner avatar */}
          <HeaderAvatar
            avatarBase64={partner.avatarBase64}
            mood={partner.mood}
            size={42}
            borderColor={colors.accent}
          />

          {/* Poke button */}
          <TouchableOpacity
            onPress={handlePoke}
            style={[styles.pokeBtn, { backgroundColor: colors.accent + "25" }]}
          >
            <Text style={{ fontSize: 20 }}>👉</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={reversedMessages}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={[
            styles.messageList,
            {
              paddingBottom: 12,
              paddingTop:
                Platform.OS === "web" ? 34 : insets.bottom + 12,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMe={item.senderId === "me"}
              currentUser={currentUser}
              partner={partner}
            />
          )}
        />

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom:
                Platform.OS === "web" ? 34 : insets.bottom + 4,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setGifPickerVisible(true)}
            style={[styles.iconBtn, { backgroundColor: colors.muted }]}
          >
            <Text style={[styles.gifBtnText, { color: colors.primary }]}>GIF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePickImage}
            style={[styles.iconBtn, { backgroundColor: colors.muted }]}
          >
            <Feather name="image" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.muted,
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            placeholder="Napiši poruku..."
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim()}
            style={[
              styles.sendBtn,
              {
                backgroundColor: text.trim() ? colors.primary : colors.muted,
              },
            ]}
          >
            <Feather
              name="send"
              size={20}
              color={text.trim() ? colors.primaryForeground : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <GifPicker
        visible={gifPickerVisible}
        apiKey={giphyApiKey}
        onSelect={handleGifSelect}
        onClose={() => setGifPickerVisible(false)}
      />

      <MoodPicker
        visible={moodPickerVisible}
        currentMood={currentUser.mood}
        onSelect={updateMood}
        onClose={() => setMoodPickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  mySection: {
    alignItems: "center",
    position: "relative",
  },
  moodBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  moodBadgeEmoji: {
    fontSize: 13,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  partnerName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  onlineLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  partnerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  partnerMoodWrap: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  pokeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  messageList: {
    paddingHorizontal: 0,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  gifBtnText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  input: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 120,
    borderWidth: 1,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
});
