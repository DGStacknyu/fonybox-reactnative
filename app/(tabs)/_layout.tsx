import { Redirect, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

import { useGlobalContext } from "@/lib/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { icons } from "../../constants";

const TabIcon = ({
  icon,
  iconName,
  color,
  name,
  focused,
  isCenter = false,
}: {
  icon?: any; // Make this optional
  iconName?: any;
  color: string;
  name: string;
  focused: boolean;
  isCenter?: boolean;
}) => {
  if (isCenter) {
    return (
      <View
        className="flex items-center justify-center"
        style={{ marginBottom: 40 }}
      >
        <View
          className="rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "#FF5A5F",
            width: 75,
            height: 75,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          <Ionicons name={iconName || "mic"} size={48} color="#FFFFFF" />
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex items-center justify-center"
      style={{ width: 70, marginBottom: -20 }}
    >
      <Ionicons name={iconName || "help-circle"} size={32} color={color} />

      {/* {focused && (
        <Text className="text-xs font-pregular" style={{ color: color }}>
          {name}
        </Text>
      )} */}
    </View>
  );
};

const TabLayout = () => {
  const { loading, isLogged } = useGlobalContext();

  if (!loading && !isLogged) return <Redirect href="/sign-in" />;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#333333",
          tabBarInactiveTintColor: "#AAAAAA",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#F0F0F0",
            height: 80,
            paddingHorizontal: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            position: "absolute",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="home"
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="search"
                color={color}
                name="Search"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Voice",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.plus}
                color={color}
                name="Voice"
                focused={focused}
                isCenter={true}
              />
            ),
          }}
        />{" "}
        <Tabs.Screen
          name="GroupChat"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="people"
                color={color}
                name="Chat"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="UserProfile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="person-circle-outline"
                color={color}
                name="Profile"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      <StatusBar backgroundColor="#FFFFFF" style="dark" />
    </>
  );
};

export default TabLayout;
