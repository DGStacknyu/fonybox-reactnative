import { useGlobalContext } from "@/context/AuthContext";
import { createPost } from "@/lib/get-post-data/post-fucntions";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const Create = () => {
  const params = useLocalSearchParams();
  const { user } = useGlobalContext();
  // States
  const [audioUri, setAudioUri] = useState(params.audioUri || null);
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getPermissions = async () => {
      if (Platform.OS !== "web") {
        const imageResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (imageResult.status !== "granted") {
          Alert.alert(
            "Permission required",
            "Sorry, we need camera roll permissions to upload images."
          );
        }
      }
    };

    getPermissions();

    if (audioUri) {
      console.log("Loading audio from URI:", audioUri);
      setTimeout(() => {
        loadAudio();
      }, 500);
    }

    return () => {
      if (sound) {
        console.log("Unloading sound");
        sound.unloadAsync();
      }
    };
  }, [audioUri]);

  useEffect(() => {
    if (audioUri) {
      console.log("Audio URI available:", audioUri);
    } else {
      console.log("No audio URI available");
    }
  }, [audioUri]);

  const formatTime = (seconds: number) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        {
          shouldPlay: false,
          volume: 1.0,
          rate: 1.0,
          progressUpdateIntervalMillis: 100,
        },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsLoading(false);

      await newSound.setPositionAsync(0);

      console.log("Audio loaded successfully:", audioUri);
    } catch (error) {
      console.error("Error loading audio:", error);
      Alert.alert("Error", "Failed to load audio. Please try again.");
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: {
    isLoaded: any;
    durationMillis: number;
    positionMillis: number;
    isPlaying: boolean | ((prevState: boolean) => boolean);
    didJustFinish: any;
  }) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis / 1000);
      setPosition(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      console.log("No sound object available");
      if (audioUri) {
        await loadAudio();
        return;
      }
      return;
    }

    try {
      if (isPlaying) {
        console.log("Pausing audio");
        await sound.pauseAsync();
      } else {
        console.log("Playing audio");

        const status = await sound.getStatusAsync();
        if (status.positionMillis === status.durationMillis) {
          await sound.setPositionAsync(0);
        }

        await sound.setVolumeAsync(1.0);
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Error handling play/pause:", error);
      Alert.alert(
        "Playback Error",
        "There was a problem playing the audio. Please try again."
      );

      if (audioUri) {
        loadAudio();
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Upload voice message
  const uploadVoiceMessage = async () => {
    if (!audioUri) {
      Alert.alert("No recording", "Please record some audio first.");
      return;
    }
    setIsUploading(true);
    try {
      await createPost({
        audioUri,
        userId: user.id,
        caption,
        imageUri: image,
      });

      Alert.alert(
        "Success",
        "Your voice message has been uploaded successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              router.replace("/");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert(
        "Upload Failed",
        "There was an error uploading your audio. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };
  const resetForm = () => {
    if (sound) {
      try {
        sound
          .stopAsync()
          .then(() => {
            sound.unloadAsync();
            console.log("Sound stopped and unloaded successfully");
          })
          .catch((err: any) => console.error("Error cleaning up sound:", err));
      } catch (e) {
        console.error("Error in resetForm:", e);
      }
    }

    // Clear all state
    setSound(null);
    setAudioUri(null);
    setCaption("");
    setImage(null);
    setPosition(0);
    setDuration(0);
    setIsPlaying(false);

    global.audioUri = null;

    console.log("Form reset complete");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 py-2.5 border-b border-[#EEEEEE]"
        style={{ paddingTop: Platform.OS === "android" ? 50 : 0 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#637381" />
        </TouchableOpacity>
        <Text className="text-lg font-medium">Create Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView className="flex-1 p-4">
          {audioUri ? (
            <View className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <Text className="text-gray-700 font-medium mb-3">
                Your Recording
              </Text>

              <View className="flex-row items-center">
                <TouchableOpacity
                  className="bg-[#F52936] w-14 h-14 rounded-full items-center justify-center mr-4"
                  onPress={handlePlayPause}
                  disabled={isLoading}
                  style={{
                    elevation: 4,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={28}
                      color="white"
                    />
                  )}
                </TouchableOpacity>

                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-800 font-medium">
                      {formatTime(position)}
                    </Text>
                    <Text className="text-gray-500">
                      {formatTime(duration)}
                    </Text>
                  </View>

                  <View className="h-3 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <View
                      className="h-3 bg-[#F52936]"
                      style={{
                        width: `${
                          duration > 0 ? (position / duration) * 100 : 0
                        }%`,
                      }}
                    />
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-center mt-2">
                <View
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? "bg-[#F52936]" : "bg-gray-400"
                  } mr-2`}
                />
                <Text className="text-gray-700">
                  {isLoading
                    ? "Loading audio..."
                    : isPlaying
                    ? "Playing"
                    : duration > 0
                    ? "Paused"
                    : "Audio ready to play"}
                </Text>
              </View>

              <View className="flex-row justify-end mt-2">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => {
                    Alert.alert(
                      "Record Again",
                      "Are you sure you want to discard this recording and record again?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Yes",
                          onPress: () => {
                            if (sound) {
                              sound
                                .stopAsync()
                                .then(() => {
                                  sound.unloadAsync();
                                  setSound(null);
                                })
                                .catch((err: any) =>
                                  console.error("Error stopping sound:", err)
                                );
                            }
                            global.audioUri = null;
                            resetForm();
                            router.replace("/");
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Ionicons name="refresh" size={16} color="#637381" />
                  <Text className="text-gray-600 ml-1 text-sm">
                    Record Again
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="bg-gray-100 rounded-xl p-4 mb-6 items-center">
              <Text className="text-gray-700">No recording found</Text>
              <TouchableOpacity
                className="bg-[#F52936] px-4 py-2 rounded-lg mt-2"
                onPress={() => router.replace("/")}
              >
                <Text className="text-white">Record Audio</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="w-full mb-4">
            <Text className="text-gray-700 mb-1 font-medium">Caption</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Add a caption for your recording..."
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={3}
              disabled={isUploading}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>

          <View className="w-full mb-6">
            <Text className="text-gray-700 mb-1 font-medium">
              Image (optional)
            </Text>

            {image ? (
              <View className="relative mb-2">
                <Image
                  source={{ uri: image }}
                  className="w-full h-40 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-[#F52936] w-8 h-8 rounded-full items-center justify-center"
                  onPress={() => setImage(null)}
                  disabled={isUploading}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center bg-white"
                onPress={pickImage}
                disabled={isUploading}
              >
                <Ionicons name="image-outline" size={30} color="#637381" />
                <Text className="text-gray-500 mt-2">
                  Tap to select an image
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View
            className="w-full flex-row justify-between mt-4 mb-32"
            style={{
              paddingBottom: Platform.select({ ios: 30, android: 30 }),
            }}
          >
            <TouchableOpacity
              className="bg-gray-100 px-6 py-3.5 rounded-xl flex-row items-center shadow-sm"
              style={{
                borderWidth: 1,
                borderColor: "rgba(200, 200, 200, 0.3)",
              }}
              onPress={() => {
                if (audioUri) {
                  Alert.alert(
                    "Cancel Recording",
                    "Are you sure you want to discard this recording?",
                    [
                      { text: "No", style: "cancel" },
                      {
                        text: "Yes",
                        onPress: () => {
                          if (sound) {
                            sound
                              .stopAsync()
                              .then(() => {
                                sound.unloadAsync();
                                setSound(null);
                              })
                              .catch((err: any) =>
                                console.error("Error stopping sound:", err)
                              );
                          }
                          setAudioUri(null);
                          global.audioUri = null;
                          router.back();
                        },
                      },
                    ]
                  );
                } else {
                  router.back();
                }
              }}
              disabled={isUploading}
            >
              <Ionicons name="arrow-back" size={20} color="#637381" />
              <Text className="text-gray-700 ml-2 font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-6 py-3.5 rounded-xl flex-row items-center ${
                audioUri && !isUploading ? "bg-[#F52936]" : "bg-gray-300"
              }`}
              style={
                audioUri && !isUploading
                  ? {
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 10,
                      elevation: 6,
                    }
                  : {}
              }
              onPress={uploadVoiceMessage}
              disabled={isUploading || !audioUri}
            >
              {isUploading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white ml-3 font-medium">
                    Uploading...
                  </Text>
                </View>
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color="white"
                  />
                  <Text className="text-white ml-2 font-medium">
                    Create Post
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default Create;
