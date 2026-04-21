import { useEffect } from "react";
import { Alert } from "react-native";

export function UpdateChecker() {
  useEffect(() => {
    if (__DEV__) return;

    async function checkForUpdate() {
      try {
        // expo-updates je dostupan samo u production buildu
        const Updates = await import("expo-updates");
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            "Nova verzija dostupna",
            "Aplikacija će se restartovati da bi primijenila ažuriranje.",
            [{ text: "OK", onPress: () => Updates.reloadAsync() }]
          );
        }
      } catch (e) {
        // Tiho ignorisi u dev modu ili ako native modul nije dostupan
      }
    }

    checkForUpdate();
  }, []);

  return null;
}
