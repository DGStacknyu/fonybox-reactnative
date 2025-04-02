import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

const GroupChatLayout = () => {
  return (
    <>
      <Stack screenOptions={{ animation: "slide_from_right" }}>
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="create-group"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="info/[id]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default GroupChatLayout;
