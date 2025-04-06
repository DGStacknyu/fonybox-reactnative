import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export const AudioComment = ({
  comment,
  isReply,
  replyDepth = 0,
}: {
  comment: any;
  isReply: boolean;
  replyDepth?: number;
}) => {
  return (
    <View className={`flex-row ${isReply ? "ml-12 mt-3" : "mt-4"}`}>
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <View className="border-l-[1.5px] border-gray-200 absolute h-full left-6 top-12"></View>
      )}

      <View className="items-center">
        <View className="w-10 h-10 rounded-full bg-gray-200" />
      </View>

      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-bold text-base">{comment.username}</Text>
          <Text className="text-gray-500 text-xs">{comment.time}</Text>
        </View>

        <View className="flex-row items-center mt-2 mb-1">
          <TouchableOpacity className="bg-white border border-gray-200 rounded-full w-8 h-8 items-center justify-center mr-2 shadow-sm">
            <FontAwesome name="play" size={12} color="#333" />
          </TouchableOpacity>

          <Text className="text-xs text-gray-500 mr-2">
            {comment.audioDuration}
          </Text>

          <View className="flex-1 flex-row items-center h-6">
            {Array.from({ length: 50 }).map((_, i) => (
              <View
                key={i}
                className=" bg-gray-400 mx-[0.5px]"
                style={{
                  width: 2,
                  height: 4 + Math.floor(Math.random() * 30),
                }}
              />
            ))}
          </View>

          <View className="ml-2 bg-green-400 rounded-full w-8 h-8 items-center justify-center">
            <FontAwesome name="microphone" size={12} color="white" />
          </View>
        </View>

        <View className="flex-row mt-1 mb-1">
          <TouchableOpacity className="flex-row items-center mr-6">
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text className="text-gray-600 text-xs ml-1">
              {comment.replyCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center">
            <AntDesign name="heart" size={16} color="#666" />
            <Text className="text-gray-600 text-xs ml-1">{comment.likes}</Text>
          </TouchableOpacity>
        </View>

        {comment.replies && comment.replies.length > 0 && (
          <View className="mt-1">
            {comment.replies.map((reply: any) => (
              <AudioComment
                key={reply.id}
                comment={reply}
                isReply={true}
                replyDepth={replyDepth + 1}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};
