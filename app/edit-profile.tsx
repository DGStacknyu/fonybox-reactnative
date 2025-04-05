import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useGlobalContext } from "@/lib/AuthContext";
import * as ImagePicker from "expo-image-picker";
import FormField from "@/components/FormField";
import { pbFileUrl } from "@/lib/getData/GetVideos";
import LocationPicker from "@/components/LocationPicker";

const EditProfile = () => {
  const { user, updateUserProfile, pb } = useGlobalContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    name: user?.name,
    username: user?.username,
    location: user?.location,
    bio: user?.bio,
    tags: user?.tags,
    account_type: user.account_type,
  });
  const [profileImage, setProfileImage] = useState(
    pbFileUrl(user.collectionId, user.id, user.avatar) ||
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7f1Es84yxr11Bfj_10hV2_srMeJ-Ry71Yiw&s"
  );
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim() || !form.username.trim()) {
      Alert.alert("Error", "Name and username are required");
      return;
    }

    setIsLoading(true);

    try {
      let formData = {
        ...user,
        ...form,
      };

      if (profileImage) {
        const fileFormData = new FormData();
        const fileName = profileImage.split("/").pop() || "avatar.jpg";
        const fileType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";

        // @ts-ignore
        fileFormData.append("avatar", {
          uri: profileImage,
          name: fileName,
          type: fileType,
        });

        try {
          const fileRecord = await pb
            .collection("users")
            .update(user.id, fileFormData);

          if (fileRecord && fileRecord.avatar) {
            formData.avatar = fileRecord.avatar;
          }
        } catch (fileError) {
          console.error("Failed to upload profile image:", fileError);
        }
      }

      await updateUserProfile(formData);

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const toggleAccountType = (type: string) => {
    setForm({ ...form, account_type: type });
    setDropdownOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-5">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="ml-4 text-lg font-bold text-gray-700">
            Edit Profile
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSaveProfile}
          disabled={isLoading}
          className={isLoading ? "opacity-50" : ""}
        >
          <Text className="text-red-500 font-bold">
            {isLoading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          {/* Profile Image Section */}
          <View className="items-center mt-6 mb-8">
            <View className="relative">
              <Image
                source={{ uri: profileImage }}
                className="w-32 h-32 rounded-full bg-gray-200"
              />
              <TouchableOpacity
                onPress={pickImage}
                className="absolute bottom-0 right-0 bg-red-500 p-2 rounded-full"
              >
                <FontAwesome name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-400 mt-3">
              Tap to change profile picture
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-5">
            {/* Name Field */}
            <FormField
              title="Full Name"
              value={form.name}
              handleChangeText={(e) => setForm({ ...form, name: e })}
              placeholder="Enter your full name"
            />

            {/* Username Field */}
            <FormField
              title="Username"
              value={form.username}
              handleChangeText={(e) => setForm({ ...form, username: e })}
              otherStyles="mt-4"
              placeholder="Enter your username"
            />

            {/* Location Field */}
            <View className="mt-4">
              {/* <Text className="text-gray-500 mb-2 font-medium">Location</Text> */}
              <Text className="text-base font-pmedium text-gray-500 mb-1 ml-1">
                Location
              </Text>
              <LocationPicker
                location={form.location?.toString() || ""}
                setLocation={(loc) => setForm({ ...form, location: loc })}
              />
            </View>

            {/* Bio Field */}
            <View className="mt-4">
              <Text className="text-gray-500 mb-2 font-medium">Bio</Text>
              <View className="border border-gray-300 rounded-lg px-3 py-1">
                <TextInput
                  value={form.bio}
                  onChangeText={(e) => setForm({ ...form, bio: e })}
                  placeholder="Write something about yourself"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="text-base"
                  style={{ height: 100 }}
                />
              </View>
            </View>

            {/* Tags Field */}
            <View className="mt-4">
              <Text className="text-gray-500 mb-2 font-medium">Tags</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
                <TextInput
                  value={form.tags}
                  onChangeText={(e) => setForm({ ...form, tags: e })}
                  placeholder="Add tags (e.g. #photography)"
                  className="flex-1 text-base"
                />
                <MaterialIcons name="tag" size={20} color="gray" />
              </View>
              <Text className="text-xs text-gray-400 mt-1">
                Separate tags with commas (e.g. #photography, #travel)
              </Text>
            </View>

            {/* Account Type Dropdown */}
            <View className="mt-4">
              <Text className="text-gray-500 mb-2 font-medium">
                Account Type
              </Text>
              <View className="relative">
                <TouchableOpacity
                  onPress={() => setDropdownOpen(!dropdownOpen)}
                  className="flex-row items-center justify-between border border-gray-300 rounded-lg p-3"
                >
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name={form.account_type === "private" ? "lock" : "earth"}
                      size={20}
                      color="gray"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-base">
                      {form.account_type === "private" ? "Private" : "Public"}
                    </Text>
                  </View>
                  <MaterialIcons
                    name={dropdownOpen ? "arrow-drop-up" : "arrow-drop-down"}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>

                {dropdownOpen && (
                  <View className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 z-10 shadow-md">
                    <TouchableOpacity
                      onPress={() => toggleAccountType("public")}
                      className="flex-row items-center p-3 border-b border-gray-200"
                    >
                      <MaterialCommunityIcons
                        name="earth"
                        size={20}
                        color="gray"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-base">Public</Text>
                      {form.account_type === "public" && (
                        <MaterialIcons
                          name="check"
                          size={20}
                          color="green"
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleAccountType("private")}
                      className="flex-row items-center p-3"
                    >
                      <MaterialCommunityIcons
                        name="lock"
                        size={20}
                        color="gray"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-base">Private</Text>
                      {form.account_type === "private" && (
                        <MaterialIcons
                          name="check"
                          size={20}
                          color="green"
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <Text className="text-xs text-gray-400 mt-1">
                {form.account_type === "private"
                  ? "Only approved followers can see your content"
                  : "Anyone can see your content"}
              </Text>
            </View>
          </View>

          {/* Delete Account Button */}
          <TouchableOpacity
            className="mt-12 items-center py-3"
            onPress={() =>
              Alert.alert(
                "Delete Account",
                "Are you sure you want to delete your account? This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive" },
                ]
              )
            }
          >
            <Text className="text-red-500 font-medium">Delete Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfile;
