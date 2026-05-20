import messaging from '@react-native-firebase/messaging';
import { registerRootComponent } from 'expo';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';
import App from './App';

// 🔔 Notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 🔔 Android channel
async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarm-channel', {
      name: 'Alarm Channel',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
    });
  }
}
setupNotificationChannel();

let defaultCalendarId: string | null = null;

// 📅 Parse "2026-04-08 13:05:12" safely
function parseEventDate(dateString?: string): Date {
  if (!dateString) return new Date();

  try {
    // Convert to ISO format
    const formatted = dateString.replace(' ', 'T');
    const date = new Date(formatted);

    if (!isNaN(date.getTime())) return date;
  } catch {}

  console.log('⚠️ Invalid date, fallback to now');
  return new Date();
}

// 📅 Get calendar
async function getCalendarId(): Promise<string | null> {
  if (defaultCalendarId) return defaultCalendarId;

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission denied', 'Calendar access required');
    return null;
  }

  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );

  const cal = calendars.find(c => c.allowsModifications) || calendars[0];

  if (cal) {
    defaultCalendarId = cal.id;
    return cal.id;
  }

  return null;
}

// 📅 Create event
async function createCalendarReminder(remoteMessage: any) {
  try {
    if (remoteMessage.data?.scope !== 'create_event') return false;

    const calId = await getCalendarId();
    if (!calId) return false;

    const title =
      remoteMessage.notification?.title ||
      remoteMessage.data?.title ||
      'Reminder';

    const body =
      remoteMessage.notification?.body ||
      remoteMessage.data?.body ||
      '';

    const start = parseEventDate(remoteMessage.data?.event_date);
    const end = new Date(start.getTime() + 5 * 60 * 1000);

    await Calendar.createEventAsync(calId, {
      title,
      notes: body,
      startDate: start,
      endDate: end,
      timeZone: 'Asia/Kolkata',
      alarms: [{ relativeOffset: -5 }],
    });

    console.log('✅ Event created:', start);
    return true;
  } catch (e) {
    console.log('❌ Calendar error:', e);
    return false;
  }
}

// 🔔 Show notification
async function showNotification(remoteMessage: any, created: boolean) {
  const title =
    remoteMessage.notification?.title ||
    remoteMessage.data?.title ||
    '';

  const body =
    remoteMessage.notification?.body ||
    remoteMessage.data?.body ||
    '';

  // ✅ Convert "1" → true
  const shouldOpen =
    remoteMessage.data?.openCalendar === '1' && created;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: {
        ...remoteMessage.data,
        openCalendar: shouldOpen,
      },
    },
    trigger: null,
  });
}

// 🧠 Main handler
async function handleMessage(remoteMessage: any) {
  console.log('📩 Message received:', remoteMessage);

  const created = await createCalendarReminder(remoteMessage);
  await showNotification(remoteMessage, created);
}

// 📩 Foreground
messaging().onMessage(handleMessage);

// 📩 Background / killed
messaging().setBackgroundMessageHandler(async remoteMessage => {
  await handleMessage(remoteMessage);
});

// 📅 Open calendar
async function openCalendarApp() {
  try {
    console.log('📅 Opening calendar');

    if (Platform.OS === 'android') {
      await Linking.openURL('content://com.android.calendar/time/');
    } else {
      await Linking.openURL('calshow:');
    }
  } catch (e) {
    console.log('❌ Failed to open calendar:', e);
  }
}

// 🔔 Notification click (foreground + background)
Notifications.addNotificationResponseReceivedListener(response => {
  const data = response.notification.request.content.data;

  if (data?.openCalendar) {
    openCalendarApp();
  }
});

// 🔥 KILLED STATE FIX
async function checkInitialNotification() {
  const response = await Notifications.getLastNotificationResponseAsync();

  if (response?.notification?.request?.content?.data?.openCalendar) {
    openCalendarApp();
  }
}

checkInitialNotification();

// 🚀 App entry
registerRootComponent(App);