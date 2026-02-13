import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import TaskCard from "./TaskCard";
export default function CommentList({ comments, loading, ticketDetails, task, flatListRef, openImageViewer,
  loadData
}) {
  const { t } = useTranslation();

  const renderComment = ({ item, index }) => {
    const isLeft = index % 2 === 0;

    return (
      <View style={styles.commentRow}>
        <View
          style={[
            styles.commentBubble,
            isLeft ? styles.leftBubble : styles.rightBubble,
          ]}
        >
          <View style={styles.headerRow}>
            <Text numberOfLines={1} style={styles.commentUser}>
              {item.user_name}
            </Text>
            <Text style={styles.dateText}>{item.created}</Text>
          </View>
          {item?.description && (
            <Text style={styles.commentText}>{item.description}</Text>
          )}
          {item?.images?.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: hp(1) }}
            >
              {item.images.map((uri, idx) => (
                <Pressable key={idx} onPress={() => openImageViewer(uri)}>
                  <Image source={{ uri }} style={styles.image} />
                </Pressable>
              ))}
            </ScrollView>
          )}
          {item.audio && (
            <Text style={styles.audioText}>
              🎤 {t("audio_attatched")}
            </Text>
          )}
        </View>
      </View>
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
      <Text style={styles.sectionTitle}>{t('comments')}</Text>
    </View>
  );
  return (
    <FlatList
      ref={flatListRef}
      data={comments}
      renderItem={renderComment}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      ListHeaderComponent={renderHeader}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingHorizontal: wp(3), paddingBottom: hp(5) }}
      refreshing={loading}
      colors={[COLORS.primary]}
      tintColor={COLORS.primary}
      progressBackgroundColor="#f2f2f2"
      ListEmptyComponent={() =>
        !loading && (
          <View style={{ marginTop: hp(5), alignItems: "center" }}>
            <Text style={{ color: "#444", fontSize: wp(4) }}>
              {t("no_comments")}
            </Text>
          </View>
        )
      }
      onRefresh={() => {
        loadData(); // 👈 refresh comments
      }}
    />
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
    maxWidth: "80%",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(3),
  },

  /* LEFT MESSAGE */
  leftBubble: {    alignSelf: "flex-start",    backgroundColor: "#f1f1f1",
    marginRight: wp(10),    borderTopLeftRadius: wp(0.5),
    width: "100%",  },  /* RIGHT MESSAGE */  rightBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6", // WhatsApp green
    marginLeft: wp(10),
    borderTopRightRadius: wp(0.5),
    width: "100%",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(0.3),
  },

  commentUser: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: wp(3.2),
    color: COLORS.primary,
    maxWidth: wp(45),
    textTransform: "uppercase",
  },

  dateText: {
    fontSize: wp(2.4),
    color: "#666",
    fontFamily: "Poppins_400Regular",
    marginLeft: wp(2),
  },

  commentText: {
    fontFamily: "Poppins_400Regular",
    fontSize: wp(4),
    color: "#000",
  },

  image: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    marginRight: wp(2),
    borderWidth: wp(0.5),
    borderColor: COLORS.primary,
  },

  audioText: {
    marginTop: hp(0.8),
    color: COLORS.primary,
  },

  skeletonContainer: {
    backgroundColor: "#ccc",
    padding: wp(3),
    borderRadius: wp(2),
    marginTop: wp(2),
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
});
