import { useState, useRef, useEffect } from "react";
import { ResizeMode, Video } from "expo-av";
import * as Animatable from "react-native-animatable";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { icons } from "../constants";
import { pbFileUrl } from "@/lib/getData/GetVideos";

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1,
  },
};

const zoomOut = {
  0: {
    scale: 1,
  },
  1: {
    scale: 0.9,
  },
};

const TrendingItem = ({ activeItem, item }: any) => {
  const [play, setPlay] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const videoUrl = pbFileUrl(item.collectionId, item.id, item.video);

  const handlePlayPress = () => {
    if (!videoUrl) {
      Alert.alert("Error", "Video source not available");
      return;
    }
    setLoading(true);
    setPlay(true);
  };

  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.id ? zoomIn : zoomOut}
      duration={500}
    >
      {play ? (
        <View className="w-52 h-72 rounded-[33px] mt-3 overflow-hidden">
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode={ResizeMode.STRETCH}
            useNativeControls
            shouldPlay
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                setLoading(false);
              }
              if (status.didJustFinish) {
                setPlay(false);
              }
            }}
            onError={(error) => {
              console.error("Video error:", error);
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
              <Text className="text-white mt-2 font-medium">Loading...</Text>
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          className="relative flex justify-center items-center"
          activeOpacity={0.7}
          onPress={handlePlayPress}
        >
          <ImageBackground
            source={{
              uri: pbFileUrl(item.collectionId, item.id, item.thumbnail),
            }}
            className="w-52 h-72 rounded-[33px] my-5 overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          >
            <View className="flex-1 justify-center items-center">
              <Image
                source={icons.play}
                className="w-12 h-12"
                resizeMode="contain"
              />
            </View>
          </ImageBackground>
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const Trending = ({ posts }: any) => {
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    if (posts && posts.length > 0) {
      setActiveItem(posts[0].id);
    }
  }, [posts]);

  const viewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0 && viewableItems[0].item) {
      setActiveItem(viewableItems[0].item.id);
    }
  };

  if (!posts || posts.length === 0) {
    return <Text className="text-white">No trending posts available</Text>;
  }

  return (
    <FlatList
      data={posts}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170, y: 0 }}
    />
  );
};

export default Trending;
