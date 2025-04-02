import { useState } from "react";
import { ResizeMode, Video } from "expo-av";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";

import { icons } from "../constants";

const VideoCard = ({ title, creator, avatar, thumbnail, video }: any) => {
  const [play, setPlay] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlayPress = () => {
    setLoading(true);
    setPlay(true);
  };

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {creator}
            </Text>
          </View>
        </View>
        <View className="pt-2">
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>

      <View className="w-full h-60 rounded-xl mt-3 overflow-hidden">
        {play ? (
          <>
            <Video
              source={{ uri: video }}
              style={{ width: "100%", height: "100%" }}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              shouldPlay
              onPlaybackStatusUpdate={(status) => {
                if (status?.isLoaded) {
                  setLoading(false);
                }
                if (status?.didJustFinish) {
                  setPlay(false);
                }
              }}
              onError={(error) => {
                console.log("Video error:", error);
                Alert.alert("Error", "Failed to play video");
                setLoading(false);
                setPlay(false);
              }}
              onLoad={() => {
                setLoading(false);
              }}
            />
            {loading && (
              <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex justify-center items-center">
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text className="text-white mt-2 font-psemibold">
                  Loading...
                </Text>
              </View>
            )}
          </>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePlayPress}
            className="w-full h-full relative flex justify-center items-center"
          >
            <Image
              source={{ uri: thumbnail }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <Image
              source={icons.play}
              className="w-12 h-12 absolute"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default VideoCard;
