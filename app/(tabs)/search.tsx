import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { images } from "@/constants";

// Sample data for trending hashtags (exactly as in the image)
const TRENDING_HASHTAGS = [
  "#ScienceBreakthroughs",
  "#SportsDigest",
  "#TechUpdates",
  "#HealthInsights",
  "#WC90",
  "#WorldCup2023",
  "#ClimateAction",
  "#CryptoTrends",
  "#AIRevolution",
  "#SpaceExploration",
];

// Sample data for suggested creators (exactly as in the image)
const SUGGESTED_CREATORS = [
  {
    id: "1",
    name: "Dave Sulthan",
    username: "@davesulthan",
    avatar:
      "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
  },
  {
    id: "2",
    name: "Patricia Sanders",
    username: "@psanders",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
  },
  {
    id: "3",
    name: "James Hall",
    username: "@jameshall",
    avatar:
      "https://t4.ftcdn.net/jpg/06/08/55/73/360_F_608557356_ELcD2pwQO9pduTRL30umabzgJoQn5fnd.jpg",
  },
  {
    id: "4",
    name: "James Hall",
    username: "@jameshall",
    avatar:
      "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
  },
  {
    id: "5",
    name: "James Hall",
    username: "@jameshall",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
  },
];

const Search = () => {
  // Function to get initials from name
  const getInitials = (name: { split: (arg0: string) => any[][] }) => {
    return name
      .split(" ")
      .map((word: any[]) => word[0])
      .join("");
  };

  // Render item for creator list
  const renderCreator = ({ item }) => (
    <View className="items-center mr-6">
      {/* Gray circle with user avatar */}
      <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center mb-2">
        {item.avatar ? (
          <Image
            source={{ uri: item.avatar }}
            className="w-full h-full rounded-full"
          />
        ) : (
          <Text className="text-gray-600 text-lg">
            {getInitials(item.name)}
          </Text>
        )}
      </View>
      <Text className="text-lg font-medium text-center">{item.name}</Text>
      <Text className="text-sm text-gray-500 text-center">{item.username}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white ">
      <StatusBar barStyle="dark-content" />
      <View
        className="px-4 mt-4"
        style={{
          paddingTop:
            Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
        }}
      >
        {/* Header - What's happening? */}
        <Text className="text-3xl font-medium mb-4">What's happening?</Text>

        {/* Search Input - exact match to image */}
        <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-full px-4 h-12 mb-6">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-400"
            placeholder="Search in Nova News"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Trending Hashtags Section */}
        <View className="mb-6">
          <Text className="text-2xl font-medium my-4">Trending Hashtags</Text>

          {/* First row of hashtags */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            className="mb-3"
          >
            {TRENDING_HASHTAGS.slice(
              0,
              Math.ceil(TRENDING_HASHTAGS.length / 2)
            ).map((hashtag, index) => (
              <TouchableOpacity
                key={index}
                className="bg-gray-50 border border-gray-100 rounded-full px-5 py-2 mr-4"
              >
                <Text className="text-gray-800 text-lg">{hashtag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Second row of hashtags */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {TRENDING_HASHTAGS.slice(
              Math.ceil(TRENDING_HASHTAGS.length / 2)
            ).map((hashtag, index) => (
              <TouchableOpacity
                key={index}
                className="bg-gray-50 border border-gray-100 rounded-full px-5 py-2 mr-4"
              >
                <Text className="text-gray-800 text-lg">{hashtag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Suggested Creator Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-2xl font-medium mb-4">Suggested Creator</Text>
            <TouchableOpacity>
              <Text className="text-gray-500 text-sm">See all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={SUGGESTED_CREATORS}
            renderItem={renderCreator}
            keyExtractor={(item) => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Search;
