import { FontAwesome } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import SoundWave from "./SoundWave";

interface AudioPlayerProps {
  audioUrl: string;
  duration?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  duration = "0:30",
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [actualDuration, setActualDuration] = useState(duration);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [soundLoaded, setSoundLoaded] = useState(false);

  const durationToSeconds = (durationStr: string): number => {
    if (!durationStr) return 0;
    const parts = durationStr.split(":").map(Number);
    return parts[0] * 60 + (parts[1] || 0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const totalDuration = durationToSeconds(actualDuration);
  const progress = (playbackTime / totalDuration) * 100;

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
          allowsRecordingIOS: false,
        });
      } catch (error) {
        console.error("Failed to configure audio session:", error);
      }
    };

    setupAudio();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSound = async () => {
      if (!audioUrl) return;

      try {
        setIsLoading(true);
        if (soundRef.current) {
          try {
            const status = await soundRef.current.getStatusAsync();
            if (status?.isLoaded) {
              await soundRef.current.unloadAsync();
            }
          } catch (e) {
            console.log("Error unloading previous sound:", e);
          }
          soundRef.current = null;
        }

        setSoundLoaded(false);

        // Create and load new sound
        const soundObject = new Audio.Sound();
        await soundObject.loadAsync(
          { uri: audioUrl },
          {
            shouldPlay: false,
            progressUpdateIntervalMillis: 100,
            positionMillis: 0,
            volume: 1.0,
          }
        );

        // Get actual duration from loaded audio
        const status = await soundObject.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          const durationInSeconds = Math.floor(status.durationMillis / 1000);
          setActualDuration(formatTime(durationInSeconds));
        }

        // Set up status monitoring
        soundObject.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              if (mounted) {
                setPlaybackTime(0);
                setIsActive(false);

                if (intervalId) {
                  clearInterval(intervalId);
                  setIntervalId(null);
                }
              }
            }
          }
        });

        soundRef.current = soundObject;

        if (mounted) {
          setSoundLoaded(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading sound:", error);
        setSoundLoaded(false);
        setIsLoading(false);
      }
    };

    loadSound();

    return () => {
      mounted = false;

      if (soundRef.current) {
        (async () => {
          try {
            const status = await soundRef.current.getStatusAsync();
            if (status?.isLoaded) {
              if (status.isPlaying) {
                await soundRef.current.stopAsync();
              }
              await soundRef.current.unloadAsync();
            }
          } catch (e) {
            console.log("Error cleaning up sound:", e);
          }
        })();
      }

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [audioUrl]);

  const startPlayback = async () => {
    try {
      if (!soundRef.current || !soundLoaded) return;

      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) {
        try {
          await soundRef.current.loadAsync({ uri: audioUrl });

          const newStatus = await soundRef.current.getStatusAsync();
          if (newStatus.isLoaded && newStatus.durationMillis) {
            const durationInSeconds = Math.floor(
              newStatus.durationMillis / 1000
            );
            setActualDuration(formatTime(durationInSeconds));
          }
        } catch (e) {
          console.error("Failed to reload sound:", e);
          return;
        }
      }

      await soundRef.current.setPositionAsync(playbackTime * 1000);
      await soundRef.current.playAsync();

      const id = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= totalDuration) {
            clearInterval(id);
            setIntervalId(null);
            setIsActive(false);

            try {
              soundRef.current?.stopAsync();
            } catch (e) {}

            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      setIntervalId(id);
      setIsActive(true);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const pausePlayback = async () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    setIsActive(false);

    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
        }
      }
    } catch (error) {
      console.log("Warning during pause:", error);
    }
  };

  const handlePlayPause = async () => {
    if (isLoading) return;

    if (!soundLoaded && audioUrl) {
      setIsLoading(true);
      try {
        if (!soundRef.current) {
          const soundObject = new Audio.Sound();
          await soundObject.loadAsync({ uri: audioUrl });

          const status = await soundObject.getStatusAsync();
          if (status.isLoaded && status.durationMillis) {
            const durationInSeconds = Math.floor(status.durationMillis / 1000);
            setActualDuration(formatTime(durationInSeconds));
          }

          soundRef.current = soundObject;
        }
        setSoundLoaded(true);
        setIsLoading(false);
        startPlayback();
      } catch (error) {
        console.error("Error loading sound:", error);
        setIsLoading(false);
        return;
      }
    } else {
      if (!isActive) {
        startPlayback();
      } else {
        pausePlayback();
      }
    }
  };

  return (
    <View className="flex-row mb-3">
      {/* Left part of the player (waveform) */}
      <View className="w-[90%]">
        <View className="px-2">
          <SoundWave isActive={isActive} progress={progress} />
          <View className="flex-row justify-between mt-1">
            <Text className="text-xs text-gray-500">
              {formatTime(playbackTime)}
            </Text>
            <Text className="text-xs text-gray-500">{actualDuration}</Text>
          </View>
        </View>
      </View>

      {/* Right side buttons */}
      <View className="w-[14%] ml-0.5 items-center">
        <TouchableOpacity
          onPress={handlePlayPause}
          disabled={isLoading}
          className="items-center justify-center"
        >
          {isLoading ? (
            <Text className="text-gray-500 text-xs">...</Text>
          ) : (
            <FontAwesome
              name={isActive ? "pause" : "play"}
              size={32}
              color="#4ade80"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AudioPlayer;
