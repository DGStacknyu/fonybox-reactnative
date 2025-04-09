import { pb } from "@/components/pocketbaseClient";
import { getInitials } from "@/components/ProfileAvatar";
import { getRandomColor } from "@/hooks/useContacts";
import { useGlobalContext } from "@/context/AuthContext";
import { pbFileUrl } from "@/lib/getData/GetVideos";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

const Search = () => {
  const [loading, setLoading] = React.useState(false);
  const [contacts, setContacts] = React.useState<any[]>([]);
  const { user, isLogged } = useGlobalContext();
  const [userColors, setUserColors] = React.useState<{ [key: string]: string }>(
    {}
  );
  const [groups, setGroups] = React.useState<any[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const records = await pb.collection("users").getList(1, 10, {
          sort: "name",
        });

        const fetchedContacts = records.items
          .map((contactUser) => {
            const name =
              contactUser.name || `User ${contactUser.id.substring(0, 4)}`;
            const initial = name.charAt(0).toUpperCase();

            if (contactUser.id === user.id) return null;

            return {
              id: contactUser.id,
              name: name,
              initial: initial,
              status: contactUser.online ? "Online" : "Offline",
              collectionId: contactUser.collectionId,
              username: contactUser.username,
              avatar: contactUser.avatar,
            };
          })
          .filter((contact) => contact !== null);

        // Generate a color for each user
        const newUserColors = { ...userColors };
        fetchedContacts.forEach((contact) => {
          if (!newUserColors[contact.id]) {
            newUserColors[contact.id] = getRandomColor();
          }
        });
        setUserColors(newUserColors);

        setContacts(fetchedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        Alert.alert("Error", "Failed to load contacts");
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [isLogged, user, pb]);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const records = await pb.collection("groups").getList(1, 10, {
          sort: "name",
        });
        const fetchedGroups = records.items.map((group) => {
          const name = group.name || `Group ${group.id.substring(0, 4)}`;
          const initial = name.charAt(0).toUpperCase();
          return {
            id: group.id,
            name: name,
            initial: initial,
            description: group.description || "No description available",
            collectionId: group.collectionId,
            avatar: group.avatar,
          };
        });
        setGroups(fetchedGroups);
      } catch (error) {
        console.error("Error fetching groups:", error);
        Alert.alert("Error", "Failed to load groups");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const SUGGESTED_CREATORS = contacts.map((contact) => ({
    id: contact.id,
    name: contact.name,
    username: contact.username,
    avatar: contact.avatar
      ? pbFileUrl(contact.collectionId, contact.id, contact.avatar)
      : null,
    backgroundColor: userColors[contact.id] || getRandomColor(),
  }));

  const SUGGESTED_GROUPS = groups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    avatar: group.avatar
      ? pbFileUrl(group.collectionId, group.id, group.avatar)
      : null,
    backgroundColor: userColors[group.id] || getRandomColor(),
  }));

  const renderCreator = ({ item }: any) => (
    <TouchableOpacity onPress={() => router.push(`/user-profile/${item.id}`)}>
      <View className="items-center mr-6">
        <View className="w-32 h-32 rounded-full items-center justify-center mb-2">
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              className="w-full h-full rounded-full"
            />
          ) : (
            <View
              className="w-32 h-32 rounded-full items-center justify-center"
              style={{ backgroundColor: item.backgroundColor }}
            >
              <Text className="text-gray-700 font-bold text-3xl">
                {getInitials(item.name)}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-lg font-medium text-center">{item.name}</Text>
        <Text className="text-sm text-gray-500 text-center">
          {item.username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderGroup = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => router.push(`/(GroupChat)/${item.id}`)}
      className="flex-row items-center mb-4"
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: item.backgroundColor }}
      >
        <Text className="text-gray-700 font-bold text-xl">
          {getInitials(item.name)}
        </Text>
      </View>
      <View>
        <Text className="text-lg font-medium">{item.name}</Text>
        <Text className="text-sm text-gray-500">{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View
          className="px-4 mt-4"
          style={{
            paddingTop:
              Platform.OS === "android"
                ? (StatusBar.currentHeight || 0) + 10
                : 10,
          }}
        >
          <Text className="text-3xl font-medium mb-4">What's happening?</Text>

          <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-full px-4 h-12 mb-6">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-400"
              placeholder="Search in Nova News"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-6">
            <Text className="text-2xl font-medium my-4">Trending Hashtags</Text>

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

          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-2xl font-medium mb-4">
                Suggested Creator
              </Text>
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

          <View className="my-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-2xl font-medium mb-4">Public Groups</Text>
            </View>

            <FlatList
              data={SUGGESTED_GROUPS}
              renderItem={renderGroup}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Search;
