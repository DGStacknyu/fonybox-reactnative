import { Redirect, Tabs, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, Alert, Animated, Easing, Platform } from "react-native";
import { useEffect, useState, useRef } from "react";
import { Audio } from "expo-av";
import { TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system";
import { useGlobalContext } from "@/context/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { icons } from "../../constants";

const TabIcon = ({
  icon,
  iconName,
  color,
  name,
  focused,
  isCenter = false,
  onPress,
  isRecording,
  recordingDuration,
}: any) => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const timerAnim = useRef(new Animated.Value(0)).current;
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      startWaveAnimation();
      startPulseAnimation();
      startTimerAnimation();
    } else {
      waveAnim.setValue(0);
      pulseAnim.setValue(0);
      timerAnim.setValue(0);
      setSeconds(0);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      waveAnim.setValue(0);
      pulseAnim.setValue(0);
      timerAnim.setValue(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  const startWaveAnimation = () => {
    waveAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startPulseAnimation = () => {
    pulseAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startTimerAnimation = () => {
    timerAnim.setValue(0);
    Animated.loop(
      Animated.timing(timerAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (isCenter) {
    return (
      <View
        style={{ alignItems: "center", height: 80, justifyContent: "flex-end" }}
      >
        {isRecording && (
          <View
            style={{
              backgroundColor: "rgba(255, 90, 95, 0.15)",
              paddingVertical: 6,
              paddingHorizontal: 15,
              borderRadius: 20,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: "rgba(255, 90, 95, 0.3)",
              flexDirection: "row",
              alignItems: "center",
              elevation: 3,
              shadowColor: "#FF5A5F",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              width: 90,
            }}
          >
            <View
              style={{
                height: 8,
                width: 8,
                borderRadius: 4,
                backgroundColor: "#FF5A5F",
                marginRight: 8,
              }}
            />
            <Text style={{ color: "#FF5A5F", fontWeight: "700", fontSize: 16 }}>
              {formatTime(recordingDuration || seconds)}
            </Text>
          </View>
        )}

        <View
          style={{
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Wave animation */}
          {isRecording && (
            <>
              <Animated.View
                style={{
                  position: "absolute",
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  elevation: 8,
                  backgroundColor: "transparent",
                  borderWidth: 3,
                  borderColor: "rgba(255, 90, 95, 0.4)",
                  zIndex: -1,
                  opacity: waveAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 0.5, 0.2],
                  }),
                  transform: [
                    {
                      scale: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.8],
                      }),
                    },
                  ],
                }}
              />
              <Animated.View
                style={{
                  position: "absolute",
                  width: 160,
                  height: 160,
                  elevation: 8,
                  borderRadius: 80,
                  borderWidth: 6,
                  borderColor: "rgba(255, 90, 95, 0.25)",
                  zIndex: -1,
                  opacity: waveAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.7, 0.4, 0.1],
                  }),
                  transform: [
                    {
                      scale: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1.5],
                      }),
                    },
                  ],
                }}
              />
              <Animated.View
                style={{
                  position: "absolute",
                  width: 160,
                  elevation: 8,
                  height: 160,
                  borderRadius: 80,
                  borderWidth: 10,
                  borderColor: "rgba(255, 90, 95, 0.15)",
                  zIndex: -1,
                  opacity: waveAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.6, 0.3, 0.1],
                  }),
                  transform: [
                    {
                      scale: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.2],
                      }),
                    },
                  ],
                }}
              />
            </>
          )}

          {/* Main button */}
          <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <View
              style={{
                marginBottom: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "#FF5A5F",
                  elevation: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isRecording ? (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      backgroundColor: "#FFFFFF",
                    }}
                  />
                ) : (
                  <Ionicons name="mic" size={44} color="#FFFFFF" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        width: 70,
        height: 80,
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <Ionicons name={iconName || "help-circle"} size={32} color={color} />
    </View>
  );
};
const TabLayout = () => {
  const { loading, isLogged } = useGlobalContext();
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPermission, setRecordingPermission] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Request permissions on component mount
  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setRecordingPermission(status === "granted");
    };

    getPermissions();
  }, []);

  useEffect(() => {
    if (isRecording) {
      startTimeRef.current = Date.now() - recordingDuration * 1000;
      timerRef.current = setInterval(() => {
        const secondsElapsed = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
        setRecordingDuration(secondsElapsed);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (!isRecording) {
        setRecordingDuration(0);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const handleCenterTabPress = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      if (recordingPermission !== true) {
        Alert.alert(
          "Permission required",
          "Please grant microphone permissions to record audio."
        );
        return;
      }

      global.audioUri = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log("Starting recording...");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  // Stop recording

  const stopRecording = async () => {
    if (!recording) return;

    try {
      console.log("Stopping recording...");
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const uri = recording.getURI();
      console.log("Recording saved to:", uri);

      // Decode the URI properly
      const decodedUri = decodeURIComponent(uri);
      console.log("Decoded URI:", decodedUri);

      // Check if file exists and is accessible
      let fileExists = false;
      let retries = 0;
      const maxRetries = 5;

      while (!fileExists && retries < maxRetries) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(decodedUri);
          fileExists = fileInfo.exists;

          if (!fileExists) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            retries++;
          }
        } catch (error) {
          console.log(`File check attempt ${retries + 1} failed:`, error);
          await new Promise((resolve) => setTimeout(resolve, 300));
          retries++;
        }
      }

      if (!fileExists) {
        throw new Error("Audio file not accessible after recording");
      }

      // For Android, create a copy in a more reliable location
      let finalUri = decodedUri;
      if (Platform.OS === "android") {
        try {
          const fileName = decodedUri.split("/").pop();
          const newUri = `${FileSystem.cacheDirectory}${fileName}`;
          await FileSystem.copyAsync({
            from: decodedUri,
            to: newUri,
          });
          finalUri = newUri;
          console.log("File copied to:", finalUri);
        } catch (copyError) {
          console.warn("Failed to copy file, using original:", copyError);
        }
      }

      setRecording(null);
      setIsRecording(false);

      router.push({
        pathname: "/create",
        params: { audioUri: finalUri },
      });
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to save recording. Please try again.");
      setRecording(null);
      setIsRecording(false);
    }
  };

  if (!loading && !isLogged) return <Redirect href="/sign-in" />;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#333333",
          tabBarInactiveTintColor: "#AAAAAA",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#F0F0F0",
            height: 90,
            paddingHorizontal: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            position: "absolute",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="home"
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="search"
                color={color}
                name="Search"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Voice",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.plus}
                color={color}
                name="Voice"
                focused={focused}
                isCenter={true}
                onPress={handleCenterTabPress}
                isRecording={isRecording}
                recordingDuration={recordingDuration}
              />
            ),
            listeners: () => ({
              tabPress: (e: { preventDefault: () => void }) => {
                if (!isRecording) {
                  e.preventDefault();
                }
              },
            }),
          }}
        />
        <Tabs.Screen
          name="GroupChat"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="people"
                color={color}
                name="Chat"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="UserProfile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="person-circle-outline"
                color={color}
                name="Profile"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      <StatusBar backgroundColor="#FFFFFF" style="dark" />
    </>
  );
};

export default TabLayout;
