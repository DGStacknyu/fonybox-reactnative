import { VoiceMessage } from "@/components/chats/VoiceMessage";
import { pb } from "@/components/pocketbaseClient";
import { useGlobalContext } from "@/lib/AuthContext";
import { getGroupChatDetails } from "@/lib/get-chat-data/get-group-chat";
import { pbFileUrl } from "@/lib/getData/GetVideos";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Cache to store loaded group data
const groupCache = new Map();

// Initial placeholder for group chats
const getPlaceholderGroup = (
  id: string,
  name = "Loading...",
  avatar = null
) => ({
  id,
  name: name || "Loading...",
  description: "",
  avatar: avatar || null,
  initial: (name?.charAt(0) || "G").toUpperCase(),
  color: getColorFromId(id),
  memberCount: 0,
  members: [],
  messages: [],
  isPlaceholder: true,
});

const getColorFromId = (id: string): string => {
  if (!id) return "#E3F5FF";

  const colors = ["#F0D3F7", "#E3F5FF", "#FFE8CC", "#D1F5D3", "#FFD6D6"];
  const sumChars = id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[sumChars % colors.length];
};

const formatDuration = (durationMillis: number): string => {
  if (isNaN(durationMillis) || durationMillis <= 0) return "0:00";

  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const GroupVoiceMessage = ({ message, setIsPlaying }: any) => {
  const isSent = message.isSent;

  return (
    <View
      className={`flex-row ${isSent ? "justify-end" : "justify-start"} py-1`}
    >
      <View className={`rounded-2xl px-3 max-w-[80%]`}>
        {!isSent && (
          <Text className="text-xs font-medium text-gray-600 mb-1">
            {message.sender?.name || "Unknown"}
          </Text>
        )}

        <VoiceMessage
          message={message}
          setIsPlaying={setIsPlaying}
          hideContainer
        />
      </View>
    </View>
  );
};

// Preload audio durations in background
const preloadAudioDurations = async (messages: any[]) => {
  const durations: Record<string, string> = {};

  const promises = messages.map(
    async (message: {
      audio_url: string;
      collectionId: string;
      id: string;
    }) => {
      if (message.audio_url) {
        try {
          const audioUrl = pbFileUrl(
            message.collectionId,
            message.id,
            message.audio_url
          );
          const soundObject = new Audio.Sound();
          await soundObject.loadAsync({ uri: audioUrl });
          const status = await soundObject.getStatusAsync();
          if (status.isLoaded && status.durationMillis) {
            durations[message.id] = formatDuration(status.durationMillis);
          }
          await soundObject.unloadAsync();
        } catch (error) {
          console.log("Error preloading audio duration:", error);
        }
      }
    }
  );

  await Promise.all(promises);
  return durations;
};

// Process messages with basic data first, duration loaded in background
const processMessages = (
  messages: any[],
  userId: any,
  audioDurations: Record<string, string> = {}
) => {
  return messages.map(
    (message: {
      id: string;
      type: any;
      content: any;
      audio_url: string;
      collectionId: string;
      created: string | number | Date;
      expand: { sender: { id: any; name: any } };
    }) => {
      return {
        id: message.id,
        type: message.type || "voice",
        content: message.content,
        audio_url: message.audio_url
          ? pbFileUrl(message.collectionId, message.id, message.audio_url)
          : null,
        created: message.created,
        isSent: message.expand?.sender?.id === userId,
        isPlaying: false,
        duration: audioDurations[message.id] || "0:00", // Use preloaded duration or default
        timestamp: new Date(message.created).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: {
          id: message.expand?.sender?.id || "unknown",
          name: message.expand?.sender?.name || "Unknown User",
        },
      };
    }
  );
};

// Add this to your app.js or root component to preload groups
export const preloadGroups = async (userId: any) => {
  try {
    // Fetch list of user's groups
    const userGroups = await pb.collection("group_members").getList(1, 20, {
      filter: `user="${userId}"`,
      expand: "group",
    });

    // Create placeholder entries for each group
    userGroups.items.forEach((membership) => {
      if (membership.expand?.group) {
        const group = membership.expand.group;
        const groupId = group.id;

        // Only create placeholder if not already in cache
        if (!groupCache.has(groupId)) {
          const placeholder = getPlaceholderGroup(
            groupId,
            group.name,
            pbFileUrl(group.collectionId, group.id, group.image)
          );
          groupCache.set(groupId, placeholder);
        }
      }
    });

    console.log(`Preloaded ${userGroups.items.length} group placeholders`);
  } catch (err) {
    console.error("Error preloading groups:", err);
  }
};

const GroupChatDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [groupDetails, setGroupDetails] = useState<any | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false); // Default to false
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useGlobalContext();
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingStartTime = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioDurationsRef = useRef({});

  // First render with cached data, placeholder, or quick initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!id) return;

      try {
        // Check if we have cached data
        if (groupCache.has(id)) {
          const cachedData = groupCache.get(id);
          setGroupDetails(cachedData);

          // If it's not a placeholder, we're good to go
          if (!cachedData.isPlaceholder) {
            // Still update in background for freshness
            loadFullData(false);
            return;
          }
        } else {
          // If no cache exists, create a placeholder immediately
          const placeholder = getPlaceholderGroup(id);
          setGroupDetails(placeholder);
          groupCache.set(id, placeholder);
        }

        // Try to get basic group data to update placeholder quickly
        try {
          // First try to get just the group info from local storage if available
          const groupInfoKey = `group_info_${id}`;
          const storedGroupInfo = await AsyncStorage.getItem(groupInfoKey);

          if (storedGroupInfo) {
            const groupInfo = JSON.parse(storedGroupInfo);
            const quickPlaceholder = getPlaceholderGroup(
              id,
              groupInfo.name,
              groupInfo.avatar
            );
            setGroupDetails(quickPlaceholder);
            groupCache.set(id, quickPlaceholder);
          }
        } catch (storageErr) {
          console.log("Could not get group info from storage:", storageErr);
        }

        // Quick initial load without audio durations
        const details = await getGroupChatDetails(id as string);

        // Process messages without waiting for audio durations
        const quickProcessedMessages = processMessages(
          details.messages || [],
          user.id
        );

        const initialDetails = {
          id: details.id,
          name: details.name || "Unnamed Group",
          description: details.description || "",
          avatar: pbFileUrl(details.collectionId, details.id, details.image),
          initial: (details.name?.charAt(0) || "G").toUpperCase(),
          color: getColorFromId(details.id),
          memberCount: details.members?.length || 0,
          members:
            details.members?.map((member) => ({
              id: member.id,
              name: member.expand?.user?.name || "Unknown User",
              isAdmin: member.role === "admin",
              color: getColorFromId(member.id),
              initial: (
                member.expand?.user?.name?.charAt(0) || "U"
              ).toUpperCase(),
              status: "Online",
            })) || [],
          messages: quickProcessedMessages,
          isPlaceholder: false,
        };

        // Save basic group info to AsyncStorage for future fast loads
        try {
          const groupInfoKey = `group_info_${id}`;
          const groupInfo = {
            name: initialDetails.name,
            avatar: initialDetails.avatar,
          };
          await AsyncStorage.setItem(groupInfoKey, JSON.stringify(groupInfo));
        } catch (storageErr) {
          console.log("Could not save group info to storage:", storageErr);
        }

        setGroupDetails(initialDetails);

        // Store in cache
        groupCache.set(id, initialDetails);

        // Load audio durations in background
        loadFullData(false);
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Failed to load group chat details");
      }
    };

    loadInitialData();
  }, [id]);

  const loadFullData = async (showLoading = true) => {
    if (!id) return;

    if (showLoading) {
      setIsUpdating(true);
    }

    try {
      const details = await getGroupChatDetails(id as string);

      const audioDurations = await preloadAudioDurations(
        details.messages || []
      );
      audioDurationsRef.current = audioDurations;

      const messagesWithDurations = processMessages(
        details.messages || [],
        user.id,
        audioDurations
      );

      const fullDetails = {
        id: details.id,
        name: details.name || "Unnamed Group",
        description: details.description || "",
        avatar: pbFileUrl(details.collectionId, details.id, details.image),
        initial: (details.name?.charAt(0) || "G").toUpperCase(),
        color: getColorFromId(details.id),
        memberCount: details.members?.length || 0,
        members:
          details.members?.map((member) => ({
            id: member.id,
            name: member.expand?.user?.name || "Unknown User",
            isAdmin: member.role === "admin",
            color: getColorFromId(member.id),
            initial: (
              member.expand?.user?.name?.charAt(0) || "U"
            ).toUpperCase(),
            status: "Online",
          })) || [],
        messages: messagesWithDurations,
      };

      setGroupDetails(fullDetails);

      // Update cache
      groupCache.set(id, fullDetails);
    } catch (err) {
      console.error("Error loading full data:", err);
      if (!groupDetails) {
        setError("Failed to load group chat details");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    Audio.requestPermissionsAsync().then(({ status }) => {
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Audio recording permission is required to use this feature"
        );
      }
    });

    // Audio session setup
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });

    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (groupDetails?.messages?.length > 0) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: false });
        }
      }, 100);
    }
  }, [groupDetails?.messages?.length]);

  useEffect(() => {
    if (isRecording) {
      recordingStartTime.current = Date.now();
      setRecordingDuration(0);

      durationIntervalRef.current = setInterval(() => {
        if (recordingStartTime.current) {
          const currentDuration = Math.floor(
            (Date.now() - recordingStartTime.current) / 1000
          );
          setRecordingDuration(currentDuration);
        }
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      recordingStartTime.current = Date.now();

      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    console.log("Recording stopped");

    const finalDuration = recordingStartTime.current
      ? Math.floor((Date.now() - recordingStartTime.current) / 1000)
      : 0;

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      console.log("Recording URI:", uri);

      if (uri) {
        uploadAudio(uri, finalDuration);
      } else {
        Alert.alert("Error", "Recording failed to save");
      }

      setRecording(null);
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Error", "Failed to complete recording");
      setRecording(null);
    }
  };

  const uploadAudio = async (fileUri: string, durationSeconds: number) => {
    if (!id || !user.id) {
      Alert.alert("Error", "Missing group ID or user ID");
      return;
    }

    setIsUploading(true);

    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      console.log("Uploading audio file:", fileUri);
      console.log("Group ID:", id, typeof id);
      console.log("User ID:", user.id, typeof user.id);

      try {
        const groupRecord = await pb.collection("groups").getOne(id);
        console.log("Group record found:", groupRecord.id);
      } catch (groupErr) {
        console.error("Error checking group:", groupErr);
        throw new Error(`Group with ID ${id} not found or inaccessible`);
      }

      const fileObject = {
        uri: fileUri,
        type: "audio/mpeg",
        name: `voice_${Date.now()}.m4a`,
      };

      console.log("File object:", JSON.stringify(fileObject));

      const formData = new FormData() as any;

      if (Platform.OS === "android") {
        const uriParts = fileUri.split("/");
        const fileName = `voice_${Date.now()}.m4a`;

        formData.append("audio_url", {
          uri: fileUri,
          name: fileName,
          type: "audio/mpeg",
        });
      } else {
        formData.append("audio_url", fileObject);
      }

      formData.append("group", id);
      formData.append("sender", user.id);
      formData.append("type", "voice");
      formData.append("metadata", JSON.stringify({ durationSeconds }));

      if (!pb.authStore.isValid) {
        console.log("Auth not valid, attempting to use token");
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          pb.authStore.save(token, null);
        }
      }

      if (!pb.authStore.isValid) {
        throw new Error("Authentication required. Please log in again.");
      }

      console.log("Auth status:", pb.authStore.isValid);
      console.log("Auth model:", pb.authStore.model);

      console.log("FormData content (approximate):", {
        audio_url:
          Platform.OS === "android"
            ? `voice_${Date.now()}.m4a`
            : fileObject.name,
        group: id,
        sender: user.id,
        type: "voice",
      });

      console.log("Uploading FormData to PocketBase");

      const record = await pb.collection("group_messages").create(formData);
      console.log("Message uploaded:", record);

      const formattedDuration = formatDuration(durationSeconds * 1000);

      const newMessage = {
        id: record.id,
        type: "voice",
        audio_url: pbFileUrl(record.collectionId, record.id, record.audio_url),
        created: record.created,
        isSent: true,
        isPlaying: false,
        duration: formattedDuration,
        timestamp: new Date(record.created).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: {
          id: user.id,
          name: user.name || "Me",
        },
      };

      setGroupDetails((prev: { messages: any }) => {
        const updatedDetails = {
          ...prev,
          messages: [...prev.messages, newMessage],
        };

        // Update cache
        groupCache.set(id, updatedDetails);

        return updatedDetails;
      });

      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (err: any) {
      console.error("Failed to upload audio:", err);

      if (err.response) {
        console.error("Error response:", JSON.stringify(err.response));
        Alert.alert(
          "Error",
          `Upload failed: ${JSON.stringify(err.response.data || err.message)}`
        );
      } else {
        Alert.alert("Error", `Failed to send voice message: ${err.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const setIsPlaying = (messageId: string, isPlaying: boolean) => {
    console.log(
      `Message ${messageId} is now ${isPlaying ? "playing" : "paused"}`
    );
    if (groupDetails) {
      const updatedMessages = groupDetails.messages.map((msg: { id: string }) =>
        msg.id === messageId
          ? { ...msg, isPlaying }
          : { ...msg, isPlaying: false }
      );

      const updatedDetails = {
        ...groupDetails,
        messages: updatedMessages,
      };

      setGroupDetails(updatedDetails);

      // Update cache
      groupCache.set(id, updatedDetails);
    }
  };

  const handleGroupInfoPress = () => {
    router.push(`/(GroupChat)/info/${id}`);
  };

  const handleRecordButtonPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // No loading screen - we always show content immediately

  if (error || !groupDetails) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>{error || "Group chat not found"}</Text>
        <TouchableOpacity
          className="mt-4 px-4 py-2 bg-[#F52936] rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <View
        className="flex-row items-center px-5 py-2.5 border-b border-[#EEEEEE]"
        style={{
          paddingTop:
            Platform.OS === "android"
              ? (StatusBar.currentHeight || 0) + 20
              : 10,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#637381" />
        </TouchableOpacity>

        <TouchableOpacity
          className="ml-4 flex-row items-center flex-1"
          onPress={handleGroupInfoPress}
        >
          <Image
            source={{ uri: groupDetails.avatar }}
            className="w-14 h-14 rounded-full"
          />
          <View className="ml-2.5">
            <Text className="text-lg font-medium">{groupDetails.name}</Text>
            <Text className="text-sm text-[#637381]">
              {groupDetails.memberCount} members
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="ml-2" onPress={handleGroupInfoPress}>
          <Ionicons
            name="information-circle-outline"
            size={30}
            color="#637381"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 pt-3"
        showsVerticalScrollIndicator={false}
      >
        {groupDetails.messages && groupDetails.messages.length > 0 ? (
          groupDetails.messages.map((message: { id: any }) => (
            <GroupVoiceMessage
              key={message.id}
              message={message}
              setIsPlaying={setIsPlaying}
            />
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-10">
            {groupDetails.isPlaceholder ? (
              <ActivityIndicator size="small" color="#F52936" />
            ) : (
              <Text className="text-gray-500">No messages yet</Text>
            )}
          </View>
        )}
        <View className="h-5" />
      </ScrollView>

      {isUpdating && (
        <View className="absolute right-5 top-20">
          <ActivityIndicator size="small" color="#F52936" />
        </View>
      )}

      <View className="py-2.5 pt-5 px-5 items-center bg-white border-t border-[#EEEEEE]">
        {isUploading ? (
          <View className="w-20 h-20 rounded-full bg-[#F52936] items-center justify-center shadow-md">
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <TouchableOpacity
            className={`w-20 h-20 rounded-full ${
              isRecording ? "bg-red-700" : "bg-[#F52936]"
            } items-center justify-center shadow-md`}
            onPress={handleRecordButtonPress}
            disabled={isUploading}
          >
            <Ionicons
              name={isRecording ? "stop" : "mic"}
              size={40}
              color="white"
            />
          </TouchableOpacity>
        )}
        {isRecording && (
          <View>
            <Text className="mt-2 text-center text-red-500">Recording...</Text>
            <Text className="text-center text-gray-600">
              {Math.floor(recordingDuration / 60)}:
              {(recordingDuration % 60).toString().padStart(2, "0")}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default GroupChatDetailScreen;
