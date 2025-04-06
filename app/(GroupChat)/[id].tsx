import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalContext } from "@/lib/AuthContext";
import { useRecording } from "@/components/chats/GroupChat/useRecording";
import {
  getPlaceholderGroup,
  groupCache,
  loadGroupData,
} from "@/utils/audio/groupChatHelpers";
import { GroupChatHeader } from "@/components/chats/GroupChat/GroupChatHeader";
import { MessageList } from "@/components/chats/GroupChat/MessageList";
import { RecordingButton } from "@/components/chats/GroupChat/RecordingButton";

const GroupChatDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [groupDetails, setGroupDetails] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useGlobalContext();

  const {
    isRecording,
    isUploading,
    recordingDuration,
    handleRecordButtonPress,
  } = useRecording(id, user.id, setGroupDetails, scrollViewRef);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!id) return;

      try {
        if (groupCache.has(id)) {
          const cachedData = groupCache.get(id);
          setGroupDetails(cachedData);

          if (!cachedData.isPlaceholder) {
            setIsUpdating(true);
            await loadGroupData(id, user.id, setGroupDetails, setError);
            setIsUpdating(false);
            return;
          }
        } else {
          const placeholder = getPlaceholderGroup(id);
          setGroupDetails(placeholder);
          groupCache.set(id, placeholder);
        }

        try {
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

        setIsUpdating(true);
        await loadGroupData(id, user.id, setGroupDetails, setError);
        setIsUpdating(false);
      } catch (err) {
        console.error("Error in initial data loading:", err);
        setError("Failed to load group chat details");
      }
    };

    loadInitialData();
  }, [id]);

  useEffect(() => {
    if (groupDetails?.messages?.length > 0) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: false });
        }
      }, 100);
    }
  }, [groupDetails?.messages?.length]);

  const setIsPlaying = (messageId: any, isPlaying: any) => {
    console.log(
      `Message ${messageId} is now ${isPlaying ? "playing" : "paused"}`
    );
    if (groupDetails) {
      const updatedMessages = groupDetails.messages.map((msg: { id: any }) =>
        msg.id === messageId
          ? { ...msg, isPlaying }
          : { ...msg, isPlaying: false }
      );

      const updatedDetails = {
        ...groupDetails,
        messages: updatedMessages,
      };

      setGroupDetails(updatedDetails);

      groupCache.set(id, updatedDetails);
    }
  };

  if (error && !groupDetails) {
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

  const displayDetails = groupDetails || getPlaceholderGroup(id);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <GroupChatHeader groupDetails={displayDetails} />

      <MessageList
        ref={scrollViewRef}
        groupDetails={displayDetails}
        setIsPlaying={setIsPlaying}
        isUpdating={isUpdating}
      />

      <RecordingButton
        isRecording={isRecording}
        isUploading={isUploading}
        recordingDuration={recordingDuration}
        onPress={handleRecordButtonPress}
      />
    </SafeAreaView>
  );
};

export default GroupChatDetailScreen;
