// import React from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import { router } from "expo-router";

// const ProfileStats = ({ userData }: any) => {
//   return (
//     <View className="flex-row justify-between mt-6">
//       <TouchableOpacity className="items-center flex-1">
//         <Text className="text-gray-500 text-sm">Posts</Text>
//         <Text className="text-xl font-bold">{userData.postCount || 0}</Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         className="items-center flex-1"
//         onPress={() => router.push(`/(stats)/followers/${userData.id}`)}
//       >
//         <Text className="text-gray-500 text-sm">Followers</Text>
//         <Text className="text-xl font-bold">{userData.followerCount || 0}</Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         className="items-center flex-1"
//         onPress={() => router.push(`/following/${userData.id}`)}
//       >
//         <Text className="text-gray-500 text-sm">Following</Text>
//         <Text className="text-xl font-bold">
//           {userData.followingCount || 0}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default ProfileStats;
// ProfileStats.tsx (Fixed)
import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";

const ProfileStats = ({
  userData,
  loading = false,
  isCurrentUser = false,
}: any) => {
  const handleNavigateToFollowers = () => {
    if (!userData?.id) return;
    router.push(`/(stats)/followers/${userData.id}`);
  };

  // Handler to navigate to the following screen
  const handleNavigateToFollowing = () => {
    if (!userData?.id) return;
    router.push(`/(stats)/following/${userData.id}`);
  };

  return (
    <View className="flex-row justify-between mt-6">
      <View className="items-center flex-1">
        <Text className="text-gray-500 text-sm">Posts</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#999" />
        ) : (
          <Text className="text-xl font-bold">
            {isCurrentUser ? userData?.posts : userData?.postCount || 0}
          </Text>
        )}
      </View>

      <TouchableOpacity
        className="items-center flex-1"
        onPress={handleNavigateToFollowers}
      >
        <Text className="text-gray-500 text-sm">Followers</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#999" />
        ) : (
          <Text className="text-xl font-bold">
            {isCurrentUser ? userData?.followers : userData?.followerCount || 0}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center flex-1"
        onPress={handleNavigateToFollowing}
      >
        <Text className="text-gray-500 text-sm">Following</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#999" />
        ) : (
          <Text className="text-xl font-bold">
            {isCurrentUser
              ? userData?.following
              : userData?.followingCount || 0}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ProfileStats;
