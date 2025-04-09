// import React, { useEffect, useRef, useState } from "react";
// import {
//   Alert,
//   RefreshControl,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { router, useLocalSearchParams } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useGlobalContext } from "@/lib/AuthContext";
// import { useRecording } from "@/components/chats/GroupChat/useRecording";
// import {
//   getPlaceholderGroup,
//   groupCache,
//   loadGroupData,
// } from "@/utils/audio/groupChatHelpers";
// import { GroupChatHeader } from "@/components/chats/GroupChat/GroupChatHeader";
// import { MessageList } from "@/components/chats/GroupChat/MessageList";
// import { RecordingButton } from "@/components/chats/GroupChat/RecordingButton";
// import { pb } from "@/components/pocketbaseClient";

// const GroupChatDetailScreen = () => {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const [groupDetails, setGroupDetails] = useState<any | null>(null);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [error, setError] = useState("");
//   const scrollViewRef = useRef<ScrollView>(null);
//   const { user } = useGlobalContext();
//   const [isMember, setIsMember] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false); // New state for refresh control

//   const {
//     isRecording,
//     isUploading,
//     recordingDuration,
//     handleRecordButtonPress,
//   } = useRecording(id, user.id, setGroupDetails, scrollViewRef);
//   const checkMembership = async (groupId: string, userId: string) => {
//     try {
//       const result = await pb
//         .collection("group_members")
//         .getFirstListItem(`group = "${groupId}" && user = "${userId}"`);
//       return !!result;
//     } catch (err) {
//       return false;
//     }
//   };

//   const handleJoinGroup = async () => {
//     try {
//       setIsUpdating(true);
//       const data = {
//         group: id,
//         user: user.id,
//         role: "member",
//         status: "offline",
//       };

//       await pb.collection("group_members").create(data);

//       setIsMember(true);
//       await loadGroupData(id, user.id, setGroupDetails, setError);
//     } catch (err) {
//       console.error("Error joining group:", err);
//       Alert.alert("Error", "Failed to join the group");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const loadInitialData = async () => {
//     if (!id) return;

//     try {
//       const memberStatus = await checkMembership(id, user.id);
//       setIsMember(memberStatus);

//       if (groupCache.has(id)) {
//         const cachedData = groupCache.get(id);
//         setGroupDetails(cachedData);

//         if (!cachedData.isPlaceholder && memberStatus) {
//           setIsUpdating(true);
//           await loadGroupData(id, user.id, setGroupDetails, setError);
//           setIsUpdating(false);
//           return;
//         }
//       } else {
//         const placeholder = getPlaceholderGroup(id);
//         setGroupDetails(placeholder);
//         groupCache.set(id, placeholder);
//       }

//       try {
//         const groupInfoKey = `group_info_${id}`;
//         const storedGroupInfo = await AsyncStorage.getItem(groupInfoKey);

//         if (storedGroupInfo) {
//           const groupInfo = JSON.parse(storedGroupInfo);
//           const quickPlaceholder = getPlaceholderGroup(
//             id,
//             groupInfo.name,
//             groupInfo.avatar
//           );
//           setGroupDetails(quickPlaceholder);
//           groupCache.set(id, quickPlaceholder);
//         }
//       } catch (storageErr) {
//         console.log("Could not get group info from storage:", storageErr);
//       }

//       if (memberStatus) {
//         setIsUpdating(true);
//         await loadGroupData(id, user.id, setGroupDetails, setError);
//         setIsUpdating(false);
//       }
//     } catch (err) {
//       console.error("Error in initial data loading:", err);
//       setError("Failed to load group chat details");
//     }
//   };
//   useEffect(() => {
//     loadInitialData();
//   }, [id]);
//   useEffect(() => {
//     const loadInitialData = async () => {
//       if (!id) return;

//       try {
//         if (groupCache.has(id)) {
//           const cachedData = groupCache.get(id);
//           setGroupDetails(cachedData);

//           if (!cachedData.isPlaceholder) {
//             setIsUpdating(true);
//             await loadGroupData(id, user.id, setGroupDetails, setError);
//             setIsUpdating(false);
//             return;
//           }
//         } else {
//           const placeholder = getPlaceholderGroup(id);
//           setGroupDetails(placeholder);
//           groupCache.set(id, placeholder);
//         }

//         try {
//           const groupInfoKey = `group_info_${id}`;
//           const storedGroupInfo = await AsyncStorage.getItem(groupInfoKey);

//           if (storedGroupInfo) {
//             const groupInfo = JSON.parse(storedGroupInfo);
//             const quickPlaceholder = getPlaceholderGroup(
//               id,
//               groupInfo.name,
//               groupInfo.avatar
//             );
//             setGroupDetails(quickPlaceholder);
//             groupCache.set(id, quickPlaceholder);
//           }
//         } catch (storageErr) {
//           console.log("Could not get group info from storage:", storageErr);
//         }

//         setIsUpdating(true);
//         await loadGroupData(id, user.id, setGroupDetails, setError);
//         setIsUpdating(false);
//       } catch (err) {
//         console.error("Error in initial data loading:", err);
//         setError("Failed to load group chat details");
//       }
//     };

//     loadInitialData();
//   }, [id]);

//   useEffect(() => {
//     if (groupDetails?.messages?.length > 0) {
//       setTimeout(() => {
//         if (scrollViewRef.current) {
//           scrollViewRef.current.scrollToEnd({ animated: false });
//         }
//       }, 100);
//     }
//   }, [groupDetails?.messages?.length]);

//   const setIsPlaying = (messageId: any, isPlaying: any) => {
//     console.log(
//       `Message ${messageId} is now ${isPlaying ? "playing" : "paused"}`
//     );
//     if (groupDetails) {
//       const updatedMessages = groupDetails.messages.map((msg: { id: any }) =>
//         msg.id === messageId
//           ? { ...msg, isPlaying }
//           : { ...msg, isPlaying: false }
//       );

//       const updatedDetails = {
//         ...groupDetails,
//         messages: updatedMessages,
//       };

//       setGroupDetails(updatedDetails);

//       groupCache.set(id, updatedDetails);
//     }
//   };

//   if (error && !groupDetails) {
//     return (
//       <SafeAreaView className="flex-1 items-center justify-center">
//         <Text>{error || "Group chat not found"}</Text>
//         <TouchableOpacity
//           className="mt-4 px-4 py-2 bg-[#F52936] rounded-full"
//           onPress={() => router.back()}
//         >
//           <Text className="text-white">Go Back</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   const displayDetails = groupDetails || getPlaceholderGroup(id);

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     try {
//       await loadInitialData();
//     } catch (err) {
//       console.error("Error refreshing:", err);
//       setError("Failed to refresh data");
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <StatusBar barStyle="dark-content" />

//       <GroupChatHeader groupDetails={displayDetails} />

//       <MessageList
//         ref={scrollViewRef}
//         groupDetails={displayDetails}
//         setIsPlaying={setIsPlaying}
//         isUpdating={isUpdating}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={handleRefresh}
//             colors={["#F52936"]}
//             tintColor="#F52936"
//           />
//         }
//       />

//       {isMember ? (
//         <RecordingButton
//           isRecording={isRecording}
//           isUploading={isUploading}
//           recordingDuration={recordingDuration}
//           onPress={handleRecordButtonPress}
//         />
//       ) : (
//         <View className="p-4">
//           <TouchableOpacity
//             className="bg-[#F52936] rounded-full p-4 items-center"
//             onPress={handleJoinGroup}
//             disabled={isUpdating}
//           >
//             <Text className="text-white font-bold">
//               {isUpdating ? "Joining..." : "Join Group"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default GroupChatDetailScreen;
import React, { useRef, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useGlobalContext } from "@/context/AuthContext";
import { useRecording } from "@/components/chats/GroupChat/useRecording";
import { GroupChatHeader } from "@/components/chats/GroupChat/GroupChatHeader";
import { MessageList } from "@/components/chats/GroupChat/MessageList";
import { RecordingButton } from "@/components/chats/GroupChat/RecordingButton";
import { pb } from "@/components/pocketbaseClient";
import { useRealtimeGroupChat } from "@/hooks/useRealtimeGroupChats"; // Import our new hook
import { getPlaceholderGroup } from "@/utils/audio/groupChatHelpers";

const GroupChatDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useGlobalContext();
  const [isMember, setIsMember] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Use our custom hook for real-time updates
  const {
    groupDetails,
    messages,
    loading,
    error,
    addMessage,
    refreshChat,
    setIsPlaying,
  } = useRealtimeGroupChat(id, user.id);

  const {
    isRecording,
    isUploading,
    recordingDuration,
    handleRecordButtonPress,
  } = useRecording(
    id,
    user.id,
    (newDetails) => {
      // This callback will no longer be needed as messages are updated in real-time
      // But we'll keep it for compatibility
      refreshChat();

      // Scroll to bottom when adding a new message
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    },
    scrollViewRef
  );

  // Check if the current user is a member of this group
  React.useEffect(() => {
    const checkMembership = async () => {
      try {
        const result = await pb
          .collection("group_members")
          .getFirstListItem(`group = "${id}" && user = "${user.id}"`);
        setIsMember(!!result);
      } catch (err) {
        setIsMember(false);
      }
    };

    checkMembership();
  }, [id, user.id]);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: false });
        }
      }, 100);
    }
  }, [messages.length]);

  const handleJoinGroup = async () => {
    try {
      setIsJoining(true);
      const data = {
        group: id,
        user: user.id,
        role: "member",
        status: "offline",
      };

      await pb.collection("group_members").create(data);
      setIsMember(true);

      // Refresh chat after joining
      await refreshChat();
    } catch (err) {
      console.error("Error joining group:", err);
      Alert.alert("Error", "Failed to join the group");
    } finally {
      setIsJoining(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshChat();
    } catch (err) {
      console.error("Error refreshing:", err);
    } finally {
      setIsRefreshing(false);
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
        isUpdating={loading}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#F52936"]}
            tintColor="#F52936"
          />
        }
      />

      {isMember ? (
        <RecordingButton
          isRecording={isRecording}
          isUploading={isUploading}
          recordingDuration={recordingDuration}
          onPress={handleRecordButtonPress}
        />
      ) : (
        <View className="p-4">
          <TouchableOpacity
            className="bg-[#F52936] rounded-full p-4 items-center"
            onPress={handleJoinGroup}
            disabled={isJoining}
          >
            <Text className="text-white font-bold">
              {isJoining ? "Joining..." : "Join Group"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default GroupChatDetailScreen;
