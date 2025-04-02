// (GroupChat)/[id].tsx

import { VoiceMessage } from "@/components/chats/VoiceMessage";
import { GROUP_CHATS } from "@/constants/chats";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

const GROUP_DETAILS = [
  {
    id: "1",
    name: "Project Alpha Team",
    avatar: null,
    initial: "A",
    color: "#F0D3F7",
    members: [
      { id: "user1", name: "Hossein Azarbad", isAdmin: true },
      { id: "user2", name: "Marvin McKinney", isAdmin: false },
      { id: "user3", name: "Sarah Johnson", isAdmin: false },
      { id: "user4", name: "Alex Chen", isAdmin: false },
    ],
    memberCount: 12,
    messages: [
      {
        id: "1a",
        type: "voice",
        duration: "0:15",
        isSent: false,
        timestamp: "10:30 AM",
        isPlaying: false,
        sender: { id: "user1", name: "Hossein Azarbad" },
      },
      {
        id: "1b",
        type: "voice",
        duration: "0:23",
        isSent: true,
        timestamp: "10:31 AM",
        isPlaying: false,
        sender: { id: "currentUser", name: "You" },
      },
      {
        id: "1c",
        type: "voice",
        duration: "0:12",
        isSent: false,
        timestamp: "10:32 AM",
        isPlaying: false,
        sender: { id: "user2", name: "Marvin McKinney" },
      },
      {
        id: "1d",
        type: "voice",
        duration: "0:42",
        isSent: false,
        timestamp: "10:33 AM",
        isPlaying: false,
        sender: { id: "user3", name: "Sarah Johnson" },
      },
      {
        id: "1e",
        type: "voice",
        duration: "0:28",
        isSent: true,
        timestamp: "10:35 AM",
        isPlaying: false,
        sender: { id: "currentUser", name: "You" },
      },
      {
        id: "1f",
        type: "voice",
        duration: "0:19",
        isSent: false,
        timestamp: "10:37 AM",
        isPlaying: false,
        sender: { id: "user1", name: "Hossein Azarbad" },
      },
      {
        id: "1g",
        type: "voice",
        duration: "0:34",
        isSent: true,
        timestamp: "10:39 AM",
        isPlaying: false,
        sender: { id: "currentUser", name: "You" },
      },
    ],
  },
  {
    id: "2",
    name: "Weekend Hangout",
    avatar: null,
    initial: "W",
    color: "#EEEEEE",
    members: [
      { id: "user2", name: "Marvin McKinney", isAdmin: true },
      { id: "user3", name: "Sarah Johnson", isAdmin: false },
      { id: "user5", name: "Emily Rodriguez", isAdmin: false },
    ],
    memberCount: 5,
    messages: [
      {
        id: "2a",
        type: "voice",
        duration: "0:08",
        isSent: false,
        timestamp: "9:15 AM",
        isPlaying: false,
        sender: { id: "user2", name: "Marvin McKinney" },
      },
      {
        id: "2b",
        type: "voice",
        duration: "0:19",
        isSent: true,
        timestamp: "9:16 AM",
        isPlaying: false,
        sender: { id: "currentUser", name: "You" },
      },
      {
        id: "2c",
        type: "voice",
        duration: "0:31",
        isSent: false,
        timestamp: "9:18 AM",
        isPlaying: false,
        sender: { id: "user3", name: "Sarah Johnson" },
      },
    ],
  },
  {
    id: "3",
    name: "UX/UI Design Team",
    avatar: null,
    initial: "U",
    color: "#E3F5FF",
    members: [
      { id: "user3", name: "Sarah Johnson", isAdmin: true },
      { id: "user4", name: "Alex Chen", isAdmin: true },
      { id: "user6", name: "David Kim", isAdmin: false },
    ],
    memberCount: 8,
    messages: [
      {
        id: "3a",
        type: "voice",
        duration: "0:45",
        isSent: false,
        timestamp: "Yesterday",
        isPlaying: false,
        sender: { id: "user3", name: "Sarah Johnson" },
      },
      {
        id: "3b",
        type: "voice",
        duration: "0:12",
        isSent: true,
        timestamp: "Yesterday",
        isPlaying: false,
        sender: { id: "currentUser", name: "You" },
      },
    ],
  },
  {
    id: "4",
    name: "Family Chat",
    avatar: null,
    initial: "F",
    color: "#FFEBEE",
    members: [
      { id: "user7", name: "John Doe", isAdmin: true },
      { id: "user8", name: "Jane Doe", isAdmin: false },
      { id: "user9", name: "Alice Smith", isAdmin: false },
    ],
    memberCount: 6,
    messages: [
      {
        id: "4a",
        type: "voice",
        duration: "0:20",
        isSent: false,
        timestamp: "Today",
        isPlaying: false,
        sender: { id: "user7", name: "John Doe" },
      },
      {
        id: "4b",
        type: "voice",
        duration: "0:30",
        isSent: true,
        timestamp: "Today",
        isPlaying: false,
        sender: { id: "currentUser", name: "You" },
      },
    ],
  },
  {
    id: "5",
    name: "Friday Game Night ",
    avatar: null,
    initial: "F",
    color: "#E0F7FA",
    members: [
      { id: "user10", name: "Bob Marley", isAdmin: true },
      { id: "user11", name: "Alice Wonderland", isAdmin: false },
      { id: "user12", name: "Charlie Brown", isAdmin: false },
    ],
    memberCount: 10,
    messages: [
      {
        id: "5a",
        type: "voice",
        duration: "0:50",
        isSent: false,
        timestamp: "Last week",
        isPlaying: false,
        sender: { id: "user10", name: "Bob Marley" },
      },
      {
        id: "5b",
        type: "voice",
        duration: "0:15",
        isSent: true,
        timestamp: "Last week",
        isPlaying: false,
        sender: { id: "currentUser", name: "You" },
      },
    ],
  },
  {
    id: "6",
    name: "Book Club",
    avatar: null,
    initial: "B",
    color: "#FFF3E0",
    members: [
      { id: "user13", name: "David Kim", isAdmin: true },
      { id: "user14", name: "Emily Rodriguez", isAdmin: false },
      { id: "user15", name: "Sarah Johnson", isAdmin: false },
    ],
    memberCount: 4,
    messages: [
      {
        id: "6a",
        type: "voice",
        duration: "0:35",
        isSent: false,
        timestamp: "Last month",
        isPlaying: false,
        sender: { id: "user13", name: "David Kim" },
      },
      {
        id: "6b",
        type: "voice",
        duration: "0:22",
        isSent: true,
        timestamp: "Last month",
        isPlaying: false,
        sender: { id: "currentUser", name: "You" },
      },
    ],
  },
];

const GroupVoiceMessage = ({ message, setIsPlaying }: any) => {
  const isSent = message.isSent;

  return (
    <View className={`flex-row  ${isSent ? "justify-end" : "justify-start"}`}>
      <View className={`rounded-2xl px-3 max-w-[80%]`}>
        {!isSent && (
          <Text className="text-xs font-medium text-gray-600 mb-1">
            {message.sender.name}
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

const GroupChatDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [recording, setRecording] = useState(false);
  const [groupChat, setGroupChat] = useState(
    GROUP_CHATS.find((group) => group.id === id)
  );
  const scrollViewRef = useRef<ScrollView>(null);

  const setIsPlaying = (messageId: any, isPlaying: any) => {
    console.log(
      `Message ${messageId} is now ${isPlaying ? "playing" : "paused"}`
    );
  };

  const handleGroupInfoPress = () => {
    router.push(`/(GroupChat)/info/${id}`);
  };

  useEffect(() => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }
    }, 100);
  }, []);

  if (!groupChat) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Group chat not found</Text>
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

      <View className="flex-row items-center px-5 py-2.5 border-b border-[#EEEEEE]">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#637381" />
        </TouchableOpacity>

        <TouchableOpacity
          className="ml-4 flex-row items-center flex-1"
          onPress={handleGroupInfoPress}
        >
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: groupChat.color }}
          >
            <Text className="text-base">{groupChat.initial}</Text>
          </View>

          <View className="ml-2.5">
            <Text className="text-lg font-medium">{groupChat.name}</Text>
            <Text className="text-sm text-[#637381]">
              {groupChat.memberCount} members
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
        {groupChat.messages.map((message) => (
          <GroupVoiceMessage
            key={message.id}
            message={message}
            setIsPlaying={setIsPlaying}
          />
        ))}
        <View className="h-5" />
      </ScrollView>

      {/* Recording Button */}
      <View className="py-2.5 pb-5 px-5 items-center bg-white border-t border-[#EEEEEE]">
        <TouchableOpacity
          className="w-20 h-20 rounded-full bg-[#F52936] items-center justify-center shadow-md"
          onPress={() => setRecording(!recording)}
        >
          <Ionicons name="mic" size={40} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GroupChatDetailScreen;
