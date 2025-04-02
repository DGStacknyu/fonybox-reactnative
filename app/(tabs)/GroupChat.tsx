import { ChatListHeader } from "@/components/chats/MainChat/ChatListHeader";
import { ChatListSearch } from "@/components/chats/MainChat/ChatListSearch";
import { ConversationItem } from "@/components/chats/GroupChat/ConversationItem";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, SafeAreaView, StatusBar, Text, View } from "react-native";
import { GROUP_CHATS } from "@/constants/chats";

const GroupChatItem = ({ group, onPress }: any) => {
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
          avatar: group.avatar,
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

  const filteredGroups = GROUP_CHATS.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGroupPress = (group: { id: any }) => {
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
        placeholder="Search group chats" // Update placeholder
      />

      {filteredGroups.length === 0 ? (
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
