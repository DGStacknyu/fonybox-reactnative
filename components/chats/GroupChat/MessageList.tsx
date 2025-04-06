import React, { forwardRef } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { GroupVoiceMessage } from "./GroupVoiceMessage";

export const MessageList = forwardRef(
  ({ groupDetails, setIsPlaying, isUpdating }: any, ref): any => {
    return (
      <View className="flex-1">
        <ScrollView
          ref={ref}
          className="flex-1 pt-3"
          showsVerticalScrollIndicator={false}
        >
          {groupDetails.messages && groupDetails.messages.length > 0 ? (
            groupDetails.messages.map((message: { id: any }) => (
              <GroupVoiceMessage
                key={message.id}
                message={message}
                setIsPlaying={setIsPlaying}
              />
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-10">
              {groupDetails.isPlaceholder ? (
                <ActivityIndicator size="small" color="#F52936" />
              ) : (
                <Text className="text-gray-500">No messages yet</Text>
              )}
            </View>
          )}
          <View className="h-5" />
        </ScrollView>

        {isUpdating && (
          <View className="absolute right-5 top-5">
            <ActivityIndicator size="small" color="#F52936" />
          </View>
        )}
      </View>
    );
  }
);
