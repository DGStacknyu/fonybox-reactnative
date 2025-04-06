// File: components/GroupChat/useRecording.ts
import { useState, useRef, useEffect, RefObject } from "react";
import { Alert, Platform, ScrollView } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { pb } from "@/components/pocketbaseClient";
import { pbFileUrl } from "@/lib/getData/GetVideos";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatDuration } from "@/utils/audio/audioHelpers";
import { groupCache } from "@/utils/audio/groupChatHelpers";

export const useRecording = (
  groupId: string | Blob,
  userId: string | Blob,
  setGroupDetails: { (value: any): void; (arg0: (prev: any) => any): void },
  scrollViewRef: RefObject<ScrollView>
) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingStartTime = useRef(null);
  const durationIntervalRef = useRef(null);

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
    if (isRecording) {
      // Fixed: removed optional chaining
      recordingStartTime.current = Date.now();
      setRecordingDuration(0);

      // Fixed: removed optional chaining
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
    if (!groupId || !userId) {
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
      console.log("Group ID:", groupId, typeof groupId);
      console.log("User ID:", userId, typeof userId);

      try {
        const groupRecord = await pb.collection("groups").getOne(groupId);
        console.log("Group record found:", groupRecord.id);
      } catch (groupErr) {
        console.error("Error checking group:", groupErr);
        throw new Error(`Group with ID ${groupId} not found or inaccessible`);
      }

      const fileObject = {
        uri: fileUri,
        type: "audio/mpeg",
        name: `voice_${Date.now()}.m4a`,
      };

      console.log("File object:", JSON.stringify(fileObject));

      const formData = new FormData();

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

      formData.append("group", groupId);
      formData.append("sender", userId);
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
        group: groupId,
        sender: userId,
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
          id: userId,
          name: "Me",
        },
      };

      setGroupDetails((prev: { messages: any }) => {
        const updatedDetails = {
          ...prev,
          messages: [...prev.messages, newMessage],
        };

        groupCache.set(groupId, updatedDetails);

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

  const handleRecordButtonPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return {
    isRecording,
    isUploading,
    recordingDuration,
    handleRecordButtonPress,
  };
};
