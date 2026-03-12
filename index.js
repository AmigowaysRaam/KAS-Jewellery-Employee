// index.js
import messaging from '@react-native-firebase/messaging';
import { registerRootComponent } from 'expo';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { AppState, NativeModules, Platform } from 'react-native';
import App from './App';

const { RingtoneModule } = NativeModules;

// -----------------------------
// Notification handler
// -----------------------------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // foreground sound handled manually
    shouldSetBadge: true,
  }),
});

// -----------------------------
// Setup notification channels
// -----------------------------
async function setupNotificationChannel() {
  console.log(NativeModules,"NativeModules")
  if (Platform.OS === 'android') {
    // Normal notifications
    await Notifications.setNotificationChannelAsync('custom-channel', {
      name: 'Custom Channel',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'notification', // matches res/raw/notification.mp3
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    // Alarm notifications (device default sound)
    await Notifications.setNotificationChannelAsync('alarm-channel', {
      name: 'Alarm Channel',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default', // device default alarm/notification tone
      vibrationPattern: [0, 500, 500, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }
}
setupNotificationChannel();

// -----------------------------
// Foreground custom sound (Expo AV)
// -----------------------------
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

      // Stop after 3 seconds
      stopTimeout = setTimeout(stopForegroundSound, 3000);
    }
  } catch (e) {
    console.log('Sound error:', e);
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

// -----------------------------
// Handle incoming FCM notifications
// -----------------------------
async function sendNotification(remoteMessage) {
  const messageBody =
    remoteMessage.notification?.body || remoteMessage.data?.body;

  // Foreground: play device ringtone + custom sound
  if (AppState.currentState === 'active') {
    RingtoneModule.play();      // play actual device ringtone
    await playForegroundSound(); // play Expo custom sound
  }

  // Schedule notification for background/killed state
  await Notifications.scheduleNotificationAsync({
    content: {
      title: remoteMessage.notification?.title ?? 'New Message',
      body: messageBody ?? '',
      data: remoteMessage.data ?? {},
      sound: 'default', // device default alarm/notification tone
    },
    trigger: null,
    android: {
      channelId: 'alarm-channel', // high-priority alarm channel
    },
  });
}

// -----------------------------
// Stop ringtone when user interacts
// -----------------------------
Notifications.addNotificationResponseReceivedListener(async () => {
  RingtoneModule.stop();
  await stopForegroundSound();
});

// -----------------------------
// Firebase listeners
// -----------------------------
messaging().setBackgroundMessageHandler(sendNotification);
messaging().onMessage(sendNotification);

// -----------------------------
// Register main component
// -----------------------------
registerRootComponent(App);