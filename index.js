// index.js
import messaging from '@react-native-firebase/messaging';
import { registerRootComponent } from 'expo';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import App from './App';

// ---------------------------
// 1️⃣ Notification handler
// ---------------------------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // we handle foreground sound manually
    shouldSetBadge: true,
  }),
});

// ---------------------------
// 2️⃣ Android notification channel for custom sound
// ---------------------------
async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('custom-channel', {
      name: 'Custom Channel',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'notification', // must match res/raw/notification.mp3 (no extension)
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

// ---------------------------
// 3️⃣ Notification category with multiple buttons
// ---------------------------
async function setupNotificationCategories() {
  await Notifications.setNotificationCategoryAsync('chat', [
    // {
    //   identifier: 'reply',
    //   buttonTitle: 'Reply',
    //   options: { opensAppToForeground: true },
    // },
    // {
    //   identifier: 'like',
    //   buttonTitle: 'Like',
    //   options: { opensAppToForeground: false },
    // },
    {
      identifier: 'ok',
      buttonTitle: 'OK',
      options: { opensAppToForeground: true },
    },
  ]);
}

// Initialize
setupNotificationChannel();
setupNotificationCategories();

// ---------------------------
// 4️⃣ Foreground looping sound
// ---------------------------
let soundObject = null;
let stopTimeout = null;

async function playForegroundSound() {
  try {
    await stopForegroundSound();
    if (AppState.currentState === 'active') {
      soundObject = new Audio.Sound();
      await soundObject.loadAsync(require('./assets/notification.mp3'));
      await soundObject.setIsLoopingAsync(true);
      await soundObject.playAsync();

      // auto stop after 5 seconds
      stopTimeout = setTimeout(stopForegroundSound, 5000);
    }
  } catch (e) {
    console.log('Error playing sound:', e);
  }
}

async function stopForegroundSound() {
  if (stopTimeout) {
    clearTimeout(stopTimeout);
    stopTimeout = null;
  }
  if (soundObject) {
    await soundObject.stopAsync();
    await soundObject.unloadAsync();
    soundObject = null;
  }
}

// ---------------------------
// 5️⃣ Schedule notification
// ---------------------------
async function sendNotification(remoteMessage) {
  const imageUrl =
    remoteMessage.notification?.image || remoteMessage.data?.image;

  // Play sound in foreground
  if (AppState.currentState === 'active') {
    await playForegroundSound();
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: remoteMessage.notification?.title ?? 'New Message',
      body: remoteMessage.notification?.body ?? '',
      data: remoteMessage.data ?? {},
      attachments: imageUrl ? [{ url: imageUrl }] : [],
      categoryIdentifier: 'chat', // use chat category to show buttons
      sound: 'notification', // system custom sound for background
    },
    trigger: null,
    android: {
      channelId: 'custom-channel', // required for custom sound on Android
    },
  });
}

// ---------------------------
// 6️⃣ FCM Handlers
// ---------------------------
messaging().setBackgroundMessageHandler(sendNotification);
messaging().onMessage(sendNotification);

// ---------------------------
// 7️⃣ Handle action buttons
// ---------------------------
Notifications.addNotificationResponseReceivedListener(async (response) => {
  const action = response.actionIdentifier;
  console.log('Notification button pressed:', action);
  if (action === 'reply') {
    console.log('User tapped Reply - you can open chat input');
  } else if (action === 'like') {
    console.log('User tapped Like');
  } else if (action === 'ok') {
    console.log('User tapped OK');
  }

  // Stop foreground sound
  await stopForegroundSound();
});

// ---------------------------
// 8️⃣ Register App
// ---------------------------
registerRootComponent(App);
