import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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

const CustomDateRangePickerModal = ({
    visible,
    onClose,
    onConfirm,
    initialFrom,
    initialTo,
    title,
}) => {
    const today = dayjs();
    const [fromDate, setFromDate] = useState(initialFrom ? dayjs(initialFrom) : null);
    const [toDate, setToDate] = useState(initialTo ? dayjs(initialTo) : null);
    const { t } = useTranslation()
    const [currentMonth, setCurrentMonth] = useState(today.month());
    const [currentYear, setCurrentYear] = useState(today.year());
    const [daysInMonth, setDaysInMonth] = useState([]);

    const yearListRef = useRef(null);

    /* ✅ Correct weekday alignment */
    useEffect(() => {
        const firstDayOfMonth = dayjs()
            .year(currentYear)
            .month(currentMonth)
            .date(1);

        const startWeekDay = firstDayOfMonth.day();
        const totalDays = firstDayOfMonth.daysInMonth();

        const days = [];
        for (let i = 0; i < startWeekDay; i++) {
            days.push(null);
        }
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

    useEffect(() => {
        if (yearListRef.current && visible) {
            const index = YEARS.indexOf(currentYear);
            if (index >= 0) {
                yearListRef.current.scrollToIndex({ index, animated: true });
            }
        }
    }, [visible, currentYear]);

    const selectDate = (day) => {
        if (!fromDate || (fromDate && toDate)) {
            setFromDate(day);
            setToDate(null);
        } else {
            if (day.isBefore(fromDate, "day")) return;
            setToDate(day);
        }
    };

    const isInRange = (day) => {
        if (!fromDate || !toDate) return false;
        return day.isAfter(fromDate, "day") && day.isBefore(toDate, "day");
    };

    const confirm = () => {
        onConfirm({
            from: fromDate?.toDate(),
            to: toDate?.toDate(),
        });
        onClose();
    };

    const clearDates = () => {
        setFromDate(null);
        setToDate(null);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>
                        {title || "Select Date Range"}
                    </Text>

                    {/* Selected Dates */}
                    <View style={styles.selectedDatesContainer}>
                        <View style={styles.selectedDate}>
                            <Text style={styles.selectedDateText}>
                                {fromDate ? fromDate.format("DD/MM/YYYY") : "From Date"}{" "}
                                -{" "}
                                {toDate ? toDate.format("DD/MM/YYYY") : "To Date"}
                            </Text>
                            {(fromDate || toDate) && (
                                <Pressable onPress={clearDates}>
                                    <Icon name="close" size={wp(5)} color={COLORS.primary} />
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
                            offset: hp(7.2) * index,
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

                    {/* Calendar */}
                    <View style={styles.grid}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                            <Text key={d} style={styles.weekDay}>{d}</Text>
                        ))}

                        {daysInMonth.map((day, index) => {
                            if (!day) {
                                return <View key={`empty-${index}`} style={styles.dayItem} />;
                            }

                            const isSelected =
                                (fromDate && day.isSame(fromDate, "day")) ||
                                (toDate && day.isSame(toDate, "day"));

                            const isToday = day.isSame(today, "day");
                            const inRange = isInRange(day);

                            const disabled =
                                fromDate &&
                                !toDate &&
                                day.isBefore(fromDate, "day");

                            return (
                                <Pressable
                                    key={day.format("YYYY-MM-DD")}
                                    onPress={() => !disabled && selectDate(day)}
                                    style={[
                                        styles.dayItem,
                                        isToday && !isSelected && styles.todayDayItem,
                                        inRange && styles.inRangeDayItem,
                                        isSelected && styles.activeDayItem,
                                        disabled && { opacity: 0.3 },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            isToday && !isSelected && styles.todayDayText,
                                            (isSelected || inRange) && styles.activeDayText,
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
                        <Pressable onPress={onClose}>
                            <Text style={styles.cancel}>{t('cancel')}</Text>
                        </Pressable>

                        <Pressable onPress={confirm} disabled={!fromDate || !toDate}>
                            <Text
                                style={[
                                    styles.ok,
                                    (!fromDate || !toDate) && { opacity: 0.5 },
                                ]}
                            >
                                {t('confirm')}
                            </Text>
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
        paddingVertical: hp(4),
    },
    title: {
        fontSize: wp(4),
        fontFamily: "Poppins_600SemiBold",
        textAlign: "center",
        marginBottom: hp(1),
    },

    selectedDatesContainer: { alignItems: "center", marginBottom: hp(1) },
    selectedDate: {
        width: wp(85),
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: wp(0.5),
        borderColor: COLORS.primary,
        padding: wp(4),
        borderRadius: wp(2),
    },
    selectedDateText: {
        color: COLORS.primary,
        fontFamily: "Poppins_500Medium",
    },
    monthItem: {
        marginHorizontal: wp(2), padding: wp(2), borderRadius: wp(2),
        marginVertical: hp(0.5)
    },
    activeMonthItem: { backgroundColor: COLORS.primary },
    monthText: { color: "#333" },
    activeMonthText: { color: "#fff" },

    yearItem: {
        marginHorizontal: wp(2), padding: wp(2), borderRadius: wp(2),
        marginVertical: hp(0.5)
    },
    activeYearItem: { backgroundColor: COLORS.primary },
    yearText: { color: "#333" },
    activeYearText: { color: "#fff" },

    grid: { flexDirection: "row", flexWrap: "wrap", marginTop: hp(1) },
    weekDay: { width: wp(12), textAlign: "center", fontWeight: "600" },

    dayItem: {
        width: wp(12),
        height: wp(12),
        justifyContent: "center",
        alignItems: "center",
        marginVertical: hp(0.5),
        borderRadius: wp(6),
    },
    inRangeDayItem: {
        backgroundColor: COLORS.primary + "80",
    },
    activeDayItem: {
        backgroundColor: COLORS.primary,
    },

    /* 🔥 TODAY highlight */
    todayDayItem: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    todayDayText: {
        color: COLORS.primary,
        fontFamily: "Poppins_600SemiBold",
    },
    dayText: { fontSize: wp(4) },
    activeDayText: {
        color: "#fff",
        fontFamily: "Poppins_600SemiBold",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: hp(2),
    },
    cancel: { color: COLORS.primary, fontSize: wp(4.5) },
    ok: {
        color: COLORS.primary,
        fontSize: wp(4.5),
        fontFamily: "Poppins_600SemiBold",
    },
});

export default CustomDateRangePickerModal;
