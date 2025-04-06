// import React from "react";
// import { View, Text } from "react-native";
// import { FontAwesome } from "@expo/vector-icons";
// import ProfileAvatar from "@/components/ProfileAvatar";
// import { pbFileUrl } from "@/lib/getData/GetVideos";

// const ProfileHeader = ({ userData }: any) => {
//   const isPublicAccount = userData.account_type === "public";

//   const getAvatarUrl = () => {
//     if (
//       !userData ||
//       !userData.avatar ||
//       !userData.collectionId ||
//       !userData.id
//     ) {
//       return null;
//     }
//     return pbFileUrl(userData.collectionId, userData.id, userData.avatar);
//   };

//   const avatarUrl = getAvatarUrl();

//   return (
//     <View className="flex flex-row gap-10 items-center mt-4 mb-2">
//       <ProfileAvatar
//         imageUrl={avatarUrl}
//         name={userData.name}
//         size={128}
//         textSizeClass="text-4xl"
//       />

//       <View className="gap-y-3">
//         <Text className="text-xl font-bold">{userData?.name}</Text>
//         <Text className="text-gray-500 ">@{userData?.username}</Text>
//         <View className="flex-row items-center">
//           <View
//             className={`w-3 h-3 rounded-full mr-2 ${
//               userData.isOnline ? "bg-green-500" : "bg-gray-400"
//             }`}
//           />
//           <Text className="text-gray-700">
//             {userData.isOnline ? "Online" : "Offline"}
//           </Text>
//         </View>
//         {isPublicAccount && (
//           <View className="flex-row items-center mt-1">
//             <FontAwesome name="globe" size={14} color="#999" className="mr-1" />
//             <Text className="text-gray-500 text-xs">Public Account</Text>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// export default ProfileHeader;
import React, { useMemo } from "react";
import { View, Text, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import ProfileAvatar from "@/components/ProfileAvatar";
import { pbFileUrl } from "@/lib/getData/GetVideos";

// Helper functions for current user profile
export const getRandomColor = (): string => {
  const colors = [
    "#F0D3F7", // Light Purple
    "#EEEEEE", // Light Gray
    "#E3F5FF", // Light Blue
    "#FFE8CC", // Light Orange
    "#E0FFE0", // Light Green
    "#D3E5FF", // Light Blue
    "#FFECDA", // Light Peach
    "#E5E5FF", // Light Lavender
    "#FFE8E8", // Light Pink
    "#D9F2D9", // Light Mint
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Function to get initials from user name
const getInitials = (name: string): string => {
  if (!name) return "?";

  const nameParts = name.trim().split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  return (
    nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
  ).toUpperCase();
};

const ProfileHeader = ({ userData, isCurrentUser = false }: any) => {
  const isPublicAccount = !isCurrentUser && userData?.account_type === "public";
  const backgroundColor = useMemo(() => getRandomColor(), []);
  const userInitials = useMemo(
    () => getInitials(userData?.name || ""),
    [userData?.name]
  );

  const hasAvatar = userData?.avatar && userData?.collectionId && userData?.id;

  // Get avatar URL - different implementation for different profile types
  const getAvatarUrl = () => {
    if (!hasAvatar) return null;
    return pbFileUrl(userData.collectionId, userData.id, userData.avatar);
  };

  const avatarUrl = getAvatarUrl();

  return (
    <View className="flex flex-row gap-10 items-center mt-4 mb-2">
      {isCurrentUser ? (
        // Current user profile avatar handling
        hasAvatar ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-32 h-32 rounded-full bg-gray-200"
          />
        ) : (
          <View
            className="w-32 h-32 rounded-full items-center justify-center"
            style={{ backgroundColor }}
          >
            <Text className="text-gray-700 font-bold text-4xl">
              {userInitials}
            </Text>
          </View>
        )
      ) : (
        // Other user profile avatar handling
        <ProfileAvatar
          imageUrl={avatarUrl}
          name={userData?.name || ""}
          size={128}
          textSizeClass="text-4xl"
        />
      )}

      <View className="gap-y-3">
        <Text className="text-xl font-bold">{userData?.name}</Text>

        {isCurrentUser ? (
          // Current user profile specific details
          <>
            <Text className="text-gray-500">{userData?.location}</Text>
            <Text className="text-gray-700">{userData?.tags}</Text>
          </>
        ) : (
          // Other user profile specific details
          <>
            <Text className="text-gray-500">@{userData?.username}</Text>
            <View className="flex-row items-center">
              <View
                className={`w-3 h-3 rounded-full mr-2 ${
                  userData?.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <Text className="text-gray-700">
                {userData?.isOnline ? "Online" : "Offline"}
              </Text>
            </View>
            {isPublicAccount && (
              <View className="flex-row items-center mt-1">
                <FontAwesome
                  name="globe"
                  size={14}
                  color="#999"
                  className="mr-1"
                />
                <Text className="text-gray-500 text-xs">Public Account</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default ProfileHeader;
