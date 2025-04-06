import "@/global.css";
import GlobalProvider from "@/lib/AuthContext";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });
  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null;
  }

  if (!fontsLoaded && !error) {
    return null;
  }
  return (
    <GlobalProvider>
      <Toast />
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="/search/[query]"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="(chat)"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="notifications"
          options={{ headerShown: false }}
        ></Stack.Screen>{" "}
        <Stack.Screen
          name="interest"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="user-details"
          options={{ headerShown: false }}
        ></Stack.Screen>{" "}
        <Stack.Screen
          name="(GroupChat)"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="edit-profile"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="user-profile"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="follow-requests"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="(stats)/followers/[id]"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="(stats)/following/[id]"
          options={{ headerShown: false }}
        ></Stack.Screen>
      </Stack>
    </GlobalProvider>
  );
};

export default RootLayout;
