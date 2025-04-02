import EmptyState from "@/components/EmptyState";
import SearchInput from "@/components/SearchInput";
import VideoCard from "@/components/VideoCard";
import { pbFileUrl, searchVideos } from "@/lib/getData/GetVideos";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Search = () => {
  const { query } = useLocalSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      try {
        setLoading(true);
        setError("");
        const results = (await searchVideos(query)) as [];
        setSearchResults(results);
      } catch (err) {
        console.error("Error searching:", err);
        setError("Failed to load search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);
  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={searchResults}
        keyExtractor={(item: any) => item?.id}
        renderItem={({ item }: any) => (
          <VideoCard
            title={item.title}
            thumbnail={pbFileUrl(item.collectionId, item.id, item.thumbnail)}
            video={pbFileUrl(item.collectionId, item.id, item.video)}
            creator={item.creator}
            avatar={
              item.expand?.user?.avatar
                ? pbFileUrl(
                    "users",
                    item.expand.user.id,
                    item.expand.user.avatar
                  )
                : ""
            }
          />
        )}
        ListHeaderComponent={() => (
          <>
            <View className="flex my-6 px-4">
              <Text className="font-pmedium text-gray-100 text-sm">
                Search Results
              </Text>
              <Text className="text-2xl font-psemibold text-white mt-1">
                {query}
              </Text>

              <View className="mt-6 mb-8">
                <SearchInput initialQuery={query} />
              </View>
            </View>
          </>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this search query"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Search;
