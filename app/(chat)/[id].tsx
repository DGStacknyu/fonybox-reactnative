import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { pb } from "@/components/pocketbaseClient";
import { useGlobalContext } from "@/lib/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { RecordingButton } from "@/components/chats/GroupChat/RecordingButton";
import { RecordModel } from "pocketbase";
import { MessageList } from "@/components/chats/private/MessageList";
import { PrivateChatHeader } from "@/components/chats/private/PrivateChatHeader";
import { usePrivateRecording } from "@/hooks/usePrivateRecording";

const PrivateChatDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chatDetails, setChatDetails] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useGlobalContext();
  const [otherUser, setOtherUser] = useState<RecordModel | null>(null);

  const {
    isRecording,
    isUploading,
    recordingDuration,
    handleRecordButtonPress,
  } = usePrivateRecording(id, user.id, setChatDetails, scrollViewRef);

  useEffect(() => {
    const loadChatData = async () => {
      if (!id) return;

      try {
        setIsUpdating(true);
        const chatRecord = await pb
          .collection("private_chats")
          .getOne(id as string);

        const otherUserId =
          chatRecord.user1 === user.id ? chatRecord.user2 : chatRecord.user1;

        const otherUserRecord = await pb
          .collection("users")
          .getOne(otherUserId);

        setOtherUser(otherUserRecord);

        const messagesResponse = await pb
          .collection("private_messages")
          .getList(1, 50, {
            filter: `chat="${id}"`,
            sort: "created",
            expand: "sender",
          });

        const formattedMessages = messagesResponse.items.map((msg) => ({
          id: msg.id,
          type: msg.audio_file ? "voice" : "text",
          content: msg.content,
          audio_url: msg.audio_file
            ? pb.files.getUrl(msg, msg.audio_file)
            : null,
          created: msg.created,
          isSent: msg.sender === user.id,
          isPlaying: false,
          duration: msg.metadata?.durationSeconds
            ? `${Math.floor(msg.metadata.durationSeconds / 60)}:${(
                msg.metadata.durationSeconds % 60
              )
                .toString()
                .padStart(2, "0")}`
            : "0:00",
          timestamp: new Date(msg.created).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: {
            id: msg.sender,
            name:
              msg.sender === user.id ? "Me" : otherUserRecord.name || "User",
          },
          read: msg.read,
        }));

        const conversationData = {
          id: chatRecord.id,
          user: {
            id: otherUserRecord.id,
            name: otherUserRecord.name || "User",
            initial: (otherUserRecord.name || "U")[0].toUpperCase(),
            status: "Online",
            color: otherUserRecord.color || "#F52936",
          },
          messages: formattedMessages,
        };

        setChatDetails(conversationData);

        // Mark unread messages as read
        const unreadMessages = messagesResponse.items.filter(
          (msg) => !msg.read && msg.sender !== user.id
        );

        for (const msg of unreadMessages) {
          try {
            await pb.collection("private_messages").update(msg.id, {
              read: true,
              read_at: new Date().toISOString(),
            });
          } catch (err) {
            console.error("Error marking message as read:", err);
          }
        }

        setIsUpdating(false);
      } catch (err) {
        console.error("Error loading chat data:", err);
        setError("Failed to load chat details");
        setIsUpdating(false);
      }
    };

    loadChatData();
  }, [id, user.id]);

  useEffect(() => {
    if (!id) return;

    // Subscribe to new messages
    const messagesSubscription = pb
      .collection("private_messages")
      .subscribe("*", async ({ action, record }) => {
        if (action === "create" && record.chat === id) {
          // Fetch the sender's info if needed
          let senderName = "User";
          if (record.sender === user.id) {
            senderName = "Me";
          } else if (otherUser) {
            senderName = otherUser.name || "User";
          }

          const newMessage = {
            id: record.id,
            type: record.audio_file ? "voice" : "text",
            content: record.content,
            audio_url: record.audio_file
              ? pb.files.getUrl(record, record.audio_file)
              : null,
            created: record.created,
            isSent: record.sender === user.id,
            isPlaying: false,
            duration: record.metadata?.durationSeconds
              ? `${Math.floor(record.metadata.durationSeconds / 60)}:${(
                  record.metadata.durationSeconds % 60
                )
                  .toString()
                  .padStart(2, "0")}`
              : "0:00",
            timestamp: new Date(record.created).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            sender: {
              id: record.sender,
              name: senderName,
            },
            read: record.read,
          };

          setChatDetails((prev: { messages: any }) => {
            if (!prev) return null;
            return {
              ...prev,
              messages: [...prev.messages, newMessage],
            };
          });

          // Mark message as read if it's from the other user
          if (record.sender !== user.id && !record.read) {
            try {
              await pb.collection("private_messages").update(record.id, {
                read: true,
                read_at: new Date().toISOString(),
              });
            } catch (err) {
              console.error("Error marking message as read:", err);
            }
          }

          setTimeout(() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }
          }, 100);
        }
      });

    return () => {
      pb.collection("private_messages").unsubscribe();
    };
  }, [id, user.id, otherUser]);

  useEffect(() => {
    if (chatDetails?.messages?.length > 0) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: false });
        }
      }, 100);
    }
  }, [chatDetails?.messages?.length]);

  const setIsPlaying = (messageId: string, isPlaying: boolean) => {
    console.log(
      `Message ${messageId} is now ${isPlaying ? "playing" : "paused"}`
    );
    if (chatDetails) {
      const updatedMessages = chatDetails.messages.map((msg: { id: string }) =>
        msg.id === messageId
          ? { ...msg, isPlaying }
          : { ...msg, isPlaying: false }
      );

      const updatedDetails = {
        ...chatDetails,
        messages: updatedMessages,
      };

      setChatDetails(updatedDetails);
    }
  };

  if (error && !chatDetails) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>{error || "Chat not found"}</Text>
        <TouchableOpacity
          className="mt-4 px-4 py-2 bg-[#F52936] rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!chatDetails) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Loading chat...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <PrivateChatHeader chatDetails={chatDetails} />

      <MessageList
        ref={scrollViewRef}
        chatDetails={chatDetails}
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

export default PrivateChatDetailScreen;
