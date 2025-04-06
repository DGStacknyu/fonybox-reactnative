// CommentsBottomSheet.tsx
import React, { useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import ProfileAvatar from "@/components/ProfileAvatar";
import { AudioComment } from "@/components/posts/AudioComments";
import { AUDIO_COMMENTS } from "@/constants/chats";
import { pbFileUrl } from "@/lib/getData/GetVideos";

const CommentsBottomSheet = ({ commentsSheetRef, user }: any) => {
  const snapPoints = ["75%", "100%"];

  const renderBackdrop = useCallback(
    (
      props: React.JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps
    ) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={commentsSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: "#999",
        width: 40,
        height: 4,
      }}
    >
      <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-200">
        <Text className="font-bold text-lg">Comments (23)</Text>
        <TouchableOpacity onPress={() => commentsSheetRef.current?.close()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingBottom: 100,
        }}
      >
        {AUDIO_COMMENTS.map((comment) => (
          <AudioComment isReply={false} key={comment.id} comment={comment} />
        ))}
      </BottomSheetScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 flex-row items-center">
        <ProfileAvatar
          imageUrl={
            user?.avatar
              ? pbFileUrl(user.collectionId, user.id, user.avatar)
              : null
          }
          name={user?.name || ""}
          size={32}
          textSizeClass="text-sm"
          className="mr-3"
        />
        <TouchableOpacity className="flex-1 bg-gray-100 rounded-full py-3 px-4 flex-row items-center">
          <FontAwesome name="microphone" size={20} color="#4ade80" />
          <Text className="text-gray-500 ml-2">Record an audio comment...</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

export default CommentsBottomSheet;
