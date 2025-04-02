import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const Create = () => {
  // States
  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState("idle");
  const [audioUri, setAudioUri] = useState(null);
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingPermission, setRecordingPermission] = useState(null);

  // Animation values
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Request permissions on component mount
  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setRecordingPermission(status === "granted");

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
  }, []);

  // Create separate animation values for native and JS-driven animations
  const pulseAnim = useRef(new Animated.Value(1)).current; // Native
  const wave1Anim = useRef(new Animated.Value(0)).current; // Native
  const wave2Anim = useRef(new Animated.Value(0)).current; // Native
  const wave3Anim = useRef(new Animated.Value(0)).current; // Native

  // JS-only animations (for color interpolation)
  const colorAnim1 = useRef(new Animated.Value(0)).current;
  const colorAnim2 = useRef(new Animated.Value(0)).current;
  const colorAnim3 = useRef(new Animated.Value(0)).current;

  // Recording time tracker
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Set up enhanced animations
  useEffect(() => {
    if (recordingStatus === "recording") {
      // Native-driven animations for scaling and opacity
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animations using native driver
      Animated.loop(
        Animated.timing(wave1Anim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      setTimeout(() => {
        Animated.loop(
          Animated.timing(wave2Anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ).start();
      }, 200);

      setTimeout(() => {
        Animated.loop(
          Animated.timing(wave3Anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ).start();
      }, 400);

      // JS animations for color changes (separate from native animations)
      Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnim1, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(colorAnim1, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnim2, {
            toValue: 1,
            duration: 1300,
            useNativeDriver: false,
          }),
          Animated.timing(colorAnim2, {
            toValue: 0,
            duration: 1300,
            useNativeDriver: false,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnim3, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(colorAnim3, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Timer for duration
      const interval = setInterval(() => {
        setRecordingDuration((prevDuration) => prevDuration + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // Reset animations when not recording
      pulseAnim.setValue(1);
      wave1Anim.setValue(0);
      wave2Anim.setValue(0);
      wave3Anim.setValue(0);
      colorAnim1.setValue(0);
      colorAnim2.setValue(0);
      colorAnim3.setValue(0);
      setRecordingDuration(0);
    }
  }, [recordingStatus]);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Start recording function
  const startRecording = async () => {
    try {
      if (recordingPermission !== true) {
        Alert.alert(
          "Permission required",
          "Please grant microphone permissions to record audio."
        );
        return;
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setRecordingStatus("recording");
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  // Stop recording function
  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      setRecordingStatus("stopped");
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
    }
  };

  // Handle image picking
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
      // Simulate API upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you would upload to your backend here

      // Reset form after successful upload
      Alert.alert(
        "Success",
        "Your voice message has been uploaded successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              // Navigate back or to another screen if needed
              // router.replace("/");
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

  // Reset everything
  const resetForm = () => {
    if (recording) {
      recording.stopAndUnloadAsync();
    }
    setRecording(null);
    setAudioUri(null);
    setCaption("");
    setImage(null);
    setRecordingStatus("idle");
    setRecordingDuration(0);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-2.5 border-b border-[#EEEEEE]">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#637381" />
        </TouchableOpacity>
        <Text className="text-lg font-medium">Create Post</Text>
        <View style={{ width: 24 }} /> {/* Empty view for alignment */}
      </View>

      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View className="flex-1 p-4">
          {/* Recording UI */}
          <View className="flex-1 items-center justify-center">
            {/* Enhanced audio visualization */}
            <View className="relative w-80 h-80 items-center justify-center mb-8">
              {recordingStatus === "recording" && (
                <>
                  {/* Multiple staggered sound waves for rich animation */}
                  {/* Outer wave */}
                  <Animated.View
                    className="absolute rounded-full bg-[#FFE8E9]"
                    style={{
                      width: 190,
                      height: 190,
                      opacity: wave1Anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.4, 0.2, 0.4],
                      }),
                      transform: [
                        {
                          scale: wave1Anim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 1.6, 1],
                          }),
                        },
                      ],
                    }}
                  />

                  {/* Middle wave */}
                  <Animated.View
                    className="absolute rounded-full bg-[#FFCFD1]"
                    style={{
                      width: 150,
                      height: 150,
                      opacity: wave2Anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.5, 0.3, 0.5],
                      }),
                      transform: [
                        {
                          scale: wave2Anim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 1.4, 1],
                          }),
                        },
                      ],
                    }}
                  />

                  {/* Inner wave */}
                  <Animated.View
                    className="absolute rounded-full bg-[#FFB6BB]"
                    style={{
                      width: 110,
                      height: 110,
                      opacity: wave3Anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.6, 0.4, 0.6],
                      }),
                      transform: [
                        {
                          scale: wave3Anim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 1.25, 1],
                          }),
                        },
                      ],
                    }}
                  />
                </>
              )}

              {/* Enhanced mic button with shadow */}
              <View
                style={
                  recordingStatus === "recording"
                    ? {
                        shadowColor: "#F52936",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        shadowRadius: 15,
                        elevation: 10,
                      }
                    : {}
                }
              >
                <TouchableOpacity
                  className="bg-[#F52936] w-24 h-24 rounded-full items-center justify-center shadow-lg"
                  onPress={
                    recordingStatus === "recording"
                      ? stopRecording
                      : startRecording
                  }
                  disabled={isUploading}
                  style={
                    recordingStatus === "recording"
                      ? {
                          borderWidth: 3,
                          borderColor: "rgba(255, 255, 255, 0.4)",
                        }
                      : {}
                  }
                >
                  <Animated.View
                    style={{
                      transform: [{ scale: pulseAnim }],
                    }}
                  >
                    <Ionicons
                      name={recordingStatus === "recording" ? "stop" : "mic"}
                      size={45}
                      color="white"
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>

              {/* Enhanced recording time display */}
              {recordingStatus === "recording" && (
                <View className="mt-6 px-5 py-2 rounded-full bg-[#FFE8E9]">
                  <Animated.Text
                    className="text-[#F52936] text-xl font-bold"
                    style={{
                      transform: [
                        {
                          scale: pulseAnim.interpolate({
                            inputRange: [1, 1.3],
                            outputRange: [1, 1.05],
                          }),
                        },
                      ],
                    }}
                  >
                    {formatTime(recordingDuration)}
                  </Animated.Text>
                </View>
              )}

              {/* Enhanced recording status with simple styling */}
              {recordingStatus === "recording" ? (
                <View className="flex-row items-center mt-4">
                  <View className="w-2 h-2 rounded-full bg-[#F52936] mr-2" />
                  <Text className="text-gray-700 text-base font-medium">
                    Recording in progress
                  </Text>
                </View>
              ) : (
                <Text className="text-gray-600 text-base mt-4">
                  {recordingStatus === "idle" && "Tap mic to start recording"}
                  {recordingStatus === "stopped" && "Recording complete"}
                </Text>
              )}

              {/* Audio recorded indicator */}
              {audioUri && recordingStatus === "stopped" && (
                <View className="mt-3 flex-row items-center px-4 py-2 rounded-lg bg-[#FFE8E9]">
                  <Ionicons name="checkmark-circle" size={20} color="#F52936" />
                  <Text className="text-[#F52936] ml-2 font-medium">
                    Audio recorded successfully
                  </Text>
                </View>
              )}
            </View>

            {/* Caption input */}
            <View className="w-full px-4 mb-4">
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

            {/* Image upload */}
            <View className="w-full px-4 mb-6">
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

            {/* Action buttons (simplified) */}
            <View
              className="w-full px-4 flex-row justify-between mt-auto mb-6"
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
                onPress={resetForm}
                disabled={
                  isUploading || (recordingStatus === "idle" && !audioUri)
                }
              >
                <Ionicons name="refresh" size={20} color="#637381" />
                <Text className="text-gray-700 ml-2 font-medium">Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-6 py-3.5 rounded-xl flex-row items-center  ${
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
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default Create;
