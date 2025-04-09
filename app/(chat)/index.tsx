import { ChatListHeader } from "@/components/chats/MainChat/ChatListHeader";
import { ChatListSearch } from "@/components/chats/MainChat/ChatListSearch";
import { ConversationItem } from "@/components/chats/MainChat/ConversationItem";
import { pb } from "@/components/pocketbaseClient";
import { useGlobalContext } from "@/context/AuthContext";
import { getUserChats } from "@/lib/get-chat-data/get-private-chat";
import { getColorFromId } from "@/utils/audio/groupChatHelpers";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import { RecordModel } from "pocketbase";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from "react-native";

const ChatListScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useGlobalContext();

  const formatChatData = async (chatData: RecordModel[]) => {
    const formattedChats = [];

    for (const chat of chatData) {
      try {
        const otherUserId = chat.user1 === user.id ? chat.user2 : chat.user1;

        const otherUser = await pb.collection("users").getOne(otherUserId);

        const messages = await pb.collection("private_messages").getList(1, 1, {
          filter: `chat="${chat.id}"`,
          sort: "-created",
        });

        if (messages.items.length === 0) continue;

        const lastMessage = messages.items[0];

        const unreadCount = await pb
          .collection("private_messages")
          .getList(1, 100, {
            filter: `chat="${chat.id}" && sender!="${user.id}" && read=false`,
            countOnly: true,
          });

        let timestamp;
        try {
          const messageDate = new Date(lastMessage.created);
          timestamp = formatDistanceToNow(messageDate, { addSuffix: true });

          timestamp = timestamp
            .replace("about ", "")
            .replace("less than ", "")
            .replace(" ago", "");

          if (timestamp.includes("minute")) {
            if (timestamp.startsWith("1 ")) {
              timestamp = "1 min";
            } else {
              timestamp = timestamp.replace(" minutes", " mins");
            }
          }
        } catch (error) {
          timestamp = "Unknown";
        }

        formattedChats.push({
          id: chat.id,
          user: {
            id: otherUser.id,
            name: otherUser.name || "User",
            avatar: otherUser.avatar
              ? pb.files.getUrl(otherUser, otherUser.avatar)
              : null,
            initial: (otherUser.name || "U")[0].toUpperCase(),
            color: otherUser.color || getColorFromId(otherUserId),
            hasStory: false,
            status: otherUser.status || "Offline",
          },
          lastMessage: {
            type: lastMessage.audio_file ? "voice" : "text",
            content: lastMessage.content || "",
            duration: lastMessage.metadata?.durationSeconds
              ? `${Math.floor(lastMessage.metadata.durationSeconds / 60)}:${(
                  lastMessage.metadata.durationSeconds % 60
                )
                  .toString()
                  .padStart(2, "0")}`
              : "0:00",
            timestamp: timestamp,
          },
          unread: unreadCount.totalItems > 0,
          messageCount: unreadCount.totalItems,
        });
      } catch (error) {
        console.error("Error formatting chat:", error);
      }
    }

    return formattedChats;
  };

  const loadChats = useCallback(async () => {
    if (!user || !user.id) return;

    try {
      setLoading(true);

      const { success, chats, error } = await getUserChats(user.id);

      if (success && chats) {
        const formattedChats = await formatChatData(chats);
        setConversations(formattedChats);
      } else {
        console.error("Failed to load chats:", error);
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadChats();

    const messagesSubscription = pb
      .collection("private_messages")
      .subscribe("*", function () {
        loadChats();
      });

    return () => {
      pb.collection("private_messages").unsubscribe();
    };
  }, [loadChats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadChats();
  }, [loadChats]);

  const filteredConversations = conversations.filter((conversation) =>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-gray-500 text-center">
              {loading
                ? "Loading chats..."
                : "No conversations yet. Start a new chat to begin messaging."}
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 20,
          flexGrow: filteredConversations.length === 0 ? 1 : undefined,
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ChatListScreen;
