import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from({ length: 50 }, (_, i) => 2000 + i);

const CustomSingleDatePickerModal = ({
    visible,
    onClose,
    onConfirm,
    initialDate,
    title,disablePastDates
}) => {
    const today = dayjs();

    const [selectedDate, setSelectedDate] = useState(
        initialDate ? dayjs(initialDate) : null
    );
    const [currentMonth, setCurrentMonth] = useState(
        initialDate ? dayjs(initialDate).month() : today.month()
    );
    const [currentYear, setCurrentYear] = useState(
        initialDate ? dayjs(initialDate).year() : today.year()
    );
    const [daysInMonth, setDaysInMonth] = useState([]);

    const yearListRef = useRef(null);

    /* 🔥 FIX: correct weekday alignment */
    useEffect(() => {
        const firstDayOfMonth = dayjs()
            .year(currentYear)
            .month(currentMonth)
            .date(1);

        const startWeekDay = firstDayOfMonth.day(); // 0 = Sun
        const totalDays = firstDayOfMonth.daysInMonth();

        const days = [];

        // Empty slots before first day
        for (let i = 0; i < startWeekDay; i++) {
            days.push(null);
        }

        // Actual days
        for (let i = 1; i <= totalDays; i++) {
            days.push(
                dayjs()
                    .year(currentYear)
                    .month(currentMonth)
                    .date(i)
            );
        }

        setDaysInMonth(days);
    }, [currentMonth, currentYear]);

    // Scroll to selected year
    useEffect(() => {
        if (yearListRef.current && visible) {
            const index = YEARS.indexOf(currentYear);
            if (index >= 0) {
                yearListRef.current.scrollToIndex({ index, animated: true });
            }
        }
    }, [visible, currentYear]);

    const selectDate = (day) => {
        setSelectedDate(day);
    };

    const confirm = () => {
        onConfirm(selectedDate?.toDate());
        onClose();
    };

    const clearDate = () => {
        setSelectedDate(null);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>
                        {title || "Select Date"}
                    </Text>

                    {/* Selected Date */}
                    <View style={styles.selectedDatesContainer}>
                        <View style={styles.selectedDate}>
                            <Text style={styles.selectedDateText}>
                                {selectedDate
                                    ? selectedDate.format("DD/MM/YYYY")
                                    : "Select Date"}
                            </Text>
                            {selectedDate && (
                                <Pressable onPress={clearDate}>
                                    <Icon
                                        name="close"
                                        size={wp(5)}
                                        color={COLORS.primary}
                                    />
                                </Pressable>
                            )}
                        </View>
                    </View>

                    {/* Month Picker */}
                    <FlatList
                        horizontal
                        data={MONTHS}
                        keyExtractor={(item) => item}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <Pressable
                                onPress={() => setCurrentMonth(index)}
                                style={[
                                    styles.monthItem,
                                    index === currentMonth && styles.activeMonthItem,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.monthText,
                                        index === currentMonth && styles.activeMonthText,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </Pressable>
                        )}
                    />

                    {/* Year Picker */}
                    <FlatList
                        horizontal
                        ref={yearListRef}
                        data={YEARS}
                        keyExtractor={(item) => item.toString()}
                        showsHorizontalScrollIndicator={false}
                        getItemLayout={(_, index) => ({
                            length: wp(20),
                            offset: hp(7) * index,
                            index,
                        })}
                        onScrollToIndexFailed={(info) => {
                            setTimeout(() => {
                                yearListRef.current?.scrollToIndex({
                                    index: info.index,
                                    animated: true,
                                });
                            }, 100);
                        }}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => setCurrentYear(item)}
                                style={[
                                    styles.yearItem,
                                    item === currentYear && styles.activeYearItem,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.yearText,
                                        item === currentYear && styles.activeYearText,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </Pressable>
                        )}
                    />

                    {/* Calendar Grid */}
                    <View style={styles.grid}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                            (day) => (
                                <Text key={day} style={styles.weekDay}>
                                    {day}
                                </Text>
                            )
                        )}

                        {daysInMonth.map((day, index) => {
                            if (!day) {
                                return (
                                    <View
                                        key={`empty-${index}`}
                                        style={styles.dayItem}
                                    />
                                );
                            }

                            const isSelected =
                                selectedDate &&
                                day.isSame(selectedDate, "day");
                            const isToday = day.isSame(dayjs(), "day");
                            // disablePastDates
                            const isPast =  day.isBefore(today, "day"); // restrict past dates
                            return (
                                <Pressable
                                    key={day.format("YYYY-MM-DD")}
                                    disabled={disablePastDates && isPast}
                                    onPress={() => selectDate(day)}
                                    style={[
                                        styles.dayItem,
                                        isToday && !isSelected && styles.todayDayItem,
                                        isSelected && styles.activeDayItem,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            isToday && !isSelected && styles.todayDayText,
                                            isSelected && styles.activeDayText,
                                            disablePastDates && isPast && { color: "#ccc" },
                                        ]}
                                    >
                                        {day.date()}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable
                            style={styles.cancelBtn}
                            onPress={onClose}
                        >
                            <Text style={styles.cancel}>Cancel</Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.confirmBtn,
                                !selectedDate && { opacity: 0.5 },
                            ]}
                            onPress={confirm}
                            disabled={!selectedDate}
                        >
                            <Text style={styles.ok}>Confirm</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        width: wp(95),
        backgroundColor: "#fff",
        borderRadius: wp(4),
        padding: wp(4),
        paddingVertical: hp(4)
    },
    title: {
        fontSize: wp(4),
        fontFamily: "Poppins_600SemiBold",
        textAlign: "center",
        marginBottom: hp(1),
    },

    selectedDatesContainer: {
        alignItems: "center",
        marginBottom: hp(1),
    },
    selectedDate: {
        width: wp(85),
        flexDirection: "row",
        borderWidth: wp(0.5),
        borderColor: COLORS.primary,
        borderRadius: wp(2),
        padding: wp(3),
        justifyContent: "space-between",
        alignItems: "center",
    },
    selectedDateText: {
        color: COLORS.primary,
        fontFamily: "Poppins_500Medium",
    },
    monthItem: {
        marginHorizontal: wp(2),
        padding: wp(2),
        borderRadius: wp(3),
        marginVertical: hp(1),

    },
    activeMonthItem: { backgroundColor: COLORS.primary },
    monthText: { color: "#333" },
    activeMonthText: { color: "#fff" },

    yearItem: {
        marginHorizontal: wp(2),
        padding: wp(2),
        borderRadius: wp(3),
        marginVertical: hp(2),
    },
    activeYearItem: { backgroundColor: COLORS.primary },
    yearText: { color: "#333" },
    activeYearText: { color: "#fff" },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: hp(1),
    },
    weekDay: {
        width: wp(12),
        textAlign: "center",
        fontWeight: "600",
    },
    dayItem: {
        width: wp(12),
        height: wp(12),
        justifyContent: "center",
        alignItems: "center",
        marginVertical: hp(0.5),
        borderRadius: wp(6),
        
    },
    activeDayItem: { backgroundColor: COLORS.primary },
    dayText: { fontSize: wp(4), color: "#333" },
    activeDayText: { color: "#fff", fontFamily: "Poppins_600SemiBold" },

    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: hp(2),
    },
    cancelBtn: {
        borderWidth: wp(0.5),
        borderColor: COLORS.primary,
        borderRadius: wp(2),
        padding: wp(2),
        marginRight: wp(3),
    },
    confirmBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: wp(2),
        padding: wp(2),
    },
    cancel: { color: COLORS.primary, fontSize: wp(4.5) },
    ok: { color: "#fff", fontSize: wp(4.5) },
    todayDayItem: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },

    todayDayText: {
        color: COLORS.primary,
        fontFamily: "Poppins_600SemiBold",
    },

});

export default CustomSingleDatePickerModal;
