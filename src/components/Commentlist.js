import { Ionicons } from "@expo/vector-icons";
import { Audio, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import TaskCard from "./TaskCard";

export default function CommentList({
  comments,
  loading, ticketDetails, task, flatListRef,
  openImageViewer,
  loadData, openVideoViewer
}) {
  const { t } = useTranslation();
  const soundRef = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);
  const handleAudioPress = async (uri, id) => {
    console.log("Audio button pressed for ID:", id, playingId);
    if (playingId === id && soundRef.current) {
      await soundRef.current.pauseAsync();
      setPlayingId(null);
      return;
    }
    setLoadingId(id);
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
    soundRef.current = sound;
    setPlayingId(id);
    setLoadingId(null);
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) setPlayingId(null);
    });
  };

  const renderComment = ({ item, index }) => {
    const isLeft = index.position == "left";
    const commentId = item.id ?? item.created;
    return (
      <>
        <View style={styles.commentRow}>
          <View
            style={[
              styles.commentBubble,
              isLeft ? styles.leftBubble : styles.rightBubble,
            ]}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.userRow}>
                <Image source={{ uri: item.user_image }} style={styles.avatar} />
                <View style={styles.userTextContainer}>
                  <Text numberOfLines={1} style={styles.userName}>
                    {`${item.user_name} (${item.employee_id})`}
                  </Text>
                  <Text numberOfLines={1} style={styles.userSubText}>
                    {item?.phone_number ? item.phone_number : t("no_phone")}
                  </Text>
                </View>
              </View>
              <Text style={styles.dateText}>{item.created}</Text>
            </View>

            {item.description && (
              <Text style={styles.commentText}>{item.description}</Text>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: hp(0.5) }}
            >
              {item.images?.map((uri, idx) => (
                <Pressable key={idx} onPress={() => openImageViewer(uri)}>
                  <Image source={{ uri }} style={styles.mediaItem} />
                </Pressable>
              ))}

              {item.video && (
                <Pressable onPress={() => openVideoViewer(item.video)}>
                  <View style={styles.mediaItem}>
                    <Video
                      source={{ uri: item.video }}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                      shouldPlay={false}
                      useNativeControls={false}
                    />
                    <View style={styles.playButtonOverlay}>
                      <Ionicons name="play" size={wp(6)} color="#fff" />
                    </View>
                  </View>
                </Pressable>
              )}
            </ScrollView>

            {item.audio && (
              <AudioPlayerButton
                uri={item.audio}
                id={commentId}
                isPlaying={playingId === commentId}
                isLoading={loadingId === commentId}
                onPress={handleAudioPress}
                aName={item.audio_name}
              />
            )}
          </View>
        </View>
        {/* ✅ Show center info only if updated_info exists */}
        {item?.updated_info  && item?.description != '' ?  (
          <View style={styles.centerInfoContainer}>
            <View style={styles.centerInfoText}>
              <Text style={styles.centerInfoText}>{item?.created}</Text>
              <Text numberOfLines={1} style={styles.centerInfoText}>{item?.description}</Text>
            </View>


          </View>
        ) : null}
      </>
    );
  };


  const renderHeader = () => (
    <View style={{ paddingBottom: hp(2) }}>
      {loading ? (
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubTitle} />
        </View>
      ) : task ? (
        <TaskCard task={ticketDetails} loadData={loadData} />
      ) : null}
      {/* <Text style={styles.sectionTitle}>{t("comments")}</Text> */}
    </View>
  );
  return (
    <ImageBackground
      source={require('../../assets/dodleBg.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <FlatList
        ref={flatListRef}
        data={comments}
        renderItem={renderComment}

        keyExtractor={(item, index) =>
          item.id?.toString() || index.toString()
        }
        ListHeaderComponent={renderHeader}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: wp(3),
          paddingBottom: hp(5),
          backgroundColor: COLORS.primary + "90",
        }}
        refreshing={loading}
        onRefresh={loadData}

        ListEmptyComponent={() =>
          !loading && (
            <View style={{ marginTop: hp(5), alignItems: "center" }}>
              <Text style={{ color: "#444", fontSize: wp(4) }}>
                {t("no_comments")}
              </Text>
            </View>
          )
        }
      />
    </ImageBackground>
  );
}
function AudioPlayerButton({ uri, id, isPlaying, isLoading, onPress, aName }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef(null);
  useEffect(() => {
    if (isPlaying) {
      // Start looped animation
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      animationRef.current.start();
    } else {
      // Stop animation and reset scale
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      scaleAnim.setValue(1);
    }
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      scaleAnim.setValue(1);
    };
  }, [isPlaying]);
  return (
    <Pressable style={styles.audioContainer} onPress={() => onPress(uri, id)}>
      {isLoading ? (
        <ActivityIndicator size={wp(4.5)} color={COLORS.primary} style={{ marginRight: wp(2) }} />
      ) : (
        <Animated.View style={[styles.audioButton, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={wp(5)} color="#fff" />
        </Animated.View>
      )}
      <Text style={styles.audioLabel}>{aName || 'Play'}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: wp(4),
    fontFamily: "Poppins_600SemiBold",
    marginTop: hp(1),
    color: COLORS.primary,
  },
  commentRow: {
    width: "100%",
    marginBottom: hp(1),
  },
  commentBubble: {
    maxWidth: "85%",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(3),
  },
  leftBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
    marginRight: wp(10),
    borderTopLeftRadius: wp(0.5),
    width: "100%",
  },
  mediaItem: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    borderWidth: wp(0.5),
    borderColor: COLORS.primary,
    marginRight: wp(2),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    overflow: "hidden",
  },
  playButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: wp(2),
  },

  rightBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    marginLeft: wp(10),
    borderTopRightRadius: wp(0.5),
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(0.3),
  },
  dateText: {
    fontSize: wp(2.6),
    color: "#444",
    fontFamily: "Poppins_400Regular",
  },
  commentText: {
    fontFamily: "Poppins_400Regular",
    fontSize: wp(4),
    color: "#000",
    marginTop: hp(0.5),
  },

  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1.2),
  },
  audioButton: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  audioLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.primary, lineHeight: hp(2.6),
  },
  skeletonContainer: {
    backgroundColor: "#ccc",
    padding: wp(3),
    borderRadius: wp(2),
    marginTop: wp(2),
  }, centerInfoContainer: {
    alignItems: "center",
    marginVertical: hp(1),borderRadius: wp(0),
  }, centerInfoText: {
    fontSize: wp(3.5),
    color: "#999",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.1),
    borderRadius: wp(10),lineHeight: hp(3)
  },
  skeletonTitle: {
    width: "60%",
    height: hp(3),
    backgroundColor: "#e0e0e0",
    borderRadius: wp(1.5),
    marginBottom: hp(1),
  },
  skeletonSubTitle: {
    width: "40%",
    height: hp(2.5),
    backgroundColor: "#e0e0e0",
    borderRadius: wp(1.5),
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    marginRight: wp(3),
    borderWidth: wp(0.5),
    borderColor: COLORS.primary,
  },
  userTextContainer: {
    justifyContent: "center",
  },
  userName: {
    fontFamily: "Poppins_400Regular",
    fontSize: wp(3.5),
    color: COLORS.primary,
    textTransform: "capitalize",
  },
  userSubText: {
    fontFamily: "Poppins_400Regular",
    fontSize: wp(2.8),
    color: "#222",
    position: "relative", bottom: hp(0.4)
  },
});
