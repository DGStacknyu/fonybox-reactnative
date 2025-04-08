// import React from "react";
// import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
// import { router } from "expo-router";
// import { useProfileActions } from "@/hooks/userProfileData";

// const ProfileActions = ({ userData, user, followStatus }: any) => {
//   const { isFollowing, followLoading, handleFollow, canMessage } =
//     useProfileActions(userData, user, followStatus);

//   if (user.id === userData.id) {
//     return (
//       <View className="flex-row gap-5 mt-6">
//         <TouchableOpacity
//           className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
//           onPress={() => router.push("/edit-profile")}
//         >
//           <Text className="text-gray-700 font-semibold">Edit Profile</Text>
//         </TouchableOpacity>
//         <TouchableOpacity className="flex-1 bg-gray-200 rounded-lg py-3 items-center">
//           <Text className="font-medium text-gray-700">Share Profile</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-row gap-5 mt-6">
//       {canMessage() && (
//         <TouchableOpacity
//           className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
//           onPress={() => router.push(`/(chat)/${userData.id}`)}
//         >
//           <Text className="text-gray-700 font-semibold">Message</Text>
//         </TouchableOpacity>
//       )}

//       <TouchableOpacity
//         className={`flex-1 rounded-lg py-3 items-center ${
//           isFollowing ? "bg-white border border-red-500" : "bg-red-500"
//         }`}
//         onPress={handleFollow}
//         disabled={followLoading}
//       >
//         {followLoading ? (
//           <ActivityIndicator
//             size="small"
//             color={isFollowing ? "#EF4444" : "#FFFFFF"}
//           />
//         ) : (
//           <Text
//             className={`font-medium ${
//               isFollowing ? "text-red-500" : "text-white"
//             }`}
//           >
//             {isFollowing
//               ? followStatus === "accepted"
//                 ? "Following"
//                 : "Requested"
//               : "Follow"}
//           </Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default ProfileActions;
import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useProfileActions } from "@/hooks/userProfileData";
import { createNewChat, getChatId } from "@/lib/get-chat-data/get-private-chat";

const ProfileActions = ({
  userData,
  user,
  followStatus,
  isCurrentUser = false,
}: any) => {
  console.log("Follow status passed to component:", followStatus);

  const handleMessagePress = async () => {
    try {
      let chatId = await getChatId(user.id, userData.id);
      if (!chatId) {
        chatId = await createNewChat(user.id, userData.id);
      }
      router.push(`/(chat)/${chatId}`);
    } catch (error) {
      console.error("Error navigating to chat:", error);
    }
  };

  const {
    isFollowing,
    followLoading,
    handleFollow,
    canMessage,
    followStatus: currentFollowStatus,
  } = isCurrentUser
    ? {
        isFollowing: false,
        followLoading: false,
        handleFollow: () => {},
        canMessage: () => false,
        followStatus: null,
      }
    : useProfileActions(userData, user, followStatus);

  console.log("Current follow status in component:", currentFollowStatus);
  console.log("Is following state:", isFollowing);

  if (isCurrentUser || user.id === userData.id) {
    return (
      <View className="flex-row gap-5 mt-6">
        <TouchableOpacity
          className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
          onPress={() => router.push("/edit-profile")}
        >
          <Text className="text-gray-700 font-semibold">Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-gray-200 rounded-lg py-3 items-center">
          <Text className="font-medium text-gray-700">Share Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getButtonText = () => {
    if (currentFollowStatus === "accepted") return "Following";
    if (currentFollowStatus === "pending") return "Requested";
    if (isFollowing && !currentFollowStatus) return "Following";
    return "Follow";
  };

  return (
    <View className="flex-row gap-5 mt-6">
      {canMessage() && (
        <TouchableOpacity
          className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
          onPress={handleMessagePress}
        >
          <Text className="text-gray-700 font-semibold">Message</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        className={`flex-1 rounded-lg py-3 items-center ${
          isFollowing ? "bg-white border border-red-500" : "bg-red-500"
        }`}
        onPress={handleFollow}
        disabled={followLoading}
      >
        {followLoading ? (
          <ActivityIndicator
            size="small"
            color={isFollowing ? "#EF4444" : "#FFFFFF"}
          />
        ) : (
          <Text
            className={`font-medium ${
              isFollowing ? "text-red-500" : "text-white"
            }`}
          >
            {getButtonText()}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ProfileActions;
