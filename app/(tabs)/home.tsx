// import EmptyState from "@/components/EmptyState";
// import SearchInput from "@/components/SearchInput";
// import Trending from "@/components/Trending";
// import VideoCard from "@/components/VideoCard";
// import { images } from "@/constants";
// import {
//   getVideos,
//   getTrendingVideos,
//   pbFileUrl,
// } from "@/lib/getData/GetVideos";
// import { AntDesign, Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import { RecordModel } from "pocketbase";
// import { useState, useEffect } from "react";
// import {
//   FlatList,
//   Image,
//   RefreshControl,
//   Text,
//   View,
//   ActivityIndicator,
//   Button,
//   TouchableOpacity,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const Home = () => {
//   const [refreshing, setRefreshing] = useState(false);
//   const [videos, setVideos] = useState<RecordModel[]>([]);
//   const [trending, setTrending] = useState<RecordModel[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       const fetchedVideos = await getVideos();
//       setVideos(fetchedVideos);

//       const fetchedTrending = await getTrendingVideos();
//       setTrending(fetchedTrending);
//     } catch (err) {
//       setError("Failed to load videos");
//       console.error("Error in fetchData:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchData();
//     setRefreshing(false);
//   };

//   if (loading && videos.length === 0) {
//     return (
//       <SafeAreaView className="bg-primary h-screen flex items-center justify-center">
//         <ActivityIndicator size="large" color="#ffffff" />
//         <Text className="text-white mt-4">Loading videos...</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="bg-primary h-screen">
//       {error ? (
//         <View className="flex items-center justify-center h-full">
//           <Text className="text-white text-lg">{error}</Text>
//           <Text className="text-white mt-2 px-4 text-center">
//             There was a problem connecting to the database. Pull down to
//             refresh.
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={videos}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             <VideoCard
//               title={item.title}
//               thumbnail={pbFileUrl(item.collectionId, item.id, item.thumbnail)}
//               video={pbFileUrl(item.collectionId, item.id, item.video)}
//               creator={item.creator || "Unknown Creator"}
//               avatar={
//                 item.expand?.user?.avatar
//                   ? pbFileUrl(
//                       "users",
//                       item.expand.user.id,
//                       item.expand.user.avatar
//                     )
//                   : ""
//               }
//               prompt={item.prompt}
//             />
//           )}
//           ListHeaderComponent={() => (
//             <View className="flex my-6 px-4 space-y-6">
//               <View className="flex justify-between items-start flex-row mb-6">
//                 <View>
//                   <Text className="font-pmedium text-sm text-gray-100">
//                     Welcome Back
//                   </Text>
//                   <Text className="text-2xl font-psemibold text-white">
//                     JSMastery
//                   </Text>
//                 </View>
//                 <TouchableOpacity
//                   onPress={() => router.push("/(chat)")}
//                   className="mt-1.5"
//                 >
//                   {/* <Image
//                     source={images.logoSmall}
//                     className="w-9 h-10"
//                     resizeMode="contain"
//                   /> */}
//                   <Ionicons
//                     name="chatbubble-ellipses"
//                     size={32}
//                     color="white"
//                   />
//                 </TouchableOpacity>
//               </View>

//               <SearchInput />

//               <View className="w-full flex-1 pt-5 pb-8">
//                 <Text className="text-lg font-pregular text-gray-100 mb-3">
//                   Latest Videos
//                 </Text>

//                 <Trending posts={trending} />
//               </View>
//             </View>
//           )}
//           ListEmptyComponent={() => (
//             <EmptyState
//               title="No Videos Found"
//               subtitle="No videos created yet"
//             />
//           )}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default Home;
import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
} from "react-native";
import {
  Ionicons,
  FontAwesome,
  MaterialIcons,
  Feather,
  AntDesign,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import PostCard from "@/components/posts/PostCard";
import { router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import Trending from "@/components/Trending";
import SearchInput from "@/components/SearchInput";

// Audio comment mock data
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

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("posts");

  // Bottom sheet reference
  const commentsSheetRef = useRef<BottomSheet>(null);

  // Variables for configurable snap points
  const snapPoints = useMemo(() => ["75%", "100%"], []);

  // Callbacks for sheet events
  const handleSheetChanges = useCallback((index: any) => {
    console.log("handleSheetChanges", index);
  }, []);

  // Open the sheet to the first snap point (50%)
  const handleOpenComments = useCallback(() => {
    commentsSheetRef.current?.snapToIndex(0);
  }, []);

  // Render backdrop component
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

  const postData = [
    {
      id: "1",
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNV2dimRVLDjbd9FtA7z4Qz8wJIVQ_UljnUiB6Zd-5TCWz8-5TFzTZf90&s",
      username: "Ralph Edwards",
      timeAgo: "2 minutes",
      caption:
        "I was working on my bike and one of the part randomly fell, can you suggest me the reason?",
      imageUrl:
        "https://images.unsplash.com/photo-1741567348603-0bef4612bea2?q=80&w=2138&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      likes: "50k",
      shares: "24k",
      commentCount: 24,
    },
    {
      id: "2",
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIC58Nd1zNJDZBd_wdQZ3gOUTQLrdSbmlzxv6oelm8bMqr4O_sfTcnBIY&s",
      username: "Jane Cooper",
      timeAgo: "15 minutes",
      caption:
        "Just finished assembling my new road bike. Any tips for a first-time rider?",
      imageUrl:
        "https://images.unsplash.com/photo-1741866987680-5e3d7f052b87?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDZ8Ym84alFLVGFFMFl8fGVufDB8fHx8fA%3D%3D",
      likes: "32k",
      shares: "18k",
      commentCount: 15,
    },
  ];

  const currentData = postData;

  const renderPostItem = ({ item }: any) => (
    <View className="px-5">
      <PostCard post={item} onOpenComments={handleOpenComments} />
    </View>
  );

  return (
    <GestureHandlerRootView>
      <SafeAreaView
        edges={["top", "right", "left", "bottom"]}
        style={{ flex: 1 }}
      >
        <View className="bg-white">
          <FlatList
            data={currentData}
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
                      onPress={() => router.push("/user-details")}
                      // onPress={() => router.push("/notifications")}
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
                  <TouchableOpacity>
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

            {/* Audio comments list */}
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

            {/* Audio recording input */}
            <View className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 flex-row items-center">
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

export default UserProfile;
