import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useGlobalContext } from "@/context/AuthContext";
import {
  likePost,
  savePost,
  unlikePost,
  unsavePost,
} from "@/lib/get-post-data/post-fucntions";

const SoundWave = ({ isActive, progress, isSent = false }: any) => {
  const generateWaveform = () => {
    const bars = [];
    const count = 30;

    for (let i = 0; i < count; i++) {
      const height = 5 + Math.random() * 15;
      bars.push(height);
    }
    return bars;
  };

  const waveform = useRef(generateWaveform()).current;
  const activeBarCount = Math.floor((progress / 100) * waveform.length);

  return (
    <View className="flex-row items-center justify-between h-6 w-full">
      {waveform.map((height, index) => {
        const isActiveBar = index < activeBarCount;
        return (
          <View
            key={index}
            style={{
              height: height,
              width: 2,
              backgroundColor: isActiveBar
                ? "#4ade80"
                : "rgba(102, 112, 133, 0.4)",
              borderRadius: 1,
              marginHorizontal: 0.5,
            }}
          />
        );
      })}
    </View>
  );
};

interface PostCardProps {
  post: {
    id: string;
    avatar: string;
    username: string;
    timeAgo: string;
    caption: string;
    imageUrl: string;
    audioUrl: string;
    duration: string;
    likes: number;
    shares: number;
    liked: boolean;
    isLiked: boolean;
    isSaved: boolean;
  };
  onOpenComments?: () => void;
  onPostUpdated?: () => void;
}

const PostCard = ({ post, onOpenComments, onPostUpdated }: PostCardProps) => {
  const { user } = useGlobalContext();
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [actualDuration, setActualDuration] = useState(post.duration || "0:30");
  const soundRef = useRef<Audio.Sound | null>(null);
  const [soundLoaded, setSoundLoaded] = useState(false);

  // Use post.isLiked as the initial state instead of post.liked
  const [isLiked, setIsLiked] = useState(post.isLiked || post.liked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const durationToSeconds = (durationStr: string) => {
    if (!durationStr) return 0;
    const parts = durationStr.split(":").map(Number);
    return parts[0] * 60 + (parts[1] || 0);
  };

  const formatTime = (seconds: number) => {
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
    setIsLiked(post.isLiked || post.liked || false);
    setLikeCount(post.likes);
    setIsSaved(post.isSaved);
  }, [post.isLiked, post.liked, post.likes, post.isSaved]);

  useEffect(() => {
    let mounted = true;

    const loadSound = async () => {
      if (!post.audioUrl) return;

      try {
        setIsLoading(true);
        if (soundRef.current) {
          try {
            const status = await soundRef.current.getStatusAsync();
            if (status?.isLoaded) {
              await soundRef.current.unloadAsync();
            }
          } catch (e) {}
          soundRef.current = null;
        }

        setSoundLoaded(false);

        const soundObject = new Audio.Sound();
        await soundObject.loadAsync(
          { uri: post.audioUrl },
          {
            shouldPlay: false,
            progressUpdateIntervalMillis: 100,
            positionMillis: 0,
            volume: 1.0,
          }
        );

        const status = await soundObject.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          const durationInSeconds = Math.floor(status.durationMillis / 1000);
          setActualDuration(formatTime(durationInSeconds));
        }

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
          } catch (e) {}
        })();
      }

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [post.audioUrl]);

  const animateLike = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLikePress = async () => {
    if (!user?.id || isLikeLoading) return;

    animateLike();
    setIsLikeLoading(true);
    const wasLiked = isLiked;

    try {
      setIsLiked(!wasLiked);
      setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1);

      // API call
      const { success } = wasLiked
        ? await unlikePost(post.id, user.id)
        : await likePost(post.id, user.id);

      if (!success) {
        // Revert if API call failed
        setIsLiked(wasLiked);
        setLikeCount(wasLiked ? likeCount : likeCount - 1);
      }

      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(wasLiked);
      setLikeCount(wasLiked ? likeCount : likeCount - 1);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleSavePress = async () => {
    if (!user?.id || isSaveLoading) return;

    setIsSaveLoading(true);
    const wasSaved = isSaved;

    try {
      setIsSaved(!wasSaved);

      // API call
      const { success } = wasSaved
        ? await unsavePost(post.id, user.id)
        : await savePost(post.id, user.id);

      if (!success) {
        setIsSaved(wasSaved);
      }

      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error toggling save:", error);
      setIsSaved(wasSaved);
    } finally {
      setIsSaveLoading(false);
    }
  };

  const startPlayback = async () => {
    try {
      if (!soundRef.current || !soundLoaded) return;

      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) {
        try {
          await soundRef.current.loadAsync({ uri: post.audioUrl });

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

    if (!soundLoaded && post.audioUrl) {
      setIsLoading(true);
      try {
        if (!soundRef.current) {
          const soundObject = new Audio.Sound();
          await soundObject.loadAsync({ uri: post.audioUrl });

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
    <View className="bg-white rounded-lg py-5">
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: post.avatar }}
          className="w-12 h-12 rounded-full bg-gray-200"
        />
        <View className="flex-1 ml-3">
          <Text className="font-medium text-base">{post.username}</Text>
          <Text className="text-xs text-gray-500">{post.timeAgo}</Text>
        </View>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={handleSavePress} disabled={isSaveLoading}>
            {isSaveLoading ? (
              <ActivityIndicator size="small" color="#F52936" />
            ) : (
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={isSaved ? "#F52936" : "#666"}
              />
            )}
          </TouchableOpacity>
          {/* <Feather name="more-horizontal" size={22} color="#666" /> */}
        </View>
      </View>

      {post.audioUrl && (
        <View className="flex-row mb-3">
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
      )}

      <View className="flex flex-row items-center mb-3">
        <Image
          source={{ uri: post.imageUrl }}
          className="h-60 w-[90%] rounded-lg bg-gray-200"
          resizeMode="cover"
        />
        <View className="w-[14%] h-60 justify-center items-center">
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={handleLikePress}
              disabled={isLikeLoading}
              className="items-center mb-8"
            >
              {isLikeLoading ? (
                <ActivityIndicator size="small" color="#F52936" />
              ) : (
                <>
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={32}
                    color={isLiked ? "#F52936" : "#666"}
                  />
                  <Text className="text-sm text-gray-700">{likeCount}</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View className="items-center">
            <FontAwesome name="share" size={32} color="#666" />
            <Text className="text-sm text-gray-700">{post.shares}</Text>
          </View>
        </View>
      </View>
      <Text className="mb-3 text-base w-[90%] px-1">{post.caption}</Text>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="w-[90%]" onPress={onOpenComments}>
          <View className="bg-gray-50 rounded-full py-3 px-4 flex-row items-center justify-between">
            <Text className="text-gray-700">See more answer</Text>
            <Feather name="chevron-down" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View className="bg-gray-50 rounded-full h-12 w-12 items-center justify-center p-2">
            <FontAwesome name="microphone" size={30} color="#4ade80" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCard;
