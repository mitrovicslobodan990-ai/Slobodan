import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface GifResult {
  id: string;
  url: string;
  preview: string;
  title: string;
}

interface GifPickerProps {
  visible: boolean;
  onSelect: (gif: GifResult) => void;
  onClose: () => void;
  apiKey: string;
}

export function GifPicker({ visible, onSelect, onClose, apiKey }: GifPickerProps) {
  const colors = useColors();
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchGifs = useCallback(async (query: string) => {
    if (!apiKey) {
      console.warn("Giphy API key not set");
      return;
    }
    
    setLoading(true);
    setSearched(true);
    try {
      const endpoint = query.trim()
        ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`;

      const res = await fetch(endpoint);
      const data = await res.json();
      
      // Transform Giphy response to our format
      const gifs = (data.data || []).map((g: any) => ({
        id: g.id,
        url: g.images.fixed_height.url,
        preview: g.images.fixed_height.url,
        title: g.title || g.slug,
      }));
      
      setGifs(gifs);
    } catch (e) {
      console.warn("GIF search error:", e);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  React.useEffect(() => {
    if (visible && !searched) {
      searchGifs("");
    }
  }, [visible, searched, searchGifs]);

  const handleClose = () => {
    setSearched(false);
    setSearch("");
    setGifs([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Feather name="x" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Odaberi GIF
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.muted }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Pretraži GIF-ove..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => searchGifs(search)}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(""); searchGifs(""); }}>
              <Feather name="x-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={gifs}
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.gifItem, { backgroundColor: colors.muted }]}
                onPress={() => {
                  onSelect(item);
                  handleClose();
                }}
              >
                <Image
                  source={{ uri: item.preview }}
                  style={styles.gifImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Nema rezultata
              </Text>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  grid: {
    padding: 8,
  },
  gifItem: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 1,
  },
  gifImage: {
    width: "100%",
    height: "100%",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  noKeyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  noKeyText: {
    textAlign: "center",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
});
