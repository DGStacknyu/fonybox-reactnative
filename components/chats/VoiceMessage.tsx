import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import {
  Dimensions,
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { Audio } from "expo-av";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const VoiceMessage = ({ message, setIsPlaying, hideContainer }: any) => {
  const [isActive, setIsActive] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [soundLoaded, setSoundLoaded] = useState(false);
  const [displayDuration, setDisplayDuration] = useState("0:00");
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(0);
  const isMounted = useRef(true);

  // Safely parse duration string or get it from the sound object
  const durationToSeconds = (durationStr: string) => {
    if (!durationStr) return 0;
    try {
      const parts = durationStr.split(":").map(Number);
      return parts[0] * 60 + (parts[1] || 0);
    } catch (error) {
      console.warn("Error parsing duration string:", error);
      return 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  // Safe URL getter with additional Android URL validation
  const getAudioUrl = () => {
    if (!message.audio_url) {
      console.log("No audio URL provided in message");
      return null;
    }

    let url = message.audio_url;
    console.log(`Original URL: ${url}`);

    // Handle http to https conversion for iOS
    if (Platform.OS === "ios" && url.startsWith("http:")) {
      url = url.replace("http:", "https:");
    }

    // For Android, ensure the URL is properly formatted
    if (Platform.OS === "android") {
      // Remove any unwanted characters that might cause issues on Android
      url = url.trim();

      // Ensure the URL uses https for Android as well (many Android versions require it)
      if (url.startsWith("http:")) {
        url = url.replace("http:", "https:");
      }
    }

    console.log(`Processed URL: ${url}`);
    return url;
  };

  // Set up audio session with proper permissions handling for Android
  useEffect(() => {
    let audioSessionConfigured = false;

    const setupAudio = async () => {
      try {
        // For Android, request audio permissions explicitly
        if (Platform.OS === "android") {
          try {
            const permissions = [
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            ];

            // Request permissions if available (depends on Android version)
            const granted = await PermissionsAndroid.requestMultiple(
              permissions
            );
            console.log("Android permissions result:", granted);
          } catch (err) {
            console.warn(
              "Android permissions error (may be normal on newer Android):",
              err
            );
          }
        }

        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
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
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (message.duration) {
      const seconds = durationToSeconds(message.duration);
      setTotalDurationSeconds(seconds);
      setDisplayDuration(message.duration);
      console.log(
        `Initial duration set from message: ${message.duration} (${seconds}s)`
      );
    } else {
      // Set a default if no duration provided
      setDisplayDuration("0:00");
      setTotalDurationSeconds(0);
      console.log("No duration provided in message, using default");
    }
  }, [message.duration]);

  useEffect(() => {
    let mounted = true;

    const loadSound = async () => {
      const audioUrl = getAudioUrl();
      if (!audioUrl) {
        console.error("Cannot load sound: No valid audio URL");
        return;
      }

      try {
        console.log(`Loading sound on ${Platform.OS}:`, audioUrl);

        if (soundRef.current) {
          try {
            const status = soundRef.current
              ? await soundRef.current.getStatusAsync()
              : null;
            if (status?.isLoaded) {
              await soundRef.current.unloadAsync();
            }
          } catch (e) {
            console.warn("Error unloading previous sound:", e);
          }
          soundRef.current = null;
        }

        setSoundLoaded(false);

        const soundObject = new Audio.Sound();

        // Add more detailed error handler
        soundObject.setOnPlaybackStatusUpdate((status) => {
          if (!mounted) return;

          if (status.isLoaded) {
            // Update duration from the sound if available and not set
            if (status.durationMillis && totalDurationSeconds === 0) {
              const durationSecs = status.durationMillis / 1000;
              setTotalDurationSeconds(durationSecs);
              setDisplayDuration(formatTime(durationSecs));
              console.log(
                `Duration updated from sound: ${formatTime(durationSecs)}`
              );
            }

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
          } else if (status.error) {
            // Handle playback errors
            console.error(`Playback error: ${status.error}`);
          }
        });

        // Log all steps for debugging
        console.log(
          `Attempting to load audio on ${Platform.OS} with options:`,
          {
            uri: audioUrl,
            options: {
              shouldPlay: false,
              progressUpdateIntervalMillis: 100,
              positionMillis: 0,
              androidImplementation: "MediaPlayer",
              volume: 1.0,
            },
          }
        );

        // Load with detailed options and more robust error handling
        try {
          await soundObject.loadAsync(
            { uri: audioUrl },
            {
              shouldPlay: false,
              progressUpdateIntervalMillis: 100,
              positionMillis: 0,
              androidImplementation: "MediaPlayer",
              volume: 1.0,
            }
          );

          // Get status to check duration
          const status = await soundObject.getStatusAsync();
          if (status.isLoaded && status.durationMillis) {
            const durationSecs = status.durationMillis / 1000;
            setTotalDurationSeconds(durationSecs);
            setDisplayDuration(formatTime(durationSecs));
            console.log(
              `Duration from loaded sound: ${formatTime(durationSecs)}`
            );
          } else {
            console.log("Sound loaded but duration not available in status");
          }

          console.log(`Audio loaded successfully on ${Platform.OS}`);
          soundRef.current = soundObject;

          if (mounted) {
            setSoundLoaded(true);
            console.log(`Sound ready to play on ${Platform.OS}`);
          }
        } catch (loadError) {
          console.error(
            `Specific error loading sound on ${Platform.OS}:`,
            loadError
          );

          // Try an alternative approach for Android if initial load fails
          if (Platform.OS === "android") {
            console.log("Trying alternative loading method for Android...");
            try {
              await soundObject.loadAsync(
                { uri: audioUrl },
                {
                  shouldPlay: false,
                  androidImplementation: "SimpleExoPlayer", // Try ExoPlayer instead
                }
              );

              console.log("Alternative loading method succeeded");
              soundRef.current = soundObject;

              if (mounted) {
                setSoundLoaded(true);
              }
            } catch (altError) {
              console.error(
                "Alternative loading method also failed:",
                altError
              );
            }
          }
        }
      } catch (error) {
        console.error(
          `Error in sound loading process on ${Platform.OS}:`,
          error
        );
        setSoundLoaded(false);
      }
    };

    loadSound();

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
            console.warn("Error cleaning up sound:", e);
          }
        })();
      }

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [message.audio_url]);

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
      if (!soundRef.current || !soundLoaded) {
        console.log("Cannot start playback: Sound not loaded");
        return;
      }

      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) {
        console.log("Sound not loaded, reloading...");
        const audioUrl = getAudioUrl();
        if (!audioUrl) return;

        try {
          await soundRef.current.loadAsync({ uri: audioUrl });
          // Check loading success
          const newStatus = await soundRef.current.getStatusAsync();
          if (!newStatus.isLoaded) {
            console.error("Failed to reload sound");
            return;
          }
        } catch (e) {
          console.error("Failed to reload sound:", e);
          return;
        }
      }

      console.log(
        `Starting audio playback on ${Platform.OS} at position:`,
        playbackTime
      );

      // Set volume for both platforms
      await soundRef.current.setVolumeAsync(1.0);

      await soundRef.current.setPositionAsync(playbackTime * 1000);

      if (Platform.OS === "android") {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await soundRef.current.playAsync();

      console.log(`Audio playback started on ${Platform.OS}`);

      const id: any = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= totalDurationSeconds) {
            clearInterval(id);
            setIntervalId(null);
            setIsActive(false);
            try {
              soundRef.current?.stopAsync();
            } catch (e) {
              console.warn("Error stopping sound:", e);
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
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsActive(false);
    setIsPlaying(message.id, false);
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
    const newTime = percentage * totalDurationSeconds;

    setPlaybackTime(newTime);

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

  useEffect(() => {
    if (playbackTime >= totalDurationSeconds && totalDurationSeconds > 0) {
      setPlaybackTime(0);
      setIsActive(false);
      setIsPlaying(message.id, false);

      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

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
        console.warn("Error stopping sound at end:", e);
      }
    }
  }, [playbackTime, totalDurationSeconds, message.id, intervalId]);

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

  const progress =
    totalDurationSeconds > 0 ? (playbackTime / totalDurationSeconds) * 100 : 0;

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
              const containerWidth = SCREEN_WIDTH * 0.7 - 70;
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
            {displayDuration}
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
