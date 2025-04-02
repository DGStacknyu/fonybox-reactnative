import { ChatListHeader } from "@/components/chats/MainChat/ChatListHeader";
import { ChatListSearch } from "@/components/chats/MainChat/ChatListSearch";
import { ConversationItem } from "@/components/chats/MainChat/ConversationItem";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, SafeAreaView, StatusBar } from "react-native";

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
    lastMessage: {
      type: "voice",
      duration: "0:15",
      timestamp: "Just now",
    },
    unread: true,
    messageCount: 15,
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
    lastMessage: {
      type: "voice",
      duration: "0:31",
      timestamp: "2 mins",
    },
    unread: false,
    messageCount: 3,
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
    lastMessage: {
      type: "voice",
      duration: "1:05",
      timestamp: "Yesterday",
    },
    unread: true,
    messageCount: 4,
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
    lastMessage: {
      type: "voice",
      duration: "0:55",
      timestamp: "Monday",
    },
    unread: false,
    messageCount: 3,
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
    lastMessage: {
      type: "voice",
      duration: "1:12",
      timestamp: "8:52 AM",
    },
    unread: true,
    messageCount: 5,
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
    lastMessage: {
      type: "voice",
      duration: "0:33",
      timestamp: "11:15 AM",
    },
    unread: false,
    messageCount: 4,
  },
];

const ChatListScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredConversations = SAMPLE_CONVERSATIONS.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationPress = (conversation: { id: any }) => {
    router.push(`/(chat)/${conversation.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <ChatListHeader onSearchChange={setSearchQuery} title="Chats" />
      <ChatListSearch onSearchChange={setSearchQuery} />

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={handleConversationPress}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ChatListScreen;
