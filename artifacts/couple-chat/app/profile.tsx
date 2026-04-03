import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useApp } from "@/context/AppContext";
import { MoodPicker } from "@/components/MoodPicker";
import { THEME_META, ThemeName } from "@/constants/themes";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeTheme, setTheme, isFullscreen, toggleFullscreen, palette } = useTheme();
  const {
    currentUser,
    partner,
    updateMood,
    updateAvatar,
    clearMessages,
    giphyApiKey,
    firebaseConfig,
    updateFirebaseConfig,
    updateGiphyKey,
  } = useApp();

  const [moodPickerVisible, setMoodPickerVisible] = useState(false);
  const [showFirebaseForm, setShowFirebaseForm] = useState(false);
  const [showGiphyForm, setShowGiphyForm] = useState(false);
  const [giphyDraft, setGiphyDraft] = useState(giphyApiKey);
  const [fbDraft, setFbDraft] = useState<Record<string, string>>({
    apiKey: firebaseConfig.apiKey || "",
    projectId: firebaseConfig.projectId || "",
    appId: firebaseConfig.appId || "",
    messagingSenderId: firebaseConfig.messagingSenderId || "",
    storageBucket: firebaseConfig.storageBucket || "",
  });

  const topPad = isFullscreen
    ? 10
    : insets.top + (Platform.OS === "web" ? 67 : 0);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Dozvola odbijena", "Potrebna je dozvola za pristup galeriji.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0].base64) {
      await updateAvatar(result.assets[0].base64);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleClearMessages = () => {
    Alert.alert("Obriši poruke", "Jesi li siguran/na da želiš obrisati sve poruke?", [
      { text: "Odustani", style: "cancel" },
      {
        text: "Obriši",
        style: "destructive",
        onPress: async () => {
          await clearMessages();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  const handleSaveFirebase = async () => {
    await updateFirebaseConfig(fbDraft);
    setShowFirebaseForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Sačuvano", "Firebase konfiguracija je uspješno sačuvana!");
  };

  const handleSaveGiphy = async () => {
    await updateGiphyKey(giphyDraft);
    setShowGiphyForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSelectTheme = async (name: ThemeName) => {
    await setTheme(name);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const avatarUri = currentUser.avatarBase64
    ? `data:image/jpeg;base64,${currentUser.avatarBase64}`
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: palette.headerBg, paddingTop: topPad },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Profil & Postavke
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* My Profile Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            MOJ PROFIL
          </Text>
          <View style={styles.profileRow}>
            <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View
                  style={[styles.avatarPlaceholder, { backgroundColor: colors.secondary }]}
                >
                  <Text style={styles.avatarEmoji}>{currentUser.mood}</Text>
                </View>
              )}
              <View style={[styles.cameraOverlay, { backgroundColor: colors.primary }]}>
                <Feather name="camera" size={13} color={colors.primaryForeground} />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>
                {currentUser.name}
              </Text>
              <Text style={[styles.profileSub, { color: colors.mutedForeground }]}>
                Moj profil
              </Text>
              <TouchableOpacity
                onPress={() => setMoodPickerVisible(true)}
                style={[styles.moodChip, { backgroundColor: colors.secondary }]}
              >
                <Text style={{ fontSize: 18 }}>{currentUser.mood}</Text>
                <Text style={[styles.moodChipText, { color: colors.primary }]}>
                  Promijeni raspoloženje
                </Text>
                <Feather name="chevron-right" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Partner Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            PARTNER
          </Text>
          <View style={styles.profileRow}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.secondary }]}>
              <Text style={styles.avatarEmoji}>{partner.mood}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>
                {partner.name}
              </Text>
              <View style={[styles.moodChip, { backgroundColor: colors.muted }]}>
                <Text style={{ fontSize: 22 }}>{partner.mood}</Text>
                <Text style={[styles.moodChipText, { color: colors.mutedForeground }]}>
                  Trenutno raspoloženje
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* === THEMES === */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            TEMA APLIKACIJE
          </Text>
          <View style={styles.themesGrid}>
            {THEME_META.map((meta) => {
              const isActive = activeTheme === meta.name;
              return (
                <TouchableOpacity
                  key={meta.name}
                  onPress={() => handleSelectTheme(meta.name)}
                  style={[
                    styles.themeCard,
                    {
                      borderColor: isActive ? colors.primary : colors.border,
                      backgroundColor: meta.preview[0],
                      borderWidth: isActive ? 2.5 : 1.5,
                    },
                  ]}
                >
                  {/* Color dots preview */}
                  <View style={styles.themeDotsRow}>
                    {meta.preview.map((col, i) => (
                      <View
                        key={i}
                        style={[styles.themeDot, { backgroundColor: col }]}
                      />
                    ))}
                  </View>
                  <Text style={styles.themeEmoji}>{meta.emoji}</Text>
                  <Text style={[styles.themeLabel, { color: "#fff" }]} numberOfLines={2}>
                    {meta.label}
                  </Text>
                  {isActive && (
                    <View
                      style={[styles.themeCheck, { backgroundColor: colors.primary }]}
                    >
                      <Feather name="check" size={12} color={colors.primaryForeground} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* === FULLSCREEN === */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            PRIKAZ
          </Text>
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: colors.accent + "22" }]}
              >
                <Feather name="maximize" size={18} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                  Fullscreen mode
                </Text>
                <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>
                  Sakrij statusnu traku (sat, mreža)
                </Text>
              </View>
            </View>
            <Switch
              value={isFullscreen}
              onValueChange={() => {
                toggleFullscreen();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isFullscreen ? colors.primaryForeground : colors.mutedForeground}
            />
          </View>
        </View>

        {/* Firebase Config */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.settingRowBtn}
            onPress={() => setShowFirebaseForm(!showFirebaseForm)}
          >
            <View style={styles.switchLeft}>
              <View style={[styles.settingIcon, { backgroundColor: "#FF8C0022" }]}>
                <Feather name="database" size={18} color="#FF8C00" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                  Firebase konfiguracija
                </Text>
                <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>
                  {firebaseConfig.projectId
                    ? `Projekt: ${firebaseConfig.projectId}`
                    : "Nije postavljeno"}
                </Text>
              </View>
            </View>
            <Feather
              name={showFirebaseForm ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>

          {showFirebaseForm && (
            <View style={[styles.formContainer, { borderTopColor: colors.border }]}>
              {Object.keys(fbDraft).map((key) => (
                <View key={key} style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                    {key}
                  </Text>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      {
                        backgroundColor: colors.muted,
                        color: colors.foreground,
                        borderColor: colors.border,
                      },
                    ]}
                    value={fbDraft[key]}
                    onChangeText={(val) =>
                      setFbDraft((prev) => ({ ...prev, [key]: val }))
                    }
                    placeholder={`Unesi ${key}`}
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              ))}
              <TouchableOpacity
                onPress={handleSaveFirebase}
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
                  Sačuvaj Firebase
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Giphy Key */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.settingRowBtn}
            onPress={() => setShowGiphyForm(!showGiphyForm)}
          >
            <View style={styles.switchLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + "22" }]}>
                <Text style={{ fontSize: 17 }}>🎭</Text>
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                  Giphy API ključ
                </Text>
                <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>
                  {giphyApiKey ? "Postavljeno ✓" : "Nije postavljeno"}
                </Text>
              </View>
            </View>
            <Feather
              name={showGiphyForm ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>

          {showGiphyForm && (
            <View style={[styles.formContainer, { borderTopColor: colors.border }]}>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: colors.muted,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                value={giphyDraft}
                onChangeText={setGiphyDraft}
                placeholder="Unesi Giphy API ključ"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={handleSaveGiphy}
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
                  Sačuvaj Giphy ključ
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Danger */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            OPASNA ZONA
          </Text>
          <TouchableOpacity
            onPress={handleClearMessages}
            style={[styles.dangerBtn, { borderColor: colors.destructive }]}
          >
            <Feather name="trash-2" size={18} color={colors.destructive} />
            <Text style={[styles.dangerBtnText, { color: colors.destructive }]}>
              Obriši sve poruke
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    paddingHorizontal: 16,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  content: {
    padding: 14,
    gap: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  avatarContainer: { position: "relative" },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 34 },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: { flex: 1, gap: 6 },
  profileName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  profileSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  moodChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  /* Themes */
  themesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  themeCard: {
    width: "30%",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    position: "relative",
    minHeight: 90,
    justifyContent: "center",
    gap: 4,
  },
  themeDotsRow: {
    flexDirection: "row",
    gap: 3,
    marginBottom: 2,
  },
  themeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  themeEmoji: { fontSize: 20 },
  themeLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    lineHeight: 13,
  },
  themeCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Switch row */
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  settingDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  settingRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  /* Firebase/Giphy forms */
  formContainer: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    gap: 10,
  },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  fieldInput: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  /* Danger */
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 14,
  },
  dangerBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
