import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
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
// import { useKeyboardHandler } from "react-native-keyboard-controller";
import { Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { MessageBubble } from "@/components/MessageBubble";
import { GifPicker } from "@/components/GifPicker";
import {
  estimateBase64Size,
} from "@/lib/imageCompression";
import { MoodPicker } from "@/components/MoodPicker";


function HeaderAvatar({
  avatarBase64,
  mood,
  size = 44,
  onPress,
}: {
  avatarBase64?: string;
  mood: string;
  size?: number;
  borderColor: string;
  onPress?: () => void;
}) {
  const uri = avatarBase64 ? `data:image/jpeg;base64,${avatarBase64}` : null;
  const colors = useColors();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.muted,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.75,
        shadowRadius: 16,
        elevation: 24,
      }}>
        <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
          {uri ? (
            <Image source={{ uri }} style={{ width: size, height: size }} />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: size * 0.5 }}>{mood}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { palette, isFullscreen, chatBackground } = useTheme();
              const {
    currentUser,
    partner,
    messages,
    sendMessage,
    sendHeart,
    updateMood,
    giphyApiKey,
    hasMoreMessages,
    loadMoreMessages,
    isLoadingMore,
    markMessagesAsSeen,
  } = useApp();
  const [text, setText] = useState("");
  const [gifPickerVisible, setGifPickerVisible] = useState(false);
  const [moodPickerVisible, setMoodPickerVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);



  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);
  const AVATAR_SIZE = 80;

  const handleSend = useCallback(async () => {
    if (!text.trim()) return;
    const msgText = text.trim();
    setText("");
    await sendMessage({ type: "text", text: msgText });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
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
    if (!result.canceled && result.assets && result.assets[0]) {
      try {
        const base64 = result.assets[0].base64 ?? "";
        if (!base64) {
          throw new Error("No base64 data returned from image picker.");
        }

        const sizeKB = estimateBase64Size(base64);
        console.log(`📸 Image base64 size: ${sizeKB}KB`);

        await sendMessage({
          type: "media",
          mediaBase64: base64,
          mediaType: "image",
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
      } catch (error) {
        Alert.alert("Greška", "Nije moguće obraditi sliku.");
        console.error("Image upload error:", error);
      }
    }
  }, [sendMessage]);

  const handleGifSelect = useCallback(
    async (gif: { id: string; url: string; preview: string; title: string }) => {
      await sendMessage({ type: "gif", gifUrl: gif.url });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    },
    [sendMessage]
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && currentUser.id) {
      const unseenMessageIds = messages
        .filter(msg => msg.senderId !== currentUser.id)
        .filter(msg => !msg.seen || !msg.seen[currentUser.id])
        .map(msg => msg.id);

      if (unseenMessageIds.length > 0) {
        markMessagesAsSeen(unseenMessageIds);
      }
    }
  }, [messages, currentUser.id, markMessagesAsSeen]);

  const handleScrollToTop = useCallback(async () => {
    if (hasMoreMessages && !isLoadingMore) {
      await loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);

  const backgroundContent = (
    <View style={[styles.container, { backgroundColor: chatBackground ? 'transparent' : colors.background, paddingTop: 0 }]}>
      <StatusBar hidden={true} />
        {/* Floating avatars container */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Partner avatar - lijevo */}
          <View style={{
            backgroundColor: colors.muted,
            padding: 8,
            borderRadius: 100,
            zIndex: 1000,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.45,
            shadowRadius: 5,
            elevation: 10,
          }}>
        <HeaderAvatar
          avatarBase64={partner.avatarBase64}
          mood={partner.mood}
          size={AVATAR_SIZE}
          borderColor={colors.accent}
          onPress={() => {
            sendHeart();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
        />
        <View style={{
            position: 'absolute',
            bottom: -8,
            right: -8,
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.7,
            shadowRadius: 8,
            elevation: 16,
          }}
        >
          <Text style={{ fontSize: 18 }}>{partner.mood}</Text>
        </View>
          </View>

          {/* My avatar - desno */}
          <View style={{
            backgroundColor: colors.muted,
            padding: 8,
            borderRadius: 100,
            zIndex: 1000,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.45,
            shadowRadius: 5,
            elevation: 10,
          }}>
        <TouchableOpacity onPress={() => setMoodPickerVisible(true)}>
          <HeaderAvatar
            avatarBase64={currentUser.avatarBase64}
            mood={currentUser.mood}
            size={AVATAR_SIZE}
            borderColor={colors.primary}
          />
          <View style={{
              position: 'absolute',
              bottom: -8,
              left: -8,
              width: 28,
              height: 28,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.7,
              shadowRadius: 8,
              elevation: 16,
            }}
          >
            <Text style={{ fontSize: 18 }}>{currentUser.mood}</Text>
          </View>
        </TouchableOpacity>
          </View>
        </View>



        <FlatList
          style={{ flex: 1 }}
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
  contentContainerStyle={[
            styles.messageList,
            {
              paddingHorizontal: 16,
              paddingBottom: 160,
              paddingTop: 120,
            },

          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          inverted={false}
          onScroll={({ nativeEvent }) => {
            const { contentOffset } = nativeEvent;
            if (contentOffset.y <= 50 && hasMoreMessages && !isLoadingMore) {
              handleScrollToTop();
            }
          }}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMe={item.senderId === currentUser.id}
              currentUser={currentUser}
              partner={partner}
            />
          )}
          ListFooterComponent={() => <View style={{ height: 150 }} />}
          ListHeaderComponent={
            isLoadingMore ? (
              <View style={styles.loadingMore}>
                <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
                  Učitavanje starijih poruka...
                </Text>
              </View>
            ) : hasMoreMessages ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleScrollToTop}
              >
                <Text style={{ color: colors.primary, fontSize: 14 }}>
                  Učitaj starije poruka
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      {/* Input Bar */}
      <View
          style={[

            styles.inputBar,
            {
              position: 'absolute',
              bottom: keyboardHeight > 0 ? keyboardHeight + 10 : 90,
              left: 0,
              right: 0,
              zIndex: 9999,
              backgroundColor: 'transparent',

              borderTopColor: colors.border,
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
            textAlignVertical="top"
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim()}
            style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.muted }]}
          >
            <Feather
              name="send"
              size={20}
              color={text.trim() ? colors.primaryForeground : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>

      <GifPicker
        visible={gifPickerVisible}
        onSelect={handleGifSelect}
        onClose={() => setGifPickerVisible(false)}
        apiKey={giphyApiKey}
      />

      <MoodPicker
        visible={moodPickerVisible}
        currentMood={currentUser.mood}
        onSelect={updateMood}
        onClose={() => setMoodPickerVisible(false)}
      />
    </View>
  );

  return chatBackground ? (
    <ImageBackground
      source={{ uri: chatBackground }}
      style={{ flex: 1 }}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%' }}
    >
      {backgroundContent}
    </ImageBackground>
  ) : backgroundContent;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    position: 'relative',
    paddingTop: 0,
  },
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
    overflow: "visible",
  },
  avatarContainer: {
    alignItems: "center",
  },
  moodBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  moodBadgeEmoji: {
    fontSize: 16,
  },
  messageList: {
    paddingHorizontal: 0,
  },
  inputBar: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 2000,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 0,
  },


  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 10,
  },
  gifBtnText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 10,
  },
  loadingMore: {
    padding: 16,
    alignItems: "center",
  },
  loadMoreButton: {
    padding: 16,
    alignItems: "center",
  },
});

