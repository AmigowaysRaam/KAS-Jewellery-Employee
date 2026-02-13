// index.js or main entry point
import messaging from '@react-native-firebase/messaging';
import { registerRootComponent } from 'expo';
import * as Notifications from 'expo-notifications';
import App from './App';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
// 🔥 Background handler for FCM messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🔥 Background FCM Message:', remoteMessage);

  // Show notification using Expo Notifications
  await Notifications.scheduleNotificationAsync({
    content: {
      title: remoteMessage.notification?.title ?? 'Notification',
      body: remoteMessage.notification?.body ?? '',
      data: remoteMessage.data,
    },
    trigger: null, // Immediate notification
  });
});

// Foreground handler for FCM messages
messaging().onMessage(async remoteMessage => {
  console.log('💬 Foreground FCM Message:', remoteMessage);
  // Display notification immediately
  await Notifications.scheduleNotificationAsync({
    content: {
      title: remoteMessage.notification?.title ?? 'Notification',
      body: remoteMessage.notification?.body ?? '',
      data: remoteMessage.data,
    },
    trigger: null,
  });

  // Optional: show alert in foreground
 
});
// Optional: get device token for push notifications
// async function getDeviceToken() {
//   const token = await messaging().getToken();
//   console.log('📱 FCM Device Token:', token);
//   return token;
// }
// getDeviceToken();
// Register root component
registerRootComponent(App);
