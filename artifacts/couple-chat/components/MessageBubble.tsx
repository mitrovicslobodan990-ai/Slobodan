import React, { useState } from "react";
import {
  Image,
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

function Avatar({
  user,
  size = 32,
}: {
  user: UserProfile;
  size?: number;
}) {
  const colors = useColors();
  const uri = user.avatarBase64
    ? `data:image/jpeg;base64,${user.avatarBase64}`
    : null;

  return uri ? (
    <Image
      source={{ uri }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: colors.border,
      }}
    />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.secondary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: colors.border,
      }}
    >
      <Text style={{ fontSize: size * 0.55 }}>{user.mood}</Text>
    </View>
  );
}

export function MessageBubble({ message, isMe, currentUser, partner }: MessageBubbleProps) {
  const colors = useColors();
  const [photoVisible, setPhotoVisible] = useState(false);

  const bubbleBg = isMe ? colors.myBubble : colors.theirBubble;
  const bubbleTextColor = isMe ? colors.myBubbleText : colors.theirBubbleText;
  const sender = isMe ? currentUser : partner;

  if (message.type === "poke") {
    return (
      <View style={styles.pokeContainer}>
        <View
          style={[
            styles.pokeBubble,
            {
              backgroundColor: colors.secondary,
              borderColor: colors.primary,
            },
          ]}
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
    <View
      style={[
        styles.row,
        isMe ? styles.rowMe : styles.rowThem,
      ]}
    >
      {!isMe && (
        <View style={styles.avatarWrap}>
          <Avatar user={sender} size={30} />
        </View>
      )}

      <View style={[styles.bubbleWrap, isMe ? styles.bubbleWrapMe : styles.bubbleWrapThem]}>
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
            <Text
              style={[
                styles.timestamp,
                {
                  color: colors.mutedForeground,
                  textAlign: isMe ? "right" : "left",
                },
              ]}
            >
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
            <View
              style={[
                styles.imageBubble,
                { borderColor: isMe ? colors.myBubble : colors.border },
              ]}
            >
              <Image
                source={{ uri: message.gifUrl }}
                style={styles.messageImage}
                resizeMode="cover"
              />
              <View style={styles.gifBadge}>
                <Text style={styles.gifBadgeText}>GIF</Text>
              </View>
            </View>
            <Text
              style={[
                styles.timestamp,
                {
                  color: colors.mutedForeground,
                  textAlign: isMe ? "right" : "left",
                },
              ]}
            >
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
            <Text
              style={[
                styles.timestamp,
                {
                  color: colors.mutedForeground,
                  textAlign: isMe ? "right" : "left",
                },
              ]}
            >
              {formatTime(message.timestamp)}
            </Text>
          </View>
        )}
      </View>

      {isMe && (
        <View style={styles.avatarWrap}>
          <Avatar user={sender} size={30} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  rowMe: {
    justifyContent: "flex-end",
  },
  rowThem: {
    justifyContent: "flex-start",
  },
  avatarWrap: {
    marginHorizontal: 6,
    marginBottom: 18,
  },
  bubbleWrap: {
    maxWidth: "72%",
  },
  bubbleWrapMe: {},
  bubbleWrapThem: {},
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
  timestamp: {
    fontSize: 10,
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
