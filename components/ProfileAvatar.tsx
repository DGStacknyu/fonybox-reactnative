import React, { useMemo } from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export const getRandomColor = () => {
  const colors = [
    "#F87171",
    "#FB923C",
    "#FBBF24",
    "#34D399",
    "#60A5FA",
    "#818CF8",
    "#A78BFA",
    "#F472B6",
  ];

  return colors[Math.floor(Math.random() * colors.length)];
};

export const getInitials = (name: string): string => {
  if (!name || typeof name !== "string") return "?";

  const nameParts = name.trim().split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  return (
    nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
  ).toUpperCase();
};

interface ProfileAvatarProps {
  imageUrl?: string | null;
  name?: string;
  size?: number;
  onPress?: () => void;
  showEditButton?: boolean;
  onEditPress?: () => void;
  backgroundColor?: string;
  textSizeClass?: string;
  className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imageUrl,
  name = "",
  size = 64,
  onPress,
  showEditButton = false,
  onEditPress,
  backgroundColor,
  textSizeClass = "text-2xl",
  className = "",
}) => {
  const userInitials = useMemo(() => getInitials(name), [name]);
  const avatarBgColor = useMemo(
    () => backgroundColor || getRandomColor(),
    [backgroundColor]
  );

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const AvatarComponent = () => (
    <View
      style={{ position: "relative", ...containerStyle }}
      className={className}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={containerStyle}
          className="bg-gray-200"
        />
      ) : (
        <View
          style={{ ...containerStyle, backgroundColor: avatarBgColor }}
          className="items-center justify-center"
        >
          <Text className={`text-white font-bold ${textSizeClass}`}>
            {userInitials}
          </Text>
        </View>
      )}

      {showEditButton && (
        <TouchableOpacity
          onPress={onEditPress}
          className="absolute bottom-0 right-0 bg-red-500 p-2 rounded-full"
          style={{
            padding: size > 80 ? 10 : size > 40 ? 8 : 6,
            right: -5,
            bottom: -5,
          }}
        >
          <FontAwesome
            name="camera"
            size={size > 80 ? 18 : size > 40 ? 14 : 10}
            color="white"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <AvatarComponent />
      </TouchableOpacity>
    );
  }

  return <AvatarComponent />;
};

export default ProfileAvatar;
