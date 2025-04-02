import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const VoiceMessage = ({ message, setIsPlaying }: any) => {
  const [isActive, setIsActive] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const durationToSeconds = (duration: string) => {
    const parts = duration.split(":").map(Number);
    return parts[0] * 60 + parts[1];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const totalDuration = durationToSeconds(message.duration);

  // Handle play/pause
  const handlePlayPause = () => {
    if (!isActive) {
      startPlayback();
    } else {
      pausePlayback();
    }
  };

  const startPlayback = () => {
    const id: any = setInterval(() => {
      setPlaybackTime((prev) => {
        if (prev >= totalDuration) {
          clearInterval(id);
          setIntervalId(null);
          setIsActive(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    setIntervalId(id);
    setIsActive(true);
    setIsPlaying(message.id, true);
  };

  const pausePlayback = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsActive(false);
    setIsPlaying(message.id, false);
  };

  const handleSeek = (event: GestureResponderEvent, containerWidth: number) => {
    const { locationX } = event.nativeEvent;

    const percentage = Math.min(Math.max(locationX / containerWidth, 0), 1);

    const newTime = percentage * totalDuration;

    setPlaybackTime(newTime);

    if (!isActive) {
      startPlayback();
    }
  };

  useEffect(() => {
    if (playbackTime >= totalDuration) {
      setPlaybackTime(0);
      setIsActive(false);
      setIsPlaying(message.id, false);

      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [playbackTime, totalDuration, message.id, intervalId]);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const generateWaveform = () => {
    const bars = [];
    const count = 20;

    for (let i = 0; i < count; i++) {
      const height = 10 + Math.random() * 15;
      bars.push(height);
    }
    return bars;
  };

  const waveform = generateWaveform();

  const progress = (playbackTime / totalDuration) * 100;

  const activeBarCount = Math.floor((progress / 100) * waveform.length);

  return (
    <View
      className={`mb-5 ${message.isSent ? "self-end" : "self-start"}`}
      style={{ width: SCREEN_WIDTH * 0.7 }}
    >
      <View
        className={`rounded-2xl p-4 w-full ${
          message.isSent ? "bg-[#F52936] shadow-sm" : "bg-white shadow-sm"
        }`}
        style={{ paddingBottom: isActive ? 14 : 16 }}
      >
        <View className="flex-row items-center w-full">
          <TouchableOpacity onPress={handlePlayPause} className="mr-3">
            <Ionicons
              name={isActive ? "pause" : "play"}
              size={24}
              color={message.isSent ? "#FFFFFF" : "#000000"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(event) => {
              const containerWidth = SCREEN_WIDTH * 0.7 - 70; // Approximate width minus play button
              handleSeek(event, containerWidth);
            }}
            className="flex-1 h-6 justify-center"
          >
            <View className="flex-row items-center justify-between h-full w-full">
              {waveform.map((height, index) => {
                const isActiveBar = index < activeBarCount;
                return (
                  <View
                    key={index}
                    style={{
                      height: height,
                      width: 3,
                      backgroundColor: isActiveBar
                        ? message.isSent
                          ? "#FFFFFF"
                          : "#667085"
                        : message.isSent
                        ? "rgba(255, 255, 255, 0.4)"
                        : "rgba(102, 112, 133, 0.4)",
                      borderRadius: 1,
                    }}
                  />
                );
              })}
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between mt-3">
          <Text
            className={`text-sm ${
              message.isSent ? "text-white" : "text-black"
            }`}
          >
            {formatTime(playbackTime)}
          </Text>
          <Text
            className={`text-sm ${
              message.isSent ? "text-white" : "text-black"
            }`}
          >
            {message.duration}
          </Text>
        </View>
      </View>

      <Text
        className={`text-sm text-[#637381] mt-1 ${
          message.isSent ? "self-end" : "self-start ml-1"
        }`}
      >
        {message.timestamp}
      </Text>
    </View>
  );
};
