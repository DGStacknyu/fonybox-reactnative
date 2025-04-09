import PostCard from "@/components/posts/PostCard";
import SearchInput from "@/components/SearchInput";
import { useGlobalContext } from "@/context/AuthContext";
import { formatTimeAgo, getPosts } from "@/lib/get-post-data/post-fucntions";
import { pbFileUrl } from "@/lib/getData/GetVideos";
import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const AUDIO_COMMENTS = [
  {
    id: "1",
    username: "Abil wardani",
    avatar: "https://via.placeholder.com/100",
    time: "03:45PM",
    audioDuration: "01:11",
    replyCount: "3k",
    likes: "1.3k",
    replies: [
      {
        id: "1-1",
        username: "Abil wardani",
        avatar: "https://via.placeholder.com/100",
        time: "03:45PM",
        audioDuration: "01:11",
        replyCount: "3k",
        likes: "1.3k",
      },
      {
        id: "1-2",
        username: "Abil wardani",
        avatar: "https://via.placeholder.com/100",
        time: "03:45PM",
        audioDuration: "01:11",
        replyCount: "3k",
        likes: "1.3k",
      },
    ],
  },
  {
    id: "2",
    username: "Abil wardani",
    avatar: "https://via.placeholder.com/100",
    time: "03:45PM",
    audioDuration: "01:11",
    replyCount: "3k",
    likes: "1.3k",
    replies: [],
  },
  {
    id: "3",
    username: "Abil wardani",
    avatar: "https://via.placeholder.com/100",
    time: "03:45PM",
    audioDuration: "01:11",
    replyCount: "3k",
    likes: "1.3k",
    replies: [],
  },
];

// Single audio comment component
const AudioComment = ({
  comment,
  isReply,
  replyDepth = 0,
}: {
  comment: any;
  isReply: boolean;
  replyDepth?: number;
}) => {
  return (
    <View className={`flex-row ${isReply ? "ml-12 mt-3" : "mt-4"}`}>
      {/* Vertical line for threading */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <View className="border-l-[1.5px] border-gray-200 absolute h-full left-6 top-12"></View>
      )}

      {/* User avatar */}
      <View className="items-center">
        <View className="w-10 h-10 rounded-full bg-gray-200" />
      </View>

      <View className="flex-1 ml-3">
        {/* Username and timestamp */}
        <View className="flex-row items-center justify-between">
          <Text className="font-bold text-base">{comment.username}</Text>
          <Text className="text-gray-500 text-xs">{comment.time}</Text>
        </View>

        {/* Audio player UI */}
        <View className="flex-row items-center mt-2 mb-1">
          {/* Play button */}
          <TouchableOpacity className="bg-white border border-gray-200 rounded-full w-8 h-8 items-center justify-center mr-2 shadow-sm">
            <FontAwesome name="play" size={12} color="#333" />
          </TouchableOpacity>

          {/* Audio duration */}
          <Text className="text-xs text-gray-500 mr-2">
            {comment.audioDuration}
          </Text>

          {/* Audio waveform visualization */}
          <View className="flex-1 flex-row items-center h-6">
            {Array.from({ length: 30 }).map((_, i) => (
              <View
                key={i}
                className="bg-gray-400 mx-[0.5px]"
                style={{
                  width: 2,
                  height: 4 + Math.floor(Math.random() * 30),
                }}
              />
            ))}
          </View>

          {/* Microphone icon */}
          <View className="ml-2 bg-green-400 rounded-full w-8 h-8 items-center justify-center">
            <FontAwesome name="microphone" size={12} color="white" />
          </View>
        </View>

        {/* Comment actions */}
        <View className="flex-row mt-1 mb-1">
          <TouchableOpacity className="flex-row items-center mr-6">
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text className="text-gray-600 text-xs ml-1">
              {comment.replyCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center">
            <AntDesign name="heart" size={16} color="#666" />
            <Text className="text-gray-600 text-xs ml-1">{comment.likes}</Text>
          </TouchableOpacity>
        </View>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <View className="mt-1">
            {comment.replies.map((reply: any) => (
              <AudioComment
                key={reply.id}
                comment={reply}
                isReply={true}
                replyDepth={replyDepth + 1}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const Home = () => {
  const { user } = useGlobalContext();
  const commentsSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["75%", "100%"], []);

  const [posts, setPosts] = useState<
    {
      imageUrl: string | null;
      audioUrl: string | null;
      avatar: string;
      username: any;
      timeAgo: string;
      likes: any;
      shares: number;
      collectionId: string;
      collectionName: string;
      expand?: { [key: string]: any };
      id: string;
      userId: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const handleOpenComments = useCallback(() => {
    commentsSheetRef.current?.snapToIndex(0);
  }, []);

  const loadPosts = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setIsLoading(true);
      }

      const postsData = await getPosts({
        page: pageNum,
        perPage: 15,
        userId: user?.id,
      });

      const filteredPosts = postsData.items.filter(
        (post) => post.user !== user?.id
      );

      const processedPosts = filteredPosts.map((post) => ({
        ...post,
        userId: post.userId || "",
        isLiked: post.isLiked || false,
        isSaved: post.isSaved || false,
        likes: post.likes || 0,
        shares: post.shares || 0,
        imageUrl: post.imageUrl || null,
        audioUrl: post.audioUrl || null,
        avatar: post.expand?.user?.avatar
          ? pbFileUrl("users", post.expand.user.id, post.expand.user.avatar)
          : "https://via.placeholder.com/100",
        username: post.expand?.user?.name || "Unknown User",
        timeAgo: formatTimeAgo(new Date(post.created)),
      }));

      if (refresh || pageNum === 1) {
        setPosts(processedPosts);
      } else {
        setPosts((prev) => [...prev, ...processedPosts]);
      }

      const shouldLoadMore =
        filteredPosts.length < 5 && hasMore && pageNum < postsData.totalPages;

      if (shouldLoadMore) {
        setTimeout(() => {
          loadPosts(pageNum + 1, false);
        }, 300);
      } else {
        setHasMore(postsData.totalPages > pageNum);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadPosts(page + 1);
    }
  };

  const handleSheetChanges = useCallback((index: any) => {
    console.log("handleSheetChanges", index);
  }, []);

  const renderBackdrop = useCallback(
    (
      props: React.JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps
    ) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const handlePostUpdated = useCallback(() => {
    loadPosts(1, true);
  }, []);

  const renderPostItem = ({ item }: any) => (
    <View className="px-5">
      <PostCard
        post={{
          ...item,
          id: item.id,
          avatar: item.avatar,
          username: item.username,
          timeAgo: item.timeAgo,
          caption: item.caption,
          imageUrl: item.imageUrl,
          audioUrl: item.audioUrl,
          duration: item.duration,
          likes: item.likes,
          shares: item.shares,
          isLiked: item.isLiked,
          isSaved: item.isSaved,
        }}
        onOpenComments={handleOpenComments}
        onPostUpdated={handlePostUpdated}
      />
    </View>
  );

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{ flex: 1 }}>
        <View className="bg-white">
          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={() => (
              <View className="flex py-10 bg-[#F52936]  space-y-10 rounded-b-xl">
                <View className="flex justify-between items-start flex-row mb-6 px-4">
                  <View>
                    <Text className="text-2xl font-pmedium text-white">
                      FonyBox
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <TouchableOpacity
                      onPress={() => router.push("/notifications")}
                      // onPress={() => router.push("/storytelling")}
                    >
                      <View className="relative">
                        <Ionicons
                          name="notifications-outline"
                          size={24}
                          color="white"
                        />
                        <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white items-center justify-center">
                          <Text className="text-black text-xs">1</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/(chat)")}>
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={28}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="flex-row px-3 mt-4">
                  <TouchableOpacity onPress={() => router.push("/profile")}>
                    <View className="bg-gray-50 rounded-full h-12 w-12 items-center justify-center p-2">
                      <FontAwesome5 name="user-alt" size={25} color="gray" />
                    </View>
                  </TouchableOpacity>
                  <SearchInput />
                  <TouchableOpacity>
                    <View className="bg-gray-50 rounded-full h-12 w-12 items-center justify-center p-2">
                      <FontAwesome
                        name="microphone"
                        size={30}
                        color="#4ade80"
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Platform.select({
                ios: 50,
                android: 70,
              }),
            }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListFooterComponent={
              isLoading && !refreshing ? (
                <ActivityIndicator
                  size="small"
                  color="#F52936"
                  style={{ marginVertical: 20 }}
                />
              ) : null
            }
            ListEmptyComponent={
              !isLoading ? (
                <View className="flex items-center justify-center py-20">
                  <Text className="text-gray-500">
                    No posts from other users found
                  </Text>
                  <Text className="text-gray-400 mt-2 text-center px-10">
                    Follow more users to see their posts in your feed
                  </Text>
                </View>
              ) : null
            }
          />

          <BottomSheet
            ref={commentsSheetRef}
            index={-1}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose={true}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{
              backgroundColor: "#999",
              width: 40,
              height: 4,
            }}
          >
            <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-200">
              <Text className="font-bold text-lg">Comments (23)</Text>
              <TouchableOpacity
                onPress={() => commentsSheetRef.current?.close()}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <BottomSheetScrollView
              contentContainerStyle={{
                paddingHorizontal: 15,
                paddingBottom: 100,
              }}
            >
              {AUDIO_COMMENTS.map((comment) => (
                <AudioComment
                  isReply={false}
                  key={comment.id}
                  comment={comment}
                />
              ))}
            </BottomSheetScrollView>

            <View className="absolute bottom-10 left-0 right-0 p-3 bg-white border-t border-gray-200 flex-row items-center">
              <Image
                source={{ uri: "https://via.placeholder.com/100" }}
                className="w-8 h-8 rounded-full mr-3 bg-gray-200"
              />
              <TouchableOpacity className="flex-1 bg-gray-100 rounded-full py-3 px-4 flex-row items-center">
                <FontAwesome name="microphone" size={20} color="#4ade80" />
                <Text className="text-gray-500 ml-2">
                  Record an audio comment...
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheet>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Home;
