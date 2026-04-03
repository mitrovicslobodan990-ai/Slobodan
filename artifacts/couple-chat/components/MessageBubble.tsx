import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Message } from "@/context/AppContext";
import { PhotoViewer } from "./PhotoViewer";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

function formatTime(ts: number) {
  const date = new Date(ts);
  return date.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const colors = useColors();
  const [photoVisible, setPhotoVisible] = useState(false);

  const bubbleBg = isMe ? colors.myBubble : colors.theirBubble;
  const bubbleTextColor = isMe ? colors.myBubbleText : colors.theirBubbleText;

  if (message.type === "poke") {
    return (
      <View style={styles.pokeContainer}>
        <View
          style={[styles.pokeBubble, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
        >
          <Text style={[styles.pokeText, { color: colors.primary }]}>
            👉 {isMe ? "Bocnuo/la si ga/je!" : "Bocnuo/la te!"}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, isMe ? styles.wrapperMe : styles.wrapperThem]}>
      {message.type === "media" && message.mediaBase64 ? (
        <TouchableOpacity onPress={() => setPhotoVisible(true)}>
          <View
            style={[
              styles.imageBubble,
              {
                borderColor: isMe ? colors.myBubble : colors.border,
                shadowColor: colors.primary,
              },
            ]}
          >
            <Image
              source={{ uri: `data:image/jpeg;base64,${message.mediaBase64}` }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.timestamp, { color: colors.mutedForeground, textAlign: isMe ? "right" : "left" }]}>
            {formatTime(message.timestamp)}
          </Text>
          <PhotoViewer
            visible={photoVisible}
            uri={`data:image/jpeg;base64,${message.mediaBase64}`}
            onClose={() => setPhotoVisible(false)}
          />
        </TouchableOpacity>
      ) : message.type === "gif" && message.gifUrl ? (
        <TouchableOpacity onPress={() => setPhotoVisible(true)}>
          <View style={[styles.imageBubble, { borderColor: isMe ? colors.myBubble : colors.border }]}>
            <Image
              source={{ uri: message.gifUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
            <View style={styles.gifBadge}>
              <Text style={styles.gifBadgeText}>GIF</Text>
            </View>
          </View>
          <Text style={[styles.timestamp, { color: colors.mutedForeground, textAlign: isMe ? "right" : "left" }]}>
            {formatTime(message.timestamp)}
          </Text>
          <PhotoViewer
            visible={photoVisible}
            uri={message.gifUrl}
            onClose={() => setPhotoVisible(false)}
          />
        </TouchableOpacity>
      ) : (
        <View>
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: bubbleBg,
                borderColor: isMe ? "transparent" : colors.border,
                shadowColor: isMe ? colors.primary : "#000",
              },
            ]}
          >
            <Text style={[styles.messageText, { color: bubbleTextColor }]}>
              {message.text}
            </Text>
          </View>
          <Text style={[styles.timestamp, { color: colors.mutedForeground, textAlign: isMe ? "right" : "left" }]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 3,
    maxWidth: "78%",
  },
  wrapperMe: {
    alignSelf: "flex-end",
    marginRight: 12,
  },
  wrapperThem: {
    alignSelf: "flex-start",
    marginLeft: 12,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
    marginHorizontal: 4,
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
    width: 220,
    height: 200,
    borderRadius: 14,
  },
  gifBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
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
