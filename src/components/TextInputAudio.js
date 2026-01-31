import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function TextInputWithAudio({
  value,
  onChangeText,
  placeholder,
  audio,
  isPlaying,
  startRecording,
  playAudio,
  stopAudio,
  deleteAudio,
  recordTime,
  style,
  multiline = false,
}) {
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={[styles.inputContainer, style]}>
      <TextInput
        style={[styles.input, multiline && { height: hp(15), textAlignVertical: "top", paddingRight: wp(12) }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor={COLORS.black}
      />
      {audio ? (
        <View style={styles.audioPreview}>
          <Text style={{ fontSize: wp(3), marginRight: wp(1) }}>
            {audio.name} (
            {audio.duration ? formatTime(audio.duration * 1000) : recordTime > 0 ? formatTime(recordTime * 1000) : "0:00"}
            )
          </Text>
          <TouchableOpacity onPress={() => (isPlaying ? stopAudio() : playAudio())}>
            <Icon name={isPlaying ? "pause" : "play-arrow"} size={wp(7)} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteAudio}>
            <Icon name="x-circle" type="feather" size={wp(5.3)} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.micIconContainer} onPress={startRecording}>
          <Icon name="mic" type="feather" size={wp(5)} color={COLORS.gray} />
        </TouchableOpacity>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  inputContainer: { marginBottom: hp(2), position: "relative" },
  input: { borderWidth: 1, borderColor: COLORS.gray, borderRadius: wp(2), padding: wp(3), fontSize: wp(3.5), color: COLORS.black },
  audioPreview: { flexDirection: "row", alignItems: "center", borderWidth: wp(0.3), borderColor: COLORS.primary, borderRadius: wp(24), paddingHorizontal: wp(1), maxWidth: wp(40), justifyContent: "space-around", marginTop: hp(1) },
  micIconContainer: { position: "absolute", right: wp(3), top: hp(1.5), zIndex: 10 },
});
