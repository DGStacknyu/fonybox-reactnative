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
import { useGlobalContext } from "@/lib/AuthContext";
import { pbFileUrl } from "@/lib/getData/GetVideos";

// Audio comment mock data
const AUDIO_COMMENTS = [
  {
    id: "1",
    username: "Abil wardani",
    avatar:
      "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
    time: "03:45PM",
    audioDuration: "01:11",
    replyCount: "3k",
    likes: "1.3k",
    replies: [
      {
        id: "1-1",
        username: "Abil wardani",
        avatar:
          "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
        time: "03:45PM",
        audioDuration: "01:11",
        replyCount: "3k",
        likes: "1.3k",
      },
      {
        id: "1-2",
        username: "Abil wardani",
        avatar:
          "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
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
    avatar:
      "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
    time: "03:45PM",
    audioDuration: "01:11",
    replyCount: "3k",
    likes: "1.3k",
    replies: [],
  },
  {
    id: "3",
    username: "Abil wardani",
    avatar:
      "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
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
            {Array.from({ length: 50 }).map((_, i) => (
              <View
                key={i}
                className=" bg-gray-400 mx-[0.5px]"
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
  const { logout, user } = useGlobalContext();

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
        "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
      username: "Jaydeep Sharma",
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
        "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
      username: "Jaydeep Sharma",
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

  // Sample saved collection data
  const savedData = [
    {
      id: "1",
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNV2dimRVLDjbd9FtA7z4Qz8wJIVQ_UljnUiB6Zd-5TCWz8-5TFzTZf90&s",
      username: "Jane Cooper",
      timeAgo: "15 minutes",
      caption:
        "Just finished assembling my new road bike. Any tips for a first-time rider?",
      imageUrl: "https://via.placeholder.com/400x300",
      likes: "32k",
      shares: "18k",
      commentCount: 15,
    },
    {
      id: "2",
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIC58Nd1zNJDZBd_wdQZ3gOUTQLrdSbmlzxv6oelm8bMqr4O_sfTcnBIY&s",
      username: "Ralph Edwards",
      timeAgo: "2 minutes",
      caption:
        "I was working on my bike and one of the part randomly fell, can you suggest me the reason?",
      imageUrl: "https://via.placeholder.com/400x300",
      likes: "50k",
      shares: "24k",
      commentCount: 24,
    },
  ];

  const currentData = activeTab === "posts" ? postData : savedData;

  // Pass the handleOpenComments callback to the PostCard
  const renderPostItem = ({ item }: any) => (
    <PostCard post={item} onOpenComments={handleOpenComments} />
  );

  // Function to render the header section of the FlatList
  const renderHeader = () => (
    <View>
      <View className="flex flex-row gap-10 items-center mt-4 mb-2">
        <Image
          source={{
            uri: pbFileUrl(user.collectionId, user.id, user.avatar),
          }}
          className="w-32 h-32 rounded-full bg-gray-200"
        />
        <View className="gap-y-3">
          <Text className="text-xl font-bold">{user?.name}</Text>
          <Text className="text-gray-500 ">{user?.location}</Text>
          <Text className="text-gray-700">{user?.tags}</Text>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between mt-6">
        <View className="items-center flex-1">
          <Text className="text-gray-500 text-sm">Post</Text>
          <Text className="text-xl font-bold">1</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-gray-500 text-sm">Followers</Text>
          <Text className="text-xl font-bold">1</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-gray-500 text-sm">Friends</Text>
          <Text className="text-xl font-bold">1</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-5 mt-6">
        <TouchableOpacity
          className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
          onPress={() => router.push("/edit-profile")}
        >
          <Text className="text-gray-700 font-semibold">Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-gray-200 rounded-lg py-3 items-center">
          <Text className="font-medium text-gray-700">Share Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Posts/Saved Tabs */}
      <View className="mt-8">
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab("posts")}
            className="flex-1"
          >
            <View className="items-center pb-2">
              <Text
                className={
                  activeTab === "posts"
                    ? "text-red-500 font-medium"
                    : "text-gray-400 font-medium"
                }
              >
                Posts
              </Text>
            </View>
            <View
              className={
                activeTab === "posts"
                  ? "border-b-2 border-red-500"
                  : "border-b border-gray-200"
              }
            ></View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("saved")}
            className="flex-1"
          >
            <View className="items-center pb-2">
              <Text
                className={
                  activeTab === "saved"
                    ? "text-red-500 font-medium"
                    : "text-gray-400 font-medium"
                }
              >
                Saved Posts
              </Text>
            </View>
            <View
              className={
                activeTab === "saved"
                  ? "border-b-2 border-red-500"
                  : "border-b border-gray-200"
              }
            ></View>
          </TouchableOpacity>
        </View>
      </View>
      <View className="mt-4" />
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 py-5">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text className="ml-4 text-lg font-bold text-gray-700">
                {user?.username}
              </Text>
            </View>
            <TouchableOpacity onPress={logout}>
              <MaterialCommunityIcons name="logout" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Main Content - All in one FlatList with header */}
          <FlatList
            data={currentData}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Platform.select({
                ios: 50,
                android: 70,
              }),
              paddingLeft: 15,
              paddingRight: 15,
            }}
          />

          {/* Global Comments Bottom Sheet */}
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
                source={{
                  uri: "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
                }}
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
