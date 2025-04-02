import { VoiceMessage } from "@/components/chats/VoiceMessage";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SAMPLE_CONVERSATIONS = [
  {
    id: "1",
    user: {
      name: "Hossein Azarbad",
      avatar: null,
      initial: "H",
      color: "#F0D3F7",
      hasStory: true,
      status: "Online",
    },
    messages: [
      {
        id: "1a",
        type: "voice",
        duration: "0:15",
        isSent: false,
        timestamp: "10:30 AM",
        isPlaying: false,
      },
      {
        id: "1b",
        type: "voice",
        duration: "0:23",
        isSent: true,
        timestamp: "10:31 AM",
        isPlaying: false,
      },
      {
        id: "1c",
        type: "voice",
        duration: "0:12",
        isSent: false,
        timestamp: "10:32 AM",
        isPlaying: false,
      },
      {
        id: "1d",
        type: "voice",
        duration: "0:42",
        isSent: false,
        timestamp: "10:33 AM",
        isPlaying: false,
      },
      {
        id: "1e",
        type: "voice",
        duration: "0:28",
        isSent: true,
        timestamp: "10:35 AM",
        isPlaying: false,
      },
      {
        id: "1f",
        type: "voice",
        duration: "0:19",
        isSent: false,
        timestamp: "10:37 AM",
        isPlaying: false,
      },
      {
        id: "1g",
        type: "voice",
        duration: "0:34",
        isSent: true,
        timestamp: "10:39 AM",
        isPlaying: false,
      },
      {
        id: "1h",
        type: "voice",
        duration: "0:51",
        isSent: false,
        timestamp: "10:41 AM",
        isPlaying: false,
      },
      {
        id: "1i",
        type: "voice",
        duration: "0:13",
        isSent: true,
        timestamp: "10:43 AM",
        isPlaying: false,
      },
      {
        id: "1j",
        type: "voice",
        duration: "1:05",
        isSent: false,
        timestamp: "10:45 AM",
        isPlaying: false,
      },
      {
        id: "1k",
        type: "voice",
        duration: "0:27",
        isSent: true,
        timestamp: "10:48 AM",
        isPlaying: false,
      },
      {
        id: "1l",
        type: "voice",
        duration: "0:39",
        isSent: false,
        timestamp: "10:50 AM",
        isPlaying: false,
      },
      {
        id: "1m",
        type: "voice",
        duration: "0:22",
        isSent: true,
        timestamp: "10:52 AM",
        isPlaying: false,
      },
      {
        id: "1n",
        type: "voice",
        duration: "0:17",
        isSent: false,
        timestamp: "10:54 AM",
        isPlaying: false,
      },
      {
        id: "1o",
        type: "voice",
        duration: "0:45",
        isSent: true,
        timestamp: "10:55 AM",
        isPlaying: false,
      },
    ],
  },
  {
    id: "2",
    user: {
      name: "Marvin McKinney",
      avatar: null,
      initial: "M",
      color: "#EEEEEE",
      hasStory: false,
      status: "Online",
    },
    messages: [
      {
        id: "2a",
        type: "voice",
        duration: "0:08",
        isSent: false,
        timestamp: "9:15 AM",
        isPlaying: false,
      },
      {
        id: "2b",
        type: "voice",
        duration: "0:19",
        isSent: true,
        timestamp: "9:16 AM",
        isPlaying: false,
      },
      {
        id: "2c",
        type: "voice",
        duration: "0:31",
        isSent: false,
        timestamp: "9:18 AM",
        isPlaying: false,
      },
    ],
  },
  {
    id: "3",
    user: {
      name: "Sarah Johnson",
      avatar: null,
      initial: "S",
      color: "#E3F5FF",
      hasStory: true,
      status: "Last seen 2h ago",
    },
    messages: [
      {
        id: "3a",
        type: "voice",
        duration: "1:05",
        isSent: false,
        timestamp: "Yesterday",
        isPlaying: false,
      },
      {
        id: "3b",
        type: "voice",
        duration: "0:47",
        isSent: true,
        timestamp: "Yesterday",
        isPlaying: false,
      },
      {
        id: "3c",
        type: "voice",
        duration: "0:22",
        isSent: false,
        timestamp: "Yesterday",
        isPlaying: false,
      },
      {
        id: "3d",
        type: "voice",
        duration: "0:38",
        isSent: true,
        timestamp: "Yesterday",
        isPlaying: false,
      },
    ],
  },
  {
    id: "4",
    user: {
      name: "Alex Chen",
      avatar: null,
      initial: "A",
      color: "#FFE8CC",
      hasStory: false,
      status: "Last seen 1d ago",
    },
    messages: [
      {
        id: "4a",
        type: "voice",
        duration: "0:55",
        isSent: true,
        timestamp: "Monday",
        isPlaying: false,
      },
      {
        id: "4b",
        type: "voice",
        duration: "1:22",
        isSent: false,
        timestamp: "Monday",
        isPlaying: false,
      },
      {
        id: "4c",
        type: "voice",
        duration: "0:18",
        isSent: true,
        timestamp: "Monday",
        isPlaying: false,
      },
    ],
  },
  {
    id: "5",
    user: {
      name: "Emily Rodriguez",
      avatar: null,
      initial: "E",
      color: "#E0FFE0",
      hasStory: true,
      status: "Online",
    },
    messages: [
      {
        id: "5a",
        type: "voice",
        duration: "0:27",
        isSent: false,
        timestamp: "8:45 AM",
        isPlaying: false,
      },
      {
        id: "5b",
        type: "voice",
        duration: "0:33",
        isSent: true,
        timestamp: "8:46 AM",
        isPlaying: false,
      },
      {
        id: "5c",
        type: "voice",
        duration: "0:15",
        isSent: false,
        timestamp: "8:48 AM",
        isPlaying: false,
      },
      {
        id: "5d",
        type: "voice",
        duration: "0:09",
        isSent: true,
        timestamp: "8:49 AM",
        isPlaying: false,
      },
      {
        id: "5e",
        type: "voice",
        duration: "1:12",
        isSent: false,
        timestamp: "8:52 AM",
        isPlaying: false,
      },
    ],
  },
  {
    id: "6",
    user: {
      name: "David Kim",
      avatar: null,
      initial: "D",
      color: "#D3E5FF",
      hasStory: false,
      status: "Last seen just now",
    },
    messages: [
      {
        id: "6a",
        type: "voice",
        duration: "0:22",
        isSent: true,
        timestamp: "11:10 AM",
        isPlaying: false,
      },
      {
        id: "6b",
        type: "voice",
        duration: "0:18",
        isSent: false,
        timestamp: "11:11 AM",
        isPlaying: false,
      },
      {
        id: "6c",
        type: "voice",
        duration: "0:45",
        isSent: true,
        timestamp: "11:12 AM",
        isPlaying: false,
      },
      {
        id: "6d",
        type: "voice",
        duration: "0:33",
        isSent: false,
        timestamp: "11:15 AM",
        isPlaying: false,
      },
    ],
  },
];

const ChatDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [recording, setRecording] = useState(false);
  const [conversation, setConversation] = useState(
    SAMPLE_CONVERSATIONS.find((convo) => convo.id === id)
  );
  const scrollViewRef = useRef<ScrollView>(null);

  const setIsPlaying = (messageId: any, isPlaying: any) => {
    console.log(
      `Message ${messageId} is now ${isPlaying ? "playing" : "paused"}`
    );
  };

  useEffect(() => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }
    }, 100);
  }, []);

  if (!conversation) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Conversation not found</Text>
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

      {/* Header */}
      <View className="flex-row items-center px-5 py-2.5 border-b border-[#EEEEEE]">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#637381" />
        </TouchableOpacity>

        <View className="ml-4 flex-row items-center flex-1">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: conversation.user.color }}
          >
            <Text className="text-base">{conversation.user.initial}</Text>
          </View>

          <View className="ml-2.5">
            <Text className="text-lg font-medium">
              {conversation.user.name}
            </Text>
            <Text className="text-sm text-[#637381]">
              {conversation.user.status}
            </Text>
          </View>
        </View>

        {/* <TouchableOpacity className="mx-2">
          <Ionicons name="call-outline" size={22} color="#637381" />
        </TouchableOpacity>

        <TouchableOpacity className="ml-2">
          <Ionicons name="videocam-outline" size={22} color="#637381" />
        </TouchableOpacity> */}

        <TouchableOpacity
          className="ml-2"
          onPress={() => router.push(`/(chat)/info/${id}`)}
        >
          <Ionicons
            name="information-circle-outline"
            size={30}
            color="#637381"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 15 }}
        showsVerticalScrollIndicator={false}
      >
        {conversation.messages.map((message) => (
          <VoiceMessage
            key={message.id}
            message={message}
            setIsPlaying={setIsPlaying}
          />
        ))}
        <View className="h-5" />
      </ScrollView>

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

export default ChatDetailScreen;
