import FormField from "@/components/FormField";
import LocationPicker from "@/components/LocationPicker";
import ProfileAvatar from "@/components/ProfileAvatar"; // Import the new component
import { useGlobalContext } from "@/context/AuthContext";
import { pbFileUrl } from "@/lib/getData/GetVideos";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const hasAvatar = user?.avatar && user?.collectionId && user?.id;
  const avatarUrl = hasAvatar
    ? pbFileUrl(user.collectionId, user.id, user.avatar)
    : null;

  const [profileImage, setProfileImage] = useState(avatarUrl);
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
          <View className="items-center mt-6 mb-8">
            <ProfileAvatar
              imageUrl={profileImage}
              name={user?.name}
              size={128}
              showEditButton={true}
              onEditPress={pickImage}
              textSizeClass="text-4xl"
            />
            <Text className="text-gray-400 mt-3">
              Tap to change profile picture
            </Text>
          </View>

          <View className="space-y-5">
            <FormField
              title="Full Name"
              value={form.name}
              handleChangeText={(e) => setForm({ ...form, name: e })}
              placeholder="Enter your full name"
            />

            <FormField
              title="Username"
              value={form.username}
              handleChangeText={(e) => setForm({ ...form, username: e })}
              otherStyles="mt-4"
              placeholder="Enter your username"
            />

            <View className="mt-4">
              <Text className="text-base font-pmedium text-gray-500 mb-1 ml-1">
                Location
              </Text>
              <LocationPicker
                location={form.location?.toString() || ""}
                setLocation={(loc) => setForm({ ...form, location: loc })}
              />
            </View>

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
