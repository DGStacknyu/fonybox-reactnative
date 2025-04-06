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
import { pb } from "@/components/pocketbaseClient";
import { pbFileUrl } from "@/lib/getData/GetVideos";
import { Audio } from "expo-av";
import { useGlobalContext } from "@/lib/AuthContext";

export const formatDuration = (durationMillis: number): string => {
  if (isNaN(durationMillis) || durationMillis <= 0) return "0:00";

  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const getAudioDuration = async (audioUrl: string) => {
  try {
    const soundObject = new Audio.Sound();
    await soundObject.loadAsync({ uri: audioUrl });
    const status = await soundObject.getStatusAsync();

    let duration = "0:00";
    if (status.isLoaded && status.durationMillis) {
      duration = formatDuration(status.durationMillis);
    }

    await soundObject.unloadAsync();
    return duration;
  } catch (error) {
    console.log("Error loading audio duration:", error);
    return "0:00";
  }
};

interface ProcessedGroup {
  id: string;
  name: string;
  avatar: string | null;
  initial: string;
  color: string;
  description: string;
  memberCount: number;
  lastMessage: {
    id: string;
    type: string;
    sender: string;
    duration: string;
    timestamp: string;
    text: string;
  } | null;
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
        lastMessage: group.lastMessage,
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
  const { user } = useGlobalContext();

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

      const fetchedGroups = await pb.collection("groups").getFullList({
        sort: "-created",
        expand: "created_by,members.user",
        requestKey: null,
      });

      const processedGroupsPromises = fetchedGroups.map(async (group) => {
        let lastMessage = null;
        let unread = false;
        let messageCount = 0;

        const memberCount = group.members?.length || 0;

        try {
          const lastMessageResult = await pb
            .collection("group_messages")
            .getFirstListItem(`group="${group.id}"`, {
              sort: "-created",
              expand: "sender",
            })
            .catch(() => null);
          if (lastMessageResult) {
            const message = lastMessageResult;

            try {
              const countResult = await pb
                .collection("group_messages")
                .getList(1, 1, {
                  filter: `group="${group.id}"`,
                  countOnly: true,
                });
              messageCount = countResult.totalItems;
            } catch (err) {
              console.log("Error getting message count:", err);
            }

            const messageType = message.type || "text";

            let senderName = "Unknown";
            if (message.expand?.sender?.name) {
              senderName = message.expand.sender.name;
            } else if (message.sender === user.id) {
              senderName = "You";
            }

            const messageTimestamp = new Date(
              message.created
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            let duration = "0:00";
            let text = "";

            if (messageType === "voice") {
              let durationLoaded = false;

              if (message.metadata) {
                try {
                  let metadata = message.metadata;
                  if (typeof metadata === "string") {
                    metadata = JSON.parse(metadata);
                  }

                  if (metadata && metadata.durationSeconds) {
                    duration = formatDuration(metadata.durationSeconds * 1000);
                    durationLoaded = true;
                    console.log(
                      `Group ${group.id} - Duration from metadata: ${duration}`
                    );
                  }
                } catch (e) {
                  console.log("Error parsing metadata:", e);
                }
              }

              if (!durationLoaded && message.audio_url) {
                try {
                  const audioUrl = pbFileUrl(
                    message.collectionId,
                    message.id,
                    message.audio_url
                  );
                  console.log(
                    `Group ${group.id} - Loading audio from: ${audioUrl}`
                  );

                  duration = await getAudioDuration(audioUrl);
                  console.log(
                    `Group ${group.id} - Duration from audio: ${duration}`
                  );
                } catch (e) {
                  console.log(`Error loading audio for group ${group.id}:`, e);
                }
              }

              text = "Voice message";
            } else {
              text = message.content || "Message";
            }

            lastMessage = {
              id: message.id,
              type: messageType,
              sender: senderName,
              duration: duration,
              timestamp: messageTimestamp,
              text: text,
            };
          }
        } catch (err) {
          console.error(
            `Failed to get message data for group ${group.id}:`,
            err
          );
        }

        return {
          id: group.id,
          name: group.name || "Unnamed Group",
          avatar: pbFileUrl(group.collectionId, group.id, group.image),
          initial: (group.name?.charAt(0) || "G").toUpperCase(),
          color: getColorFromId(group.id),
          description: group.description || "",
          memberCount,
          lastMessage,
          unread,
          messageCount,
        };
      });

      const processedGroups = await Promise.all(processedGroupsPromises);

      processedGroups.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;

        const timestampA = new Date(a.lastMessage.timestamp).getTime();
        const timestampB = new Date(b.lastMessage.timestamp).getTime();
        return timestampB - timestampA;
      });

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
