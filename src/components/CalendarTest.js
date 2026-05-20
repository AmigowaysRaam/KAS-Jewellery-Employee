import * as Calendar from "expo-calendar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Platform,
  Text,
  View,
} from "react-native";

export default function AndroidCalendarTest() {
  const [calendarId, setCalendarId] = useState(null);
  const [events, setEvents] = useState([]);

  // -----------------------------
  // Request Permission
  // -----------------------------
  const requestCalendarPermission = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status === "granted") {
      return true;
    } else {
      Alert.alert("Permission Denied", "Cannot access calendar");
      return false;
    }
  };

  // -----------------------------
  // Create Calendar (SAFE)
  // -----------------------------
  const createAndroidCalendar = async () => {
    try {
      const defaultSource =
        Platform.OS === "android"
          ? { isLocalAccount: true, name: "Expo" }
          : await Calendar.getDefaultCalendarAsync();

      const newCalendarId = await Calendar.createCalendarAsync({
        title: "Test Calendar",
        color: "blue",
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultSource.id,
        source: defaultSource,
        name: "TestCalendar",
        ownerAccount: "personal",
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      return newCalendarId;
    } catch (error) {
      Alert.alert("Calendar Error", error.message);
      return null;
    }
  };

  // -----------------------------
  // Get or Create ONLY our calendar
  // -----------------------------
  const getCalendar = async () => {
    let calId = calendarId;

    if (!calId) {
      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );

      // Find our custom calendar
      const existingCalendar = calendars.find(
        (cal) => cal.title === "Test Calendar"
      );

      if (existingCalendar) {
        calId = existingCalendar.id;
      } else {
        calId = await createAndroidCalendar();
      }

      setCalendarId(calId);
    }

    return calId;
  };

  // -----------------------------
  // Add Event
  // -----------------------------
  const addEvent = async () => {
    const hasPermission = await requestCalendarPermission();
    if (!hasPermission) return;

    const calId = await getCalendar();
    if (!calId) return;

    const startDate = new Date(Date.now() + 60 * 1000); // 1 min later
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    try {
      await Calendar.createEventAsync(calId, {
        title: "Test Event in 1 min",
        startDate,
        endDate,
        timeZone: "Asia/Kolkata",
        location: "Android Device",
        alarms: [{ relativeOffset: 0 }],
      });

      Alert.alert("Event created!");
      loadEvents();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // -----------------------------
  // Load Events (ONLY from our calendar)
  // -----------------------------
  const loadEvents = async () => {
    const hasPermission = await requestCalendarPermission();
    if (!hasPermission) return;

    const calId = await getCalendar();
    if (!calId) return;

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);

    try {
      const fetchedEvents = await Calendar.getEventsAsync(
        [calId],
        start,
        end
      );

      setEvents(fetchedEvents);
    } catch (err) {
      console.log("Fetch error", err);
    }
  };

  // -----------------------------
  // Load on start
  // -----------------------------
  useEffect(() => {
    loadEvents();
  }, []);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Android Calendar Test
      </Text>

      <Button title="Add Event in 1 min" onPress={addEvent} />
      <View style={{ height: 10 }} />
      <Button title="Refresh Events" onPress={loadEvents} />

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              borderBottomWidth: 1,
              borderColor: "#ccc",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
            <Text>
              {new Date(item.startDate).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ marginTop: 20 }}>No events found</Text>
        }
      />
    </View>
  );
}