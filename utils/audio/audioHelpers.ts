import { Audio } from "expo-av";
import { pbFileUrl } from "@/lib/getData/GetVideos";

export const formatDuration = (durationMillis: number): string => {
  if (isNaN(durationMillis) || durationMillis <= 0) return "0:00";

  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const preloadAudioDurations = async (messages: any[]) => {
  const durations: Record<string, string> = {};

  const promises = messages.map(
    async (message: {
      audio_url: string;
      collectionId: string;
      id: string;
    }) => {
      if (message.audio_url) {
        try {
          const audioUrl = pbFileUrl(
            message.collectionId,
            message.id,
            message.audio_url
          );
          const soundObject = new Audio.Sound();
          await soundObject.loadAsync({ uri: audioUrl });
          const status = await soundObject.getStatusAsync();
          if (status.isLoaded && status.durationMillis) {
            durations[message.id] = formatDuration(status.durationMillis);
          }
          await soundObject.unloadAsync();
        } catch (error) {
          console.log("Error preloading audio duration:", error);
        }
      }
    }
  );

  await Promise.all(promises);
  return durations;
};
