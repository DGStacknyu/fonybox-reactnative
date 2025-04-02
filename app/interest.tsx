import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const INTEREST = [
  {
    id: "1",
    title: "News & Current Events",
    tags: [
      "#BreakingNews",
      "#WorldEvents",
      "#Politics",
      "#GlobalAffairs",
      "#CurrentAffairs",
      "#LatestUpdates",
      "#InternationalNews",
      "#GovernmentPolicy",
      "#Democracy",
      "#ElectionCoverage",
    ],
  },
  {
    id: "2",
    title: "Technology",
    tags: [
      "#TechUpdates",
      "#AIRevolution",
      "#Blockchain",
      "#CodingLife",
      "#TechTrends",
      "#Cybersecurity",
      "#MachineLearning",
      "#DataScience",
      "#IoTDevices",
      "#DigitalTransformation",
    ],
  },
  {
    id: "3",
    title: "Science",
    tags: [
      "#ScienceBreakthroughs",
      "#SpaceExploration",
      "#ClimateScience",
      "#MedicalResearch",
      "#STEM",
      "#Biology",
      "#Physics",
      "#Astronomy",
      "#Robotics",
      "#GreenTech",
    ],
  },
  {
    id: "4",
    title: "Sports",
    tags: [
      "#SportsDigest",
      "#WC90",
      "#OlympicGames",
      "#F1Racing",
      "#Basketball",
      "#Football",
      "#Cricket",
      "#Tennis",
      "#Athletics",
      "#ExtremeAdventure",
    ],
  },
  {
    id: "5",
    title: "Health & Wellness",
    tags: [
      "#HealthInsights",
      "#WellnessTips",
      "#MentalHealth",
      "#Nutrition",
      "#FitnessGoals",
      "#Meditation",
      "#Yoga",
      "#SelfCare",
      "#HealthyLiving",
      "#MindBodyBalance",
    ],
  },
  {
    id: "6",
    title: "Entertainment",
    tags: [
      "#MovieReleases",
      "#TVShows",
      "#CelebrityNews",
      "#MusicTrends",
      "#StreamingNow",
      "#BookReviews",
      "#GameReviews",
      "#ArtExhibits",
      "#FestivalUpdates",
      "#ViralContent",
    ],
  },
];

const Interest = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const renderTag = (tag: string) => {
    const isSelected = selectedTags.includes(tag);

    return (
      <TouchableOpacity
        key={tag}
        className={`border rounded-full px-5 py-2 mr-3 ${
          isSelected
            ? "bg-red-400 border-red-400"
            : "bg-gray-50 border-gray-100"
        }`}
        onPress={() => toggleTag(tag)}
      >
        <Text
          className={`text-base ${isSelected ? "text-white" : "text-gray-800"}`}
        >
          {tag}
        </Text>
      </TouchableOpacity>
    );
  };

  const splitTagsIntoRows = (tags: string[]) => {
    const midpoint = Math.ceil(tags.length / 2);
    return {
      firstRow: tags.slice(0, midpoint),
      secondRow: tags.slice(midpoint),
    };
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View
          className="px-4 mt-4"
          style={{
            paddingTop:
              Platform.OS === "android"
                ? (StatusBar.currentHeight ?? 0) + 10
                : 10,
          }}
        >
          <Text className="text-3xl font-medium mb-4">
            Select your Interest
          </Text>

          {INTEREST.map((category) => {
            const { firstRow, secondRow } = splitTagsIntoRows(category.tags);

            return (
              <View key={category.id} className="mb-4 mt-4">
                <Text className="text-2xl font-medium mb-4">
                  {category.title}
                </Text>

                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  className="mb-3"
                >
                  {firstRow.map((tag) => renderTag(tag))}
                </ScrollView>

                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                >
                  {secondRow.map((tag) => renderTag(tag))}
                </ScrollView>
              </View>
            );
          })}
        </View>
        <View className="absolute bottom-8 left-5 right-5  items-center ">
          <TouchableOpacity
            className={`py-4 rounded-lg items-center w-2/3 ${
              selectedTags.length > 0 ? "bg-red-500" : "bg-red-300"
            }`}
            disabled={selectedTags.length === 0}
            onPress={() => router.push("/home")}
          >
            <Text className="text-white text-lg font-medium">Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Interest;
