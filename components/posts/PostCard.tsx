// import React, { useRef, useMemo, useCallback } from "react";
// import {
//   Text,
//   View,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
// } from "react-native";
// import { Ionicons, Feather, FontAwesome } from "@expo/vector-icons";
// import BottomSheet, {
//   BottomSheetScrollView,
//   BottomSheetBackdrop,
// } from "@gorhom/bottom-sheet";

// // Mock comments data
// const COMMENTS = [
//   {
//     id: "1",
//     username: "sarah_j",
//     avatar: "https://randomuser.me/api/portraits/women/22.jpg",
//     comment: "This is amazing! Love the perspective.",
//     timeAgo: "2h",
//     likes: "24",
//   },
//   {
//     id: "2",
//     username: "mike_designs",
//     avatar: "https://randomuser.me/api/portraits/men/32.jpg",
//     comment: "Great shot! What camera did you use?",
//     timeAgo: "3h",
//     likes: "15",
//   },
//   {
//     id: "3",
//     username: "photo_enthusiast",
//     avatar: "https://randomuser.me/api/portraits/women/45.jpg",
//     comment: "The lighting is perfect!",
//     timeAgo: "5h",
//     likes: "10",
//   },
//   {
//     id: "4",
//     username: "travel_addict",
//     avatar: "https://randomuser.me/api/portraits/men/67.jpg",
//     comment: "Where was this taken? I need to visit!",
//     timeAgo: "6h",
//     likes: "8",
//   },
//   {
//     id: "5",
//     username: "artlover22",
//     avatar: "https://randomuser.me/api/portraits/women/81.jpg",
//     comment: "The composition is on point. Love it!",
//     timeAgo: "8h",
//     likes: "11",
//   },
//   {
//     id: "6",
//     username: "johndoe",
//     avatar: "https://randomuser.me/api/portraits/men/44.jpg",
//     comment: "Absolutely stunning. You have a great eye!",
//     timeAgo: "10h",
//     likes: "19",
//   },
// ];

// // Comment component
// const CommentItem = ({ comment }) => {
//   return (
//     <View style={styles.commentItem}>
//       <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
//       <View style={styles.commentContent}>
//         <View style={styles.commentHeader}>
//           <Text style={styles.commentUsername}>{comment.username}</Text>
//           <Text style={styles.commentTime}>{comment.timeAgo}</Text>
//         </View>
//         <Text style={styles.commentText}>{comment.comment}</Text>
//         <View style={styles.commentActions}>
//           <Text style={styles.commentAction}>Reply</Text>
//           <Text style={styles.commentAction}>See translation</Text>
//         </View>
//       </View>
//       <View style={styles.commentLikes}>
//         <Ionicons name="heart-outline" size={16} color="#666" />
//         <Text style={styles.commentLikesCount}>{comment.likes}</Text>
//       </View>
//     </View>
//   );
// };

// const PostCard = ({
//   post,
// }: {
//   post: {
//     avatar: string;
//     username: string;
//     timeAgo: string;
//     caption: string;
//     imageUrl: string;
//     likes: string;
//     shares: string;
//   };
// }) => {
//   const { avatar, username, timeAgo, caption, imageUrl, likes, shares } = post;

//   // Bottom sheet reference
//   const bottomSheetRef = useRef(null);

//   // Variables for configurable snap points
//   const snapPoints = useMemo(() => ["50%", "90%"], []);

//   // Callbacks for sheet events
//   const handleSheetChanges = useCallback((index) => {
//     console.log("handleSheetChanges", index);
//   }, []);

//   // Open the sheet to the first snap point (50%)
//   const handleOpenComments = useCallback(() => {
//     bottomSheetRef.current?.snapToIndex(0);
//   }, []);

//   // Render backdrop component
//   const renderBackdrop = useCallback(
//     (props) => (
//       <BottomSheetBackdrop
//         {...props}
//         disappearsOnIndex={-1}
//         appearsOnIndex={0}
//       />
//     ),
//     []
//   );

//   return (
//     <View style={styles.postCard}>
//       <View style={styles.postHeader}>
//         <Image source={{ uri: avatar }} style={styles.avatar} />
//         <View style={styles.userInfo}>
//           <Text style={styles.username}>{username}</Text>
//           <Text style={styles.timeAgo}>{timeAgo}</Text>
//         </View>
//         <View style={styles.headerActions}>
//           <Ionicons name="bookmark-outline" size={22} color="#666" />
//           <Feather name="more-horizontal" size={22} color="#666" />
//         </View>
//       </View>

//       {/* Caption */}
//       <Text style={styles.caption}>{caption}</Text>

//       {/* Post image and interaction icons */}
//       <View style={styles.postContent}>
//         <Image
//           source={{ uri: imageUrl }}
//           style={styles.postImage}
//           resizeMode="cover"
//         />
//         <View style={styles.postActions}>
//           <View style={styles.actionItem}>
//             <Ionicons name="heart-outline" size={32} color="#666" />
//             <Text style={styles.actionCount}>{likes}</Text>
//           </View>

//           <View style={styles.actionItem}>
//             <FontAwesome name="share" size={32} color="#666" />
//             <Text style={styles.actionCount}>{shares}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Bottom section with "See more answer" and microphone */}
//       <View style={styles.bottomActions}>
//         <TouchableOpacity
//           style={styles.seeMoreButton}
//           onPress={handleOpenComments}
//         >
//           <View style={styles.seeMoreContent}>
//             <Text style={styles.seeMoreText}>See more answer</Text>
//             <Feather name="chevron-down" size={16} color="#666" />
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity>
//           <View style={styles.micButton}>
//             <FontAwesome name="microphone" size={30} color="#4ade80" />
//           </View>
//         </TouchableOpacity>
//       </View>

//       {/* Comments Bottom Sheet */}
//       <BottomSheet
//         ref={bottomSheetRef}
//         index={-1}
//         snapPoints={snapPoints}
//         onChange={handleSheetChanges}
//         enablePanDownToClose={true}
//         backdropComponent={renderBackdrop}
//         handleIndicatorStyle={styles.sheetIndicator}
//       >
//         <View style={styles.sheetHeader}>
//           <Text style={styles.sheetTitle}>Comments</Text>
//           <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
//             <Ionicons name="close-outline" size={24} color="#666" />
//           </TouchableOpacity>
//         </View>

//         {/* Comments list */}
//         <BottomSheetScrollView contentContainerStyle={styles.commentsList}>
//           {COMMENTS.map((comment) => (
//             <CommentItem key={comment.id} comment={comment} />
//           ))}
//         </BottomSheetScrollView>

//         {/* Comment input */}
//         <View style={styles.commentInputContainer}>
//           <Image
//             source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
//             style={styles.commentInputAvatar}
//           />
//           <View style={styles.commentInputWrapper}>
//             <TextInput
//               style={styles.commentInput}
//               placeholder="Add a comment..."
//               placeholderTextColor="#999"
//             />
//           </View>
//           <TouchableOpacity>
//             <Text style={styles.postButton}>Post</Text>
//           </TouchableOpacity>
//         </View>
//       </BottomSheet>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   // Post card styles
//   postCard: {
//     backgroundColor: "white",
//     borderRadius: 12,
//     padding: 20,
//     position: "relative",
//   },
//   postHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   avatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: "#f1f1f1",
//   },
//   userInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   username: {
//     fontWeight: "500",
//     fontSize: 16,
//   },
//   timeAgo: {
//     fontSize: 12,
//     color: "#888",
//   },
//   headerActions: {
//     flexDirection: "row",
//     gap: 16,
//   },
//   caption: {
//     marginBottom: 12,
//     fontSize: 16,
//   },
//   postContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   postImage: {
//     height: 240,
//     width: "85%",
//     borderRadius: 12,
//     backgroundColor: "#f1f1f1",
//   },
//   postActions: {
//     width: "14%",
//     height: 240,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   actionItem: {
//     alignItems: "center",
//     marginBottom: 32,
//   },
//   actionCount: {
//     fontSize: 14,
//     color: "#666",
//     marginTop: 4,
//   },
//   bottomActions: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   seeMoreButton: {
//     width: "85%",
//   },
//   seeMoreContent: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 24,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   seeMoreText: {
//     color: "#555",
//   },
//   micButton: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 24,
//     height: 48,
//     width: 48,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 8,
//   },

//   // Bottom sheet styles
//   sheetIndicator: {
//     backgroundColor: "#999",
//     width: 40,
//     height: 4,
//   },
//   sheetHeader: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     borderBottomWidth: 1,
//     borderBottomColor: "#f1f1f1",
//   },
//   sheetTitle: {
//     fontWeight: "600",
//     fontSize: 18,
//   },
//   commentsList: {
//     paddingBottom: 80,
//   },

//   // Comment item styles
//   commentItem: {
//     flexDirection: "row",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   commentAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#f1f1f1",
//   },
//   commentContent: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   commentHeader: {
//     flexDirection: "row",
//     alignItems: "baseline",
//   },
//   commentUsername: {
//     fontWeight: "500",
//   },
//   commentTime: {
//     fontSize: 12,
//     color: "#888",
//     marginLeft: 8,
//   },
//   commentText: {
//     fontSize: 16,
//     marginTop: 4,
//   },
//   commentActions: {
//     flexDirection: "row",
//     marginTop: 8,
//   },
//   commentAction: {
//     fontSize: 12,
//     color: "#888",
//     marginRight: 16,
//   },
//   commentLikes: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   commentLikesCount: {
//     fontSize: 12,
//     color: "#888",
//     marginTop: 2,
//   },

//   // Comment input styles
//   commentInputContainer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 8,
//     backgroundColor: "white",
//     borderTopWidth: 1,
//     borderTopColor: "#f1f1f1",
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   commentInputAvatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     marginRight: 12,
//   },
//   commentInputWrapper: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#e1e1e1",
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   commentInput: {
//     fontSize: 14,
//   },
//   postButton: {
//     color: "#3b82f6",
//     fontWeight: "500",
//     marginLeft: 8,
//   },
// });

// export default PostCard;

import React, { useCallback } from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { Ionicons, Feather, FontAwesome } from "@expo/vector-icons";

const PostCard = ({
  post,
  onOpenComments,
}: {
  post: {
    avatar: string;
    username: string;
    timeAgo: string;
    caption: string;
    imageUrl: string;
    likes: string;
    shares: string;
  };
  onOpenComments?: () => void;
}) => {
  const { avatar, username, timeAgo, caption, imageUrl, likes, shares } = post;

  const handleOpenComments = useCallback(() => {
    if (onOpenComments) {
      onOpenComments();
    }
  }, [onOpenComments]);

  return (
    <View className="bg-white rounded-lg py-5">
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: avatar }}
          className="w-12 h-12 rounded-full bg-gray-200"
        />
        <View className="flex-1 ml-3">
          <Text className="font-medium text-base">{username}</Text>
          <Text className="text-xs text-gray-500">{timeAgo}</Text>
        </View>
        <View className="flex-row gap-4">
          <Ionicons name="bookmark-outline" size={22} color="#666" />
          <Feather name="more-horizontal" size={22} color="#666" />
        </View>
      </View>

      {/* Caption */}
      <View className="flex-row items-center">
        <Text className="mb-3 text-base w-[90%]">{caption}</Text>

        <TouchableOpacity className="w-[14%] justify-center items-center">
          <FontAwesome name="play" size={30} />
        </TouchableOpacity>
      </View>
      {/* Post image and interaction icons */}
      <View className="flex flex-row items-center mb-3">
        <Image
          source={{ uri: imageUrl }}
          className="h-60 w-[90%] rounded-lg bg-gray-200"
          resizeMode="cover"
        />
        <View className="w-[14%] h-60 justify-center items-center">
          <View className="items-center mb-8">
            <Ionicons name="heart-outline" size={32} color="#666" />
            <Text className="text-sm text-gray-700">{likes}</Text>
          </View>

          <View className="items-center">
            <FontAwesome name="share" size={32} color="#666" />
            <Text className="text-sm text-gray-700">{shares}</Text>
          </View>
        </View>
      </View>

      {/* Bottom section with "See more answer" and microphone */}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="w-[90%]" onPress={handleOpenComments}>
          <View className="bg-gray-50 rounded-full py-3 px-4 flex-row items-center justify-between">
            <Text className="text-gray-700">See more answer</Text>
            <Feather name="chevron-down" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View className="bg-gray-50 rounded-full h-12 w-12 items-center justify-center p-2">
            <FontAwesome name="microphone" size={30} color="#4ade80" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCard;
