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
import ProfileAvatar, { getInitials } from "@/components/ProfileAvatar";
import { pbFileUrl } from "@/lib/getData/GetVideos";
import { getRandomColor } from "@/hooks/useContacts";

const ProfileHeader = ({ userData, isCurrentUser = false }: any) => {
  const isPublicAccount = !isCurrentUser && userData?.account_type === "public";
  const backgroundColor = useMemo(() => getRandomColor(), []);
  const userInitials = useMemo(
    () => getInitials(userData?.name || ""),
    [userData?.name]
  );

  const hasAvatar = userData?.avatar && userData?.collectionId && userData?.id;

  const getAvatarUrl = () => {
    if (!hasAvatar) return null;
    return pbFileUrl(userData.collectionId, userData.id, userData.avatar);
  };

  const avatarUrl = getAvatarUrl() || "";

  return (
    <View className="flex flex-row gap-10 items-center mt-4 mb-2">
      {isCurrentUser ? (
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
          <>
            <Text className="text-gray-500">{userData?.location}</Text>
            <Text className="text-gray-700">{userData?.tags}</Text>
          </>
        ) : (
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
