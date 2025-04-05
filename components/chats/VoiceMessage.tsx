import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import {
  Dimensions,
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Audio } from "expo-av";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const VoiceMessage = ({ message, setIsPlaying, hideContainer }: any) => {
  const [isActive, setIsActive] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [soundLoaded, setSoundLoaded] = useState(false);
  const isMounted = useRef(true);

  // iOS-specific workaround for audio URL
  const getAudioUrl = () => {
    if (!message.audio_url) return null;

    // For iOS, ensure the URL uses https for remote URLs
    if (Platform.OS === "ios" && message.audio_url.startsWith("http:")) {
      return message.audio_url.replace("http:", "https:");
    }

    return message.audio_url;
  };

  const durationToSeconds = (duration: string) => {
    const parts = duration?.split(":")?.map(Number);
    return parts?.[0] * 60 + (parts?.[1] || 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const totalDuration = durationToSeconds(message.duration);

  useEffect(() => {
    let audioSessionConfigured = false;

    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          // iOS specific
          playsInSilentModeIOS: true,

          // Android specific
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,

          // General
          staysActiveInBackground: true,
          allowsRecordingIOS: false,
        });

        audioSessionConfigured = true;
        console.log("Audio session configured successfully");
      } catch (error) {
        console.error("Failed to configure audio session:", error);
      }
    };

    setupAudio();

    // Clean up on unmount
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load the sound on component mount
  useEffect(() => {
    let mounted = true;

    const loadSound = async () => {
      const audioUrl = getAudioUrl();
      if (!audioUrl) return;

      try {
        console.log(`Loading sound on ${Platform.OS}:`, audioUrl);

        // Clean up any existing sound first
        if (soundRef.current) {
          try {
            const status = soundRef.current
              ? await soundRef.current.getStatusAsync()
              : null;
            if (status?.isLoaded) {
              await soundRef.current.unloadAsync();
            }
          } catch (e) {
            // Ignore cleanup errors
          }
          soundRef.current = null;
        }

        setSoundLoaded(false);

        // For iOS, make sure we use the correct initializer
        const soundObject = new Audio.Sound();

        // Log before loading to help with debugging
        console.log(`Attempting to load audio on ${Platform.OS}:`, {
          uri: audioUrl,
        });

        // Load with detailed options
        await soundObject.loadAsync(
          { uri: audioUrl },
          {
            shouldPlay: false,
            progressUpdateIntervalMillis: 100,
            positionMillis: 0,
            androidImplementation: "MediaPlayer",
            // iOS sees volume as 0 to 1
            volume: Platform.OS === "ios" ? 1.0 : 1.0,
          }
        );

        console.log(`Audio loaded successfully on ${Platform.OS}`);

        // Set up status monitoring
        soundObject.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              console.log("Audio finished playing");
              if (mounted) {
                setPlaybackTime(0);
                setIsActive(false);
                setIsPlaying(message.id, false);

                if (intervalId) {
                  clearInterval(intervalId);
                  setIntervalId(null);
                }
              }
            }
          }
        });

        // Store reference and update state
        soundRef.current = soundObject;

        if (mounted) {
          setSoundLoaded(true);
          console.log(`Sound ready to play on ${Platform.OS}`);
        }
      } catch (error) {
        console.error(`Error loading sound on ${Platform.OS}:`, error);
        setSoundLoaded(false);
      }
    };

    loadSound();

    // Clean up sound on unmount
    return () => {
      mounted = false;

      if (soundRef.current) {
        (async () => {
          try {
            const status = await soundRef?.current?.getStatusAsync();
            if (status?.isLoaded) {
              if (status.isPlaying) {
                await soundRef.current?.stopAsync();
              }
              await soundRef.current?.unloadAsync();
            }
          } catch (e) {
            // Ignore cleanup errors
          }
        })();
      }

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [message.audio_url]);

  // Handle play/pause
  const handlePlayPause = async () => {
    if (!soundLoaded || !soundRef.current) {
      console.log("Sound not loaded yet, cannot play/pause");
      return;
    }

    if (!isActive) {
      startPlayback();
    } else {
      pausePlayback();
    }
  };

  const startPlayback = async () => {
    try {
      if (!soundRef.current || !soundLoaded) return;

      // Check sound status
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) {
        console.log("Sound not loaded, reloading...");
        const audioUrl = getAudioUrl();
        if (!audioUrl) return;

        try {
          await soundRef.current.loadAsync({ uri: audioUrl });
        } catch (e) {
          console.error("Failed to reload sound:", e);
          return;
        }
      }

      // Set position and play
      console.log(
        `Starting audio playback on ${Platform.OS} at position:`,
        playbackTime
      );

      // iOS specific: ensure the volume is set to maximum
      if (Platform.OS === "ios") {
        await soundRef.current.setVolumeAsync(1.0);
      }

      await soundRef.current.setPositionAsync(playbackTime * 1000);
      await soundRef.current.playAsync();

      console.log(`Audio playback started on ${Platform.OS}`);

      // Update UI with timer
      const id: any = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= totalDuration) {
            clearInterval(id);
            setIntervalId(null);
            setIsActive(false);

            // Stop audio if it hasn't automatically stopped
            try {
              soundRef.current?.stopAsync();
            } catch (e) {
              // Ignore errors
            }

            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      setIntervalId(id);
      setIsActive(true);
      setIsPlaying(message.id, true);
    } catch (error) {
      console.error(`Error playing sound on ${Platform.OS}:`, error);
    }
  };

  const pausePlayback = async () => {
    // First, update UI state immediately for better responsiveness
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    setIsActive(false);
    setIsPlaying(message.id, false);

    // Then try to pause audio if possible
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          console.log(`Audio paused on ${Platform.OS}`);
        }
      }
    } catch (error) {
      console.log(`Warning during pause on ${Platform.OS}:`, error);
    }
  };

  const handleSeek = async (
    event: GestureResponderEvent,
    containerWidth: number
  ) => {
    const { locationX } = event.nativeEvent;
    const percentage = Math.min(Math.max(locationX / containerWidth, 0), 1);
    const newTime = percentage * totalDuration;

    // Update UI first for responsiveness
    setPlaybackTime(newTime);

    // Try to seek in the audio file
    try {
      if (soundRef.current && soundLoaded) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          console.log(`Seeking to ${newTime} seconds on ${Platform.OS}`);
          await soundRef.current.setPositionAsync(newTime * 1000);

          if (!isActive) {
            startPlayback();
          }
        }
      }
    } catch (error) {
      console.log(`Warning during seek on ${Platform.OS}:`, error);
    }
  };

  // Handle end of playback
  useEffect(() => {
    if (playbackTime >= totalDuration) {
      setPlaybackTime(0);
      setIsActive(false);
      setIsPlaying(message.id, false);

      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

      // Try to stop audio if still playing
      try {
        if (soundRef.current) {
          const checkAndStopSound = async () => {
            const status = await soundRef.current?.getStatusAsync();
            if (status?.isLoaded && status.isPlaying) {
              await soundRef.current?.stopAsync();
            }
          };
          checkAndStopSound();
        }
      } catch (e) {
        // Ignore errors
      }
    }
  }, [playbackTime, totalDuration, message.id, intervalId]);

  // Generate the waveform
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
