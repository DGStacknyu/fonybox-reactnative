import { ChatListHeader } from "@/components/chats/MainChat/ChatListHeader";
import { ChatListSearch } from "@/components/chats/MainChat/ChatListSearch";
import { ConversationItem } from "@/components/chats/GroupChat/ConversationItem";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { getGroupChats } from "@/lib/get-chat-data/get-group-chat";
import { RecordModel } from "pocketbase";
import { pbFileUrl } from "@/lib/getData/GetVideos";

// Define interface for processed group data
interface ProcessedGroup {
  id: string;
  name: string;
  avatar: string | null;
  initial: string;
  color: string;
  description: string;
  memberCount: number;
  lastMessage: {
    type: string;
    sender: string;
    duration: string;
    timestamp: string;
  };
  unread: boolean;
  messageCount: number;
}

const GroupChatItem = ({
  group,
  onPress,
}: {
  group: ProcessedGroup;
  onPress: (group: ProcessedGroup) => void;
}) => {
  const lastMessageWithSender = {
    type: group.lastMessage.type,
    duration: group.lastMessage.duration,
    timestamp: group.lastMessage.timestamp,
    text: `Voice message from ${group.lastMessage.sender}`,
    sender: group.lastMessage.sender,
  };

  return (
    <ConversationItem
      conversation={{
        id: group.id,
        user: {
          name: group.name,
          avatar: group.image,
          initial: group.initial,
          color: group.color,
          status: `${group.memberCount} members`,
        },
        lastMessage: lastMessageWithSender,
        unread: group.unread,
        messageCount: group.messageCount,
        isGroup: true,
      }}
      onPress={() => onPress(group)}
    />
  );
};

const GroupChat = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groupChats, setGroupChats] = useState<ProcessedGroup[]>([]);
  const [error, setError] = useState("");

  // Function to assign a color based on group id
  const getColorFromId = (id: string): string => {
    const colors = ["#F0D3F7", "#E3F5FF", "#FFE8CC", "#D1F5D3", "#FFD6D6"];
    const sumChars = id
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[sumChars % colors.length];
  };

  const fetchGroupChats = async () => {
    try {
      setLoading(true);

      const fetchedGroups = await getGroupChats();

      const processedGroups: ProcessedGroup[] = fetchedGroups.items.map(
        (group) => {
          return {
            id: group.id,
            name: group.name || "Unnamed Group",
            image: pbFileUrl(group.collectionId, group.id, group.image),
            initial: (group.name?.charAt(0) || "G").toUpperCase(),
            color: getColorFromId(group.id),
            description: group.description || "",
            lastMessage: {
              type: "voice",
              sender: "Unknown",
              duration: "0:00",
              timestamp: new Date(group.created).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            unread: false,
            messageCount: 0,
          };
        }
      );

      setGroupChats(processedGroups);
    } catch (err) {
      setError("Failed to load groups");
      console.error("Error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupChats();
  }, []);

  const filteredGroups = groupChats.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGroupPress = (group: ProcessedGroup) => {
    router.push(`/(GroupChat)/${group.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <ChatListHeader
        onSearchChange={setSearchQuery}
        title="Group chats"
        showAddButton={true}
      />
      <ChatListSearch
        onSearchChange={setSearchQuery}
        placeholder="Search group chats"
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      ) : filteredGroups.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-500 text-center">
            No group chats found. Create a new group to get started.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupChatItem group={item} onPress={handleGroupPress} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default GroupChat;
