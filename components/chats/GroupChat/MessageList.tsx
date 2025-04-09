// import React, { forwardRef } from "react";
// import { ActivityIndicator, ScrollView, Text, View } from "react-native";
// import { GroupVoiceMessage } from "./GroupVoiceMessage";

// export const MessageList = forwardRef(
//   (
//     { groupDetails, setIsPlaying, isUpdating, refreshControl }: any,
//     ref
//   ): any => {
//     return (
//       <View className="flex-1">
//         <ScrollView
//           refreshControl={refreshControl}
//           ref={ref}
//           className="flex-1 pt-3"
//           showsVerticalScrollIndicator={false}
//         >
//           {groupDetails.messages && groupDetails.messages.length > 0 ? (
//             groupDetails.messages.map((message: { id: any }) => (
//               <GroupVoiceMessage
//                 key={message.id}
//                 message={message}
//                 setIsPlaying={setIsPlaying}
//               />
//             ))
//           ) : (
//             <View className="flex-1 items-center justify-center py-10">
//               {groupDetails.isPlaceholder ? (
//                 <ActivityIndicator size="small" color="#F52936" />
//               ) : (
//                 <Text className="text-gray-500">No messages yet</Text>
//               )}
//             </View>
//           )}
//           <View className="h-5" />
//         </ScrollView>

//         {/* {isUpdating && (
//           <View className="absolute right-5 top-5">
//             <ActivityIndicator size="small" color="#F52936" />
//           </View>
//         )} */}
//       </View>
//     );
//   }
// );
import React, { forwardRef, useImperativeHandle } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { VoiceMessage } from "../VoiceMessage";

interface MessageListProps {
  groupDetails: any;
  setIsPlaying: (messageId: string, isPlaying: boolean) => void;
  isUpdating: boolean;
  refreshControl?: React.ReactElement;
}

export const MessageList = forwardRef<ScrollView, MessageListProps>(
  ({ groupDetails, setIsPlaying, isUpdating, refreshControl }, ref) => {
    const scrollViewRef = React.useRef<ScrollView>(null);

    // Forward the ref to parent components
    useImperativeHandle(ref, () => scrollViewRef.current!);

    if (!groupDetails?.messages) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F52936" />
        </View>
      );
    }

    if (groupDetails.messages.length === 0) {
      return (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.emptyContainer}
          refreshControl={refreshControl}
        >
          <Text style={styles.emptyText}>
            No messages yet. Send a voice message to start the conversation.
          </Text>
        </ScrollView>
      );
    }

    // Group messages by day
    const groupedMessages = groupDetails.messages.reduce(
      (groups: any, message: any) => {
        const date = new Date(message.created);
        const dateKey = date.toLocaleDateString();

        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }

        groups[dateKey].push(message);
        return groups;
      },
      {}
    );

    return (
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={styles.container}
        refreshControl={refreshControl}
      >
        {isUpdating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#F52936" />
          </View>
        )}

        {Object.keys(groupedMessages).map((dateKey) => (
          <View key={dateKey} style={styles.dateGroup}>
            {/* <View style={styles.dateHeaderContainer}>
              <Text style={styles.dateHeader}>{formatDateHeader(dateKey)}</Text>
            </View> */}

            {groupedMessages[dateKey].map((message: any) => (
              <View
                key={message.id}
                style={
                  message.isSent
                    ? styles.sentMessageContainer
                    : styles.receivedMessageContainer
                }
              >
                {!message.isSent && (
                  <View style={styles.senderInfo}>
                    <View
                      style={[
                        styles.avatarInitial,
                        {
                          backgroundColor: getAvatarColor(message.sender.id),
                        },
                      ]}
                    >
                      <Text style={styles.initialText}>
                        {message.sender.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.senderName}>{message.sender.name}</Text>
                  </View>
                )}

                {message.type === "voice" ? (
                  <VoiceMessage message={message} setIsPlaying={setIsPlaying} />
                ) : (
                  <TextMessage message={message} />
                )}
                {/* 
                <Text
                  style={
                    message.isSent
                      ? styles.sentTimestamp
                      : styles.receivedTimestamp
                  }
                >
                  {message.timestamp}
                </Text> */}
              </View>
            ))}
          </View>
        ))}

        <View style={{ height: 70 }} />
      </ScrollView>
    );
  }
);

// const formatDateHeader = (dateStr: string) => {
//   const today = new Date();
//   const yesterday = new Date(today);
//   yesterday.setDate(yesterday.getDate() - 1);

//   const date = new Date(dateStr);

//   if (date.toDateString() === today.toDateString()) {
//     return "Today";
//   } else if (date.toDateString() === yesterday.toDateString()) {
//     return "Yesterday";
//   } else {
//     return new Date(dateStr).toLocaleDateString("en-US", {
//       weekday: "long",
//       month: "long",
//       day: "numeric",
//     });
//   }
// };

const getAvatarColor = (id: string) => {
  const colors = ["#F0D3F7", "#E3F5FF", "#FFE8CC", "#D1F5D3", "#FFD6D6"];
  if (!id) return colors[0];

  const sumChars = id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[sumChars % colors.length];
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    padding: 10,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeaderContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  dateHeader: {
    backgroundColor: "#EDEDED",
    color: "#666",
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: "hidden",
  },
  sentMessageContainer: {
    alignSelf: "flex-end",
    maxWidth: "80%",
    marginVertical: 5,
  },
  receivedMessageContainer: {
    alignSelf: "flex-start",
    maxWidth: "80%",
    marginVertical: 5,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  avatarInitial: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  initialText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "bold",
  },
  senderName: {
    fontSize: 12,
    color: "#666",
  },
  sentTimestamp: {
    fontSize: 10,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  receivedTimestamp: {
    fontSize: 10,
    color: "#888",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  sentMessage: {
    backgroundColor: "#F52936",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: "100%",
  },
  receivedMessage: {
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: "100%",
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

interface TextMessageProps {
  message: {
    content: string;
    isSent: boolean;
  };
}

export const TextMessage = ({ message }: TextMessageProps) => {
  return (
    <View style={message.isSent ? styles.sentMessage : styles.receivedMessage}>
      <Text style={styles.messageText}>{message.content}</Text>
    </View>
  );
};
