import React from "react";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import TaskCard from "./TaskCard";
export default function CommentList({ comments, loading, ticketDetails, task, flatListRef, openImageViewer,
  loadData
}) {
  const renderComment = ({ item, index }) => (
    <View style={styles.commentRow}>
      {/* <Text style={styles.commentUser}>{JSON.stringify(item?.audio, null, 2)}</Text> */}
      <View style={[styles.commentBubble, {
        backgroundColor: index % 2 == 0 ? "#f1f1f1" : "#ccc"
      }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text numberOfLines={1} style={styles.commentUser}>{item.user_name}</Text>
          <Text style={[{
            fontSize: wp(2.5), color: COLORS?.primary, fontFamily: "Poppins_600SemiBold",
          }]}>{item.created}</Text>
        </View>
        {item?.description && <Text style={styles.commentText}>{item?.description}</Text>}
        {item?.images?.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: hp(1) }}
          >
            {item.images.map((uri, idx) => (
              <Pressable
                key={idx}
                onPress={() => openImageViewer(uri)}>
                <Image
                  key={idx}
                  source={{ uri: uri }}
                  style={{
                    width: wp(20),
                    height: wp(20),
                    borderRadius: wp(2),
                    marginRight: wp(2), borderWidth: wp(0.5), borderColor: COLORS?.primary
                  }}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
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
        <TaskCard task={ticketDetails} loadData={loadData} />
      ) : null}
      <Text style={styles.sectionTitle}>Comments</Text>
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
    />
  );
}
const styles = StyleSheet.create({
  sectionTitle: { fontSize: wp(4), fontFamily: "Poppins_600SemiBold", marginTop: hp(1), color: COLORS.primary },
  commentRow: { marginBottom: hp(1) },
  commentBubble: { borderRadius: wp(2), padding: wp(3) },
  commentUser: { fontFamily: "Poppins_600SemiBold", fontSize: wp(3.4), marginBottom: hp(0.5), color: COLORS?.primary, textTransform: "uppercase", maxWidth: wp(60) },
  commentText: { fontFamily: "Poppins_400Regular", fontSize: wp(4), color: "#000" },
  commentImage: {
    width: wp(25), height: hp(10), marginTop: hp(1), borderRadius: wp(1.5),
    borderWidth: wp(0.5), borderRadius: wp(2), borderColor: COLORS?.primary
  },
  skeletonContainer: { backgroundColor: "#ccc", padding: wp(3), borderRadius: wp(2), marginTop: wp(2) },
  skeletonTitle: { width: "60%", height: hp(3), backgroundColor: "#e0e0e0", borderRadius: wp(1.5), marginBottom: hp(1) },
  skeletonSubTitle: { width: "40%", height: hp(2.5), backgroundColor: "#e0e0e0", borderRadius: wp(1.5) },
});