import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

export const PrivateVoiceMessage = ({ message, setIsPlaying }: any) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const playbackPositionRef = useRef(0);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [sound]);

  const loadSound = async () => {
    if (!message.audio_url) return;

    try {
      setIsLoadingAudio(true);

      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: message.audio_url },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsLoadingAudio(false);
    } catch (error) {
      console.error("Error loading sound:", error);
      setIsLoadingAudio(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis || 0);
      playbackPositionRef.current = status.positionMillis;

      if (status.didJustFinish) {
        stopSound();
      }
    }
  };

  const startUpdateInterval = () => {
    updateIntervalRef.current = setInterval(() => {
      setPlaybackPosition(playbackPositionRef.current);
    }, 100);
  };

  const stopUpdateInterval = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  const playSound = async () => {
    try {
      if (!sound) {
        await loadSound();
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      await sound?.playAsync();
      setIsPlaying(message.id, true);
      startUpdateInterval();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const pauseSound = async () => {
    try {
      await sound?.pauseAsync();
      setIsPlaying(message.id, false);
      stopUpdateInterval();
    } catch (error) {
      console.error("Error pausing sound:", error);
    }
  };

  const stopSound = async () => {
    try {
      await sound?.stopAsync();
      await sound?.setPositionAsync(0);
      setPlaybackPosition(0);
      setIsPlaying(message.id, false);
      stopUpdateInterval();
    } catch (error) {
      console.error("Error stopping sound:", error);
    }
  };

  const handlePlayPause = () => {
    if (message.isPlaying) {
      pauseSound();
    } else {
      playSound();
    }
  };

  // Calculate progress percentage
  const progress = playbackDuration
    ? (playbackPosition / playbackDuration) * 100
    : 0;

  // Format time display
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const currentTime = formatTime(playbackPosition);
  const displayDuration = message.duration || "0:00";

  return (
    <View
      className={`px-3 py-2 my-1 max-w-[80%] rounded-xl ${
        message.isSent
          ? "bg-[#F52936] self-end mr-3"
          : "bg-gray-100 self-start ml-3"
      }`}
    >
      {!message.isSent && (
        <Text className="text-xs text-gray-500 mb-1">
          {message.sender.name}
        </Text>
      )}

      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handlePlayPause}
          disabled={isLoadingAudio}
          className="mr-2"
        >
          {isLoadingAudio ? (
            <View className="w-8 h-8 items-center justify-center">
              <Text>...</Text>
            </View>
          ) : (
            <Ionicons
              name={message.isPlaying ? "pause" : "play"}
              size={24}
              color={message.isSent ? "white" : "#F52936"}
            />
          )}
        </TouchableOpacity>

        <View className="flex-1">
          <View
            className="h-1 rounded-full overflow-hidden bg-opacity-30"
            style={{
              backgroundColor: message.isSent
                ? "rgba(255,255,255,0.3)"
                : "rgba(245,41,54,0.3)",
            }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: message.isSent ? "white" : "#F52936",
              }}
            />
          </View>

          <View className="flex-row justify-between mt-1">
            <Text
              className={`text-xs ${
                message.isSent ? "text-white" : "text-gray-600"
              }`}
            >
              {message.isPlaying ? currentTime : displayDuration}
            </Text>
            <Text
              className={`text-xs ${
                message.isSent ? "text-white text-opacity-80" : "text-gray-500"
              }`}
            >
              {message.timestamp}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
