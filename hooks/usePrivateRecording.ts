import { useState, useRef, useEffect, RefObject } from "react";
import { Alert, Platform, ScrollView } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { pb } from "@/components/pocketbaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatDuration } from "@/utils/audio/audioHelpers";

export const usePrivateRecording = (
  chatId: string | Blob,
  userId: string | Blob,
  setChatDetails: { (value: any): void; (arg0: (prev: any) => any): void },
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

      // Use platform-specific recording options
      let recordingOptions;

      if (Platform.OS === "ios") {
        // For iOS, use M4A which is natively supported
        recordingOptions = {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          ios: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
            extension: ".m4a",
            outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          },
        };
      } else {
        // For Android, we'll use a format that can be converted properly
        recordingOptions = {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          android: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
            extension: ".mp3",
            outputFormat: 1, // AAC_ADTS for better MIME type handling
            audioEncoder: 3, // AAC
          },
        };
      }

      const { recording: newRecording } = await Audio.Recording.createAsync(
        recordingOptions
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      recordingStartTime.current = Date.now();

      console.log(`Recording started with ${Platform.OS} optimized format`);
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
    if (!chatId || !userId) {
      Alert.alert("Error", "Missing chat ID or user ID");
      return;
    }

    setIsUploading(true);

    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      console.log("Uploading audio file:", fileUri);

      // Set file details based on platform
      let fileExtension, mimeType;

      if (Platform.OS === "ios") {
        fileExtension = ".m4a";
        mimeType = "audio/x-m4a";
      } else {
        fileExtension = ".mp3";
        mimeType = "audio/mpeg";
      }

      // Create a temp file with the correct extension to ensure proper MIME type
      const tempFile = `${
        FileSystem.cacheDirectory
      }temp_voice_${Date.now()}${fileExtension}`;
      await FileSystem.copyAsync({
        from: fileUri,
        to: tempFile,
      });

      // Create a file object with explicit type
      const fileObject = {
        uri: tempFile,
        type: mimeType,
        name: `voice_${Date.now()}${fileExtension}`,
      };

      console.log("File object:", {
        uri: tempFile.substring(0, 30) + "...",
        type: mimeType,
        name: fileObject.name,
      });

      const formData = new FormData();

      // Explicitly convert to string and cast as any to avoid type issues
      formData.append("audio_file", fileObject as any);
      formData.append("chat", String(chatId));
      formData.append("sender", String(userId));
      formData.append("metadata", JSON.stringify({ durationSeconds }));

      console.log("Preparing to upload form data");

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

      // Use direct fetch instead of PocketBase client for better control
      const uploadUrl = `${pb.baseUrl}/api/collections/private_messages/records`;
      console.log("Uploading to:", uploadUrl);

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pb.authStore.token}`,
          // Let fetch set the content-type with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload error response:", errorText);
        throw new Error(`Server error: ${errorText}`);
      }

      const record = await response.json();
      console.log("Message uploaded successfully:", record.id);

      // Clean up temp file
      try {
        await FileSystem.deleteAsync(tempFile);
      } catch (cleanupErr) {
        console.warn("Could not delete temp file:", cleanupErr);
      }

      const formattedDuration = formatDuration(durationSeconds * 1000);

      const newMessage = {
        id: record.id,
        type: "voice",
        audio_url: pb.files.getUrl(record, record.audio_file),
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
        read: false,
      };

      setChatDetails((prev: { messages: any[] }) => {
        if (!prev) return null;

        const updatedDetails = {
          ...prev,
          messages: [...prev.messages, newMessage],
        };

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
