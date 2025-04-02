import { useState } from "react";
import { router, usePathname } from "expo-router";
import { View, TouchableOpacity, Image, TextInput, Alert } from "react-native";

import { icons } from "../constants";
import { Ionicons } from "@expo/vector-icons";

const SearchInput = ({ initialQuery }: any) => {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery || "");

  return (
    <View className="flex-1 flex-row items-center mx-2 h-12 px-4 bg-slate-100 rounded-full border border-slate-200">
      <TextInput
        className="text-base flex-1 font-pregular "
        value={query}
        placeholder="Search a video topic"
        placeholderTextColor="#6B7280"
        onChangeText={(e) => setQuery(e)}
      />

      <TouchableOpacity
        onPress={() => {
          if (query === "")
            return Alert.alert(
              "Missing Query",
              "Please input something to search results across database"
            );

          if (pathname.startsWith("/search")) router.setParams({ query });
          else router.push(`/search/${query}`);
        }}
      >
        <Ionicons name="search" size={18} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
