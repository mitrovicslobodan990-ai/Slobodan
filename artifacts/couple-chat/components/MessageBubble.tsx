import React, { useState } from "react";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Message, UserProfile } from "@/context/AppContext";
import { PhotoViewer } from "./PhotoViewer";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  currentUser: UserProfile;
  partner: UserProfile;
}

function formatTime(ts: number) {
  const date = new Date(ts);
  return date.toLocaleTimeString("bs-BA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isMessageSeen(message: Message, partnerId: string): boolean {
  return !!(message.seen && message.seen[partnerId]);
}

function StatusIndicator({ message, partnerId, primaryColor, mutedColor }: {
  message: Message;
  partnerId: string;
  primaryColor: string;
  mutedColor: string;
}) {
  if (message.status === "pending") {
    return <Text style={[styles.seenIndicator, { color: mutedColor }]}>⏳</Text>;
  }
  return (
    <Text style={[styles.seenIndicator, { color: isMessageSeen(message, partnerId) ? primaryColor : mutedColor }]}>
      {isMessageSeen(message, partnerId) ? "✓✓" : "✓"}
    </Text>
  );
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function MessageText({ text, color }: { text: string; color: string }) {
  const parts = text.split(URL_REGEX);
  return (
    <Text style={[styles.messageText, { color }]}>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <Text
            key={i}
            style={styles.linkText}
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
}

export function MessageBubble({ message, isMe, currentUser, partner }: MessageBubbleProps) {
  const colors = useColors();
  const [photoVisible, setPhotoVisible] = useState(false);

  const bubbleBg = isMe ? colors.myBubble : colors.theirBubble;
  const bubbleTextColor = isMe ? colors.myBubbleText : colors.theirBubbleText;

  if (message.type === "poke") {
    const isHeart = message.text === "❤️";
    return (
      <View style={styles.pokeContainer}>
        <View style={[styles.pokeBubble, { backgroundColor: colors.secondary, borderColor: colors.primary }]}>
          <Text style={[styles.pokeText, { color: colors.primary }]}>
            {isHeart
              ? (isMe ? "❤️ Poslao/la si srce!" : "❤️ Poslao/la ti srce!")
              : (isMe ? "👉 Bocnuo/la si ga/je!" : "👉 Bocnuo/la te!")}
          </Text>
        </View>
        <View style={styles.timestampRow}>
          <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>
            {formatTime(message.timestamp)}
          </Text>
          {isMe && <StatusIndicator message={message} partnerId={partner.id} primaryColor={colors.primary} mutedColor={colors.mutedForeground} />}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      <View style={[styles.bubbleWrap, isMe ? styles.bubbleWrapMe : styles.bubbleWrapThem]}>
        {message.type === "media" && message.mediaBase64 ? (
          <TouchableOpacity onPress={() => setPhotoVisible(true)}>
            <View style={[styles.imageBubble, { borderColor: isMe ? colors.myBubble : colors.border, shadowColor: colors.primary }]}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${message.mediaBase64}` }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.timestampRow}>
              <Text style={[styles.timestamp, { color: colors.mutedForeground, textAlign: isMe ? "right" : "left" }]}>
                {formatTime(message.timestamp)}
              </Text>
              {isMe && <StatusIndicator message={message} partnerId={partner.id} primaryColor={colors.primary} mutedColor={colors.mutedForeground} />}
            </View>
            <PhotoViewer visible={photoVisible} uri={`data:image/jpeg;base64,${message.mediaBase64}`} onClose={() => setPhotoVisible(false)} />
          </TouchableOpacity>
        ) : message.type === "gif" && message.gifUrl ? (
          <TouchableOpacity onPress={() => setPhotoVisible(true)}>
            <View style={[styles.imageBubble, { borderColor: isMe ? colors.myBubble : colors.border }]}>
              <Image source={{ uri: message.gifUrl }} style={styles.messageImage} resizeMode="cover" />
              <View style={styles.gifBadge}>
                <Text style={styles.gifBadgeText}>GIF</Text>
              </View>
            </View>
            <View style={styles.timestampRow}>
              <Text style={[styles.timestamp, { color: colors.mutedForeground, textAlign: isMe ? "right" : "left" }]}>
                {formatTime(message.timestamp)}
              </Text>
              {isMe && <StatusIndicator message={message} partnerId={partner.id} primaryColor={colors.primary} mutedColor={colors.mutedForeground} />}
            </View>
            <PhotoViewer visible={photoVisible} uri={message.gifUrl} onClose={() => setPhotoVisible(false)} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.bubbleContainer, isMe ? styles.bubbleContainerMe : styles.bubbleContainerThem]}>
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: bubbleBg,
                  borderColor: isMe ? "transparent" : colors.border,
                  shadowColor: isMe ? colors.primary : "#000",
                  borderBottomRightRadius: isMe ? 4 : 20,
                  borderBottomLeftRadius: isMe ? 20 : 4,
                },
              ]}
            >
              <MessageText text={message.text ?? ""} color={bubbleTextColor} />
            </View>
          </View>
        )}
        <View style={[styles.timestampRow, { justifyContent: isMe ? "flex-end" : "flex-start", paddingHorizontal: 8 }]}>
          <Text style={[styles.timestamp, { color: colors.mutedForeground, textAlign: isMe ? "right" : "left" }]}>
            {formatTime(message.timestamp)}
          </Text>
          {isMe && <StatusIndicator message={message} partnerId={partner.id} primaryColor={colors.primary} mutedColor={colors.mutedForeground} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 2,
    paddingHorizontal: 0,
  },
  rowMe: { justifyContent: "flex-end" },
  rowThem: { justifyContent: "flex-start" },
  bubbleWrap: { maxWidth: "80%" },
  bubbleWrapMe: {},
  bubbleWrapThem: {},
  bubbleContainer: {},
  bubbleContainerMe: {},
  bubbleContainerThem: {},
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  linkText: {
    color: "#60a5fa",
    textDecorationLine: "underline",
  },
  timestampRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  seenIndicator: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  imageBubble: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  messageImage: {
    width: 210,
    height: 190,
    borderRadius: 14,
  },
  gifBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gifBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  pokeContainer: {
    alignSelf: "center",
    alignItems: "center",
    marginVertical: 6,
  },
  pokeBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  pokeText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});

export default MessageBubble;
