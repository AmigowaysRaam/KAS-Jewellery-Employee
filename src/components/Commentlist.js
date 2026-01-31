import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import TaskCard from "./TaskCard";
export default function CommentList({ comments, loading, ticketDetails, task, flatListRef, openImageViewer }) {
  const renderComment = ({ item }) => (
    <View style={styles.commentRow}>
      <View style={styles.commentBubble}>
        <Text style={styles.commentUser}>{item.user_name}</Text>
        {item.comment && <Text style={styles.commentText}>{item.comment}</Text>}
        {item.images?.map((uri, idx) => (
          <Image key={idx} source={{ uri }} style={styles.commentImage} />
        ))}
        {item.audio && <Text style={{ marginTop: hp(1), color: COLORS.primary }}>🎤 Audio attached</Text>}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={{ paddingBottom: hp(2) }}>
      {loading ? (
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubTitle} />
        </View>
      ) : task ? (
        <TaskCard task={ticketDetails} />
      ) : null}
      <Text style={styles.sectionTitle}>Comments</Text>
    </View>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={comments}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderComment}
      ListHeaderComponent={renderHeader}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingHorizontal: wp(3), paddingBottom: hp(5) }}
    />
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: wp(4), fontFamily: "Poppins_600SemiBold", marginVertical: hp(2), color: COLORS.primary },
  commentRow: { marginBottom: hp(1) },
  commentBubble: { backgroundColor: "#f1f1f1", borderRadius: wp(2), padding: wp(3) },
  commentUser: { fontFamily: "Poppins_500Medium", fontSize: wp(3.4), marginBottom: hp(0.5), color: "#333" },
  commentText: { fontFamily: "Poppins_400Regular", fontSize: wp(3.4), color: "#111" },
  commentImage: { width: wp(50), height: hp(15), marginTop: hp(1), borderRadius: wp(1.5) },
  skeletonContainer: { backgroundColor: "#ccc", padding: wp(3), borderRadius: wp(2), marginTop: wp(2) },
  skeletonTitle: { width: "60%", height: hp(3), backgroundColor: "#e0e0e0", borderRadius: wp(1.5), marginBottom: hp(1) },
  skeletonSubTitle: { width: "40%", height: hp(2.5), backgroundColor: "#e0e0e0", borderRadius: wp(1.5) },
});
