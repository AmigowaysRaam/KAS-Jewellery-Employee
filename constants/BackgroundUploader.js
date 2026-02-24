import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useToast } from "./ToastContext";

const UploadContext = createContext();
export const useUploadManager = () => useContext(UploadContext);

export const BackgroundUploadManager = ({ children }) => {
  const [uploading, setUploading] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
//   const { showToast } = useToast();
  const { showToast } = useToast();

  // Add task to queue
  const addToQueue = async (task) => {
    const stored = await AsyncStorage.getItem("uploadQueue");
    const queue = stored ? JSON.parse(stored) : [];
    // Only one task at a time
    if (queue.length > 0 || uploading) {
      showToast("Another upload is in progress", "error");
      return;
    }

    await AsyncStorage.setItem("uploadQueue", JSON.stringify([task]));
    processQueue();
  };

  // Process queue
  const processQueue = async () => {
    if (uploading) return;

    const stored = await AsyncStorage.getItem("uploadQueue");
    const queue = stored ? JSON.parse(stored) : [];

    if (queue.length === 0) return;

    const task = queue[0];
    setUploading(true);
    setCurrentTask(task);

    try {
      showToast("Uploading...", "info");

      const result = await task.updateFunction(task.data);

      if (result?.success) {
        showToast(result.message || "Uploaded successfully", "success");
        await AsyncStorage.removeItem("uploadQueue");
      } else {
        showToast(result?.message || "Upload failed", "error");
      }
    } catch (err) {
      console.log(err);
      showToast("Upload error", "error");
    }

    setUploading(false);
    setCurrentTask(null);
  };

  useEffect(() => {
    processQueue(); // check queue on app start
  }, []);

  return (
    <UploadContext.Provider value={{ addToQueue, uploading }}>
      {children}

      {/* GLOBAL OVERLAY */}
      {uploading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.text}>Uploading in background...</Text>
        </View>
      )}
    </UploadContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    marginTop: 8,
  },
});