import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const RecordingButton = ({
  isRecording,
  isUploading,
  recordingDuration,
  onPress,
}: any) => {
  return (
    <View className="py-2.5 pt-5 px-5 items-center bg-white border-t border-[#EEEEEE]">
      {isUploading ? (
        <View className="w-20 h-20 rounded-full bg-[#F52936] items-center justify-center shadow-md">
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : (
        <TouchableOpacity
          className={`w-20 h-20 rounded-full ${
            isRecording ? "bg-red-700" : "bg-[#F52936]"
          } items-center justify-center shadow-md`}
          onPress={onPress}
          disabled={isUploading}
        >
          <Ionicons
            name={isRecording ? "stop" : "mic"}
            size={40}
            color="white"
          />
        </TouchableOpacity>
      )}
      {isRecording && (
        <View>
          <Text className="mt-2 text-center text-red-500">Recording...</Text>
          <Text className="text-center text-gray-600">
            {Math.floor(recordingDuration / 60)}:
            {(recordingDuration % 60).toString().padStart(2, "0")}
          </Text>
        </View>
      )}
    </View>
  );
};
