import React, { forwardRef } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { VoiceMessage } from "../VoiceMessage";

// export const MessageList = forwardRef(
//   ({ chatDetails, setIsPlaying, isUpdating }: any, ref): any => {
//     return (
//       <View className="flex-1">
//         <ScrollView
//           ref={ref}
//           className="flex-1 pt-3"
//           showsVerticalScrollIndicator={false}
//         >
//           {chatDetails.messages && chatDetails.messages.length > 0 ? (
//             chatDetails.messages.map((message: { id: string }) => (
//               <VoiceMessage
//                 key={message.id}
//                 message={message}
//                 setIsPlaying={setIsPlaying}
//               />
//             ))
//           ) : (
//             <View className="flex-1 items-center justify-center py-10">
//               {isUpdating ? (
//                 <ActivityIndicator size="small" color="#F52936" />
//               ) : (
//                 <Text className="text-gray-500">No messages yet</Text>
//               )}
//             </View>
//           )}
//           <View className="h-5" />
//         </ScrollView>

//         {isUpdating && (
//           <View className="absolute right-5 top-5">
//             <ActivityIndicator size="small" color="#F52936" />
//           </View>
//         )}
//       </View>
//     );
//   }
// );

export const MessageList = forwardRef(
  ({ chatDetails, setIsPlaying, isUpdating }: any, ref): any => {
    return (
      <View className="flex-1 px-3">
        <ScrollView
          ref={ref}
          className="flex-1 pt-3"
          showsVerticalScrollIndicator={false}
        >
          {chatDetails.messages && chatDetails.messages.length > 0 ? (
            chatDetails.messages.map((message: { id: any }) => (
              <VoiceMessage
                key={message.id}
                message={message}
                setIsPlaying={setIsPlaying}
              />
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-10">
              {chatDetails.isPlaceholder ? (
                <ActivityIndicator size="small" color="#F52936" />
              ) : (
                <Text className="text-gray-500">No messages yet</Text>
              )}
            </View>
          )}
          <View className="h-5" />
        </ScrollView>

        {isUpdating && (
          <View className="absolute right-5 top-5">
            <ActivityIndicator size="small" color="#F52936" />
          </View>
        )}
      </View>
    );
  }
);
