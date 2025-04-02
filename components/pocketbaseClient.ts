import PocketBase from "pocketbase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const pb = new PocketBase("https://fonybox.pockethost.io/");

const loadAuthData = async () => {
  try {
    const authData = await AsyncStorage.getItem("pocketbase_auth");
    if (authData) {
      const parsedData = JSON.parse(authData);
      pb.authStore.save(parsedData.token, parsedData.model);
      console.log("Auth data loaded from storage");
    }
  } catch (error) {
    console.error("Failed to load auth data:", error);
  }
};

pb.authStore.onChange((token, model) => {
  if (token && model) {
    AsyncStorage.setItem(
      "pocketbase_auth",
      JSON.stringify({
        token,
        model,
      })
    );
    console.log("Auth data saved to storage");
  } else {
    AsyncStorage.removeItem("pocketbase_auth");
    console.log("Auth data removed from storage");
  }
});

loadAuthData();
