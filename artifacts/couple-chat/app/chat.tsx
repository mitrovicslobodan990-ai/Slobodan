import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  StatusBar,
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
import { MessageBubble } from "@/components/MessageBubble";
import { GifPicker } from "@/components/GifPicker";
import { MoodPicker } from "@/components/MoodPicker";

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, partner, messages, sendMessage, sendPoke, giphyApiKey, updateMood } = useApp();
  const [text, setText] = useState("");
  const [gifPickerVisible, setGifPickerVisible] = useState(false);
  const [moodPickerVisible, setMoodPickerVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

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
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => setMoodPickerVisible(true)}
            style={styles.myMoodBtn}
          >
            <Text style={styles.moodEmoji}>{currentUser.mood}</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{partner.name}</Text>
            <Text style={styles.headerSub}>● Online</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.partnerMoodContainer}>
            <Text style={styles.partnerMoodLabel}>Raspoloženje</Text>
            <Text style={styles.partnerMoodEmoji}>{partner.mood}</Text>
          </View>
          <TouchableOpacity onPress={handlePoke} style={styles.pokeBtn}>
            <Text style={styles.pokeBtnText}>👉</Text>
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
              paddingTop: Platform.OS === "web" ? 34 : insets.bottom + 12,
            },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <MessageBubble message={item} isMe={item.senderId === "me"} />
          )}
        />

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 4,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setGifPickerVisible(true)}
            style={[styles.iconBtn, { backgroundColor: colors.muted }]}
          >
            <Text style={styles.gifBtnText}>GIF</Text>
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
            returnKeyType="default"
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
              color={text.trim() ? "#fff" : colors.mutedForeground}
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  myMoodBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  moodEmoji: {
    fontSize: 26,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  headerSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  partnerMoodContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  partnerMoodLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 9,
    fontFamily: "Inter_400Regular",
  },
  partnerMoodEmoji: {
    fontSize: 22,
  },
  pokeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  pokeBtnText: {
    fontSize: 22,
  },
  messageList: {
    paddingHorizontal: 4,
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
    color: "#e84393",
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
