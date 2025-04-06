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

const ProfileActions = ({
  userData,
  user,
  followStatus,
  isCurrentUser = false,
}: any) => {
  const { isFollowing, followLoading, handleFollow, canMessage } = isCurrentUser
    ? {
        isFollowing: false,
        followLoading: false,
        handleFollow: () => {},
        canMessage: () => false,
      }
    : useProfileActions(userData, user, followStatus);

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

  return (
    <View className="flex-row gap-5 mt-6">
      {canMessage() && (
        <TouchableOpacity
          className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
          onPress={() => router.push(`/(chat)/${userData.id}`)}
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
            {isFollowing
              ? followStatus === "accepted"
                ? "Following"
                : "Requested"
              : "Follow"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ProfileActions;
