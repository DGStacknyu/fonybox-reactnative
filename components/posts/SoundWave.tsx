import React, { useRef } from "react";
import { View } from "react-native";

interface SoundWaveProps {
  isActive: boolean;
  progress: number;
  isSent?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  barCount?: number;
}

const SoundWave: React.FC<SoundWaveProps> = ({
  isActive,
  progress,
  isSent = false,
  activeColor = "#4ade80",
  inactiveColor = "rgba(102, 112, 133, 0.4)",
  barCount = 30,
}) => {
  // Generate waveform once and persist with useRef
  const generateWaveform = () => {
    const bars = [];
    for (let i = 0; i < barCount; i++) {
      const height = 5 + Math.random() * 15;
      bars.push(height);
    }
    return bars;
  };

  const waveform = useRef(generateWaveform()).current;
  const activeBarCount = Math.floor((progress / 100) * waveform.length);

  return (
    <View className="flex-row items-center justify-between h-6 w-full">
      {waveform.map((height, index) => {
        const isActiveBar = index < activeBarCount;
        return (
          <View
            key={index}
            style={{
              height: height,
              width: 2,
              backgroundColor: isActiveBar ? activeColor : inactiveColor,
              borderRadius: 1,
              marginHorizontal: 0.5,
            }}
          />
        );
      })}
    </View>
  );
};

export default SoundWave;
