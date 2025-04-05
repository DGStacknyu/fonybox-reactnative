import React from "react";
import { Text, View } from "react-native";
import { VoiceMessage } from "@/components/chats/VoiceMessage";

export const GroupVoiceMessage = ({ message, setIsPlaying }: any) => {
  const isSent = message.isSent;

  return (
    <View
      className={`flex-row ${isSent ? "justify-end" : "justify-start"} py-1`}
    >
      <View className={`rounded-2xl px-3 max-w-[80%]`}>
        {!isSent && (
          <Text className="text-xs font-medium text-gray-600 mb-1">
            {message.sender?.name || "Unknown"}
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
