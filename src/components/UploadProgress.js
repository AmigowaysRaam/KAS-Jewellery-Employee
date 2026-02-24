import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useUploadStatus } from "../../constants/UploadContext";

const UploadProgress = () => {
  const { uploadingCount, uploadedCount, totalCount } = useUploadStatus();
  if (totalCount === 0) return null;
  return (
    <View style={styles.container}>
      <Text>{`Uploading ${uploadedCount}/${totalCount} tasks...`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "#000000aa",
    zIndex: 999,
    alignItems: "center",
  },
});

export default UploadProgress;