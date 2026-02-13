import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
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
    dayjs.extend(customParseFormat);

    const [fromDate, setFromDate] = useState(initialFrom ? dayjs(initialFrom) : null);
    const [toDate, setToDate] = useState(initialTo ? dayjs(initialTo) : null);

    const [fromText, setFromText] = useState(initialFrom ? dayjs(initialFrom).format("DD/MM/YYYY") : "");
    const [toText, setToText] = useState(initialTo ? dayjs(initialTo).format("DD/MM/YYYY") : "");

    const { t } = useTranslation();

    const [currentMonth, setCurrentMonth] = useState(today.month());
    const [currentYear, setCurrentYear] = useState(today.year());
    const [daysInMonth, setDaysInMonth] = useState([]);

    const yearListRef = useRef(null);

    const goToPreviousMonth = () => {
        const newDate = dayjs().year(currentYear).month(currentMonth).subtract(1, "month");
        setCurrentMonth(newDate.month());
        setCurrentYear(newDate.year());
    };

    const goToNextMonth = () => {
        const newDate = dayjs().year(currentYear).month(currentMonth).add(1, "month");
        setCurrentMonth(newDate.month());
        setCurrentYear(newDate.year());
    };


    // Generate days in current month
    useEffect(() => {
        const firstDayOfMonth = dayjs().year(currentYear).month(currentMonth).date(1);
        const totalDays = firstDayOfMonth.daysInMonth();
        const startWeekDay = firstDayOfMonth.day();

        const days = [];
        for (let i = 0; i < startWeekDay; i++) days.push(null);
        for (let i = 1; i <= totalDays; i++) {
            days.push(dayjs().year(currentYear).month(currentMonth).date(i));
        }

        setDaysInMonth(days);
    }, [currentMonth, currentYear, fromDate, toDate]);

    // Scroll year list to current year
    const scrollToYear = (year) => {
        if (yearListRef.current) {
            const index = YEARS.indexOf(year);
            if (index >= 0) {
                yearListRef.current.scrollToIndex({ index, animated: true });
            }
        }
    };

    useEffect(() => {
        if (visible) {
            scrollToYear(currentYear);
        }
    }, [visible, currentYear]);

    // Calendar selection
    const selectDate = (day) => {
        if (!fromDate || (fromDate && toDate)) {
            setFromDate(day);
            setFromText(day.format("DD/MM/YYYY"));
            setToDate(null);
            setToText("");
            setCurrentMonth(day.month());
            setCurrentYear(day.year());
        } else {
            if (day.isBefore(fromDate, "day")) return;
            setToDate(day);
            setToText(day.format("DD/MM/YYYY"));
            setCurrentMonth(day.month());
            setCurrentYear(day.year());
        }
    };
    const monthListRef = useRef(null);

    const isInRange = (day) => {
        if (!fromDate || !toDate) return false;
        return day.isAfter(fromDate, "day") && day.isBefore(toDate, "day");
    };

    // Format date input as DD/MM/YYYY
    const formatDateInput = (text) => {
        let digits = text.replace(/\D/g, "");
        if (digits.length > 8) digits = digits.slice(0, 8);

        if (digits.length >= 5) {
            return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
        } else if (digits.length >= 3) {
            return digits.slice(0, 2) + "/" + digits.slice(2);
        } else {
            return digits;
        }
    };

    const handleFromChange = (text) => {
        const formatted = formatDateInput(text);
        setFromText(formatted);

        if (formatted.length === 10) {
            const parsed = dayjs(formatted, "DD/MM/YYYY", true);
            if (parsed.isValid()) {
                const parsedStart = parsed.startOf("day");
                setFromDate(parsedStart);
                setCurrentMonth(parsedStart.month());
                setCurrentYear(parsedStart.year());
                scrollToYear(parsedStart.year());

                if (toDate && parsedStart.isAfter(toDate, "day")) {
                    setToDate(null);
                    setToText("");
                }
            } else {
                setFromDate(null);
            }
        } else {
            setFromDate(null);
        }
    };

    const handleToChange = (text) => {
        const formatted = formatDateInput(text);
        setToText(formatted);

        if (formatted.length === 10) {
            const parsed = dayjs(formatted, "DD/MM/YYYY", true);
            if (parsed.isValid()) {
                const parsedStart = parsed.startOf("day");
                if (fromDate && parsedStart.isBefore(fromDate, "day")) {
                    setToDate(null);
                    return;
                }
                setToDate(parsedStart);
                setCurrentMonth(parsedStart.month());
                setCurrentYear(parsedStart.year());
                scrollToYear(parsedStart.year());
            } else {
                setToDate(null);
            }
        } else {
            setToDate(null);
        }
    };

    const confirm = () => {
        if (!fromDate || !toDate) {
            Alert.alert("Invalid Date", "Please select both From and To dates");
            return;
        }
        onConfirm({ from: fromDate.toDate(), to: toDate.toDate() });
        onClose();
    };

    const clearDates = () => {
        setFromDate(null);
        setToDate(null);
        setFromText("");
        setToText("");
    };
    const scrollToMonth = (month) => {
        if (monthListRef.current) {
            monthListRef.current.scrollToIndex({
                index: month,
                animated: true,
            });
        }
    };



    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>{title || "Select Date Range"}</Text>

                    {/* Inputs */}

                    <View style={styles.selectedDate}>
                        <TextInput
                            style={styles.dateInput}
                            placeholder="From Date"
                            value={fromText}
                            onFocus={() => {
                                scrollToMonth(currentMonth);
                                scrollToYear(currentYear);
                            }}
                            onChangeText={handleFromChange}
                            keyboardType="number-pad"
                            placeholderTextColor={COLORS.primary}
                        />
                        <Text style={{ marginHorizontal: 5 }}>-</Text>
                        <TextInput
                            style={styles.dateInput}
                            placeholder="To Date"
                            value={toText}
                            onChangeText={handleToChange}
                            placeholderTextColor={COLORS.primary}
                            keyboardType="number-pad"
                            onFocus={() => {
                                scrollToMonth(currentMonth);
                                scrollToYear(currentYear);
                            }}
                        />
                        {(fromText || toText) && (
                            <Pressable onPress={clearDates} style={{ marginLeft: 5 }}>
                                <Icon name="close" size={wp(5)} color={COLORS.primary} />
                            </Pressable>
                        )}
                    </View>

                    {/* <FlatList
                        horizontal
                        ref={monthListRef}
                        data={MONTHS}
                        keyExtractor={(item) => item}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <Pressable
                                onPress={() => setCurrentMonth(index)}
                                style={[styles.monthItem, index === currentMonth && styles.activeMonthItem]}
                            >
                                <Text style={[styles.monthText, index === currentMonth && styles.activeMonthText]}>
                                    {item}
                                </Text>
                            </Pressable>
                        )}
                    />
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
                                yearListRef.current?.scrollToIndex({ index: info.index, animated: true });
                            }, 100);
                        }}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => setCurrentYear(item)}
                                style={[styles.yearItem, item === currentYear && styles.activeYearItem]}
                            >
                                <Text style={[styles.yearText, item === currentYear && styles.activeYearText]}>
                                    {item}
                                </Text>
                            </Pressable>
                        )}
                    /> */}
                    <View style={styles.monthHeader}>
                        <Pressable onPress={goToPreviousMonth}>
                            <Icon name="chevron-left" size={wp(7)} color={COLORS.primary} />
                        </Pressable>

                        <Text style={styles.monthHeaderText}>
                            {dayjs().month(currentMonth).format("MMMM")} {currentYear}
                        </Text>

                        <Pressable onPress={goToNextMonth}>
                            <Icon name="chevron-right" size={wp(7)} color={COLORS.primary} />
                        </Pressable>
                    </View>


                    {/* Calendar */}
                    <View style={styles.grid}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                            <Text key={d} style={styles.weekDay}>{d}</Text>
                        ))}

                        {daysInMonth.map((day, index) => {
                            if (!day) return <View key={`empty-${index}`} style={styles.dayItem} />;

                            const isSelected =
                                (fromDate && day.isSame(fromDate, "day")) ||
                                (toDate && day.isSame(toDate, "day"));
                            const isToday = day.isSame(today, "day");
                            const inRange = isInRange(day);
                            const disabled = fromDate && !toDate && day.isBefore(fromDate, "day");

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
                        <Pressable
                            onPress={confirm}
                            disabled={!(fromDate && toDate && fromDate.isValid() && toDate.isValid())}
                        >
                            <Text style={[
                                styles.ok,
                                !(fromDate && toDate && fromDate.isValid() && toDate.isValid()) && { opacity: 0.5 }
                            ]}>
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
    monthHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: hp(1),
        paddingHorizontal: wp(4),
    },
    monthHeaderText: {
        fontSize: wp(4.5),
        fontFamily: "Poppins_600SemiBold",
        color: COLORS.primary,
    },
    // 
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modal: { width: wp(95), backgroundColor: "#fff", borderRadius: wp(4), padding: wp(4), paddingVertical: hp(4) },
    title: { fontSize: wp(4), fontFamily: "Poppins_600SemiBold", textAlign: "center", marginBottom: hp(1) },
    selectedDatesContainer: { alignItems: "center", marginBottom: hp(1) },
    selectedDate: { width: wp(85), flexDirection: "row", justifyContent: "space-between", borderWidth: wp(0.5), borderColor: COLORS.primary, paddingHorizontal: wp(2), borderRadius: wp(2), alignItems: "center" },
    dateInput: { flex: 1, paddingHorizontal: wp(2), color: COLORS.primary, fontFamily: "Poppins_500Medium" },
    monthItem: { marginHorizontal: wp(2), padding: wp(2), borderRadius: wp(2), marginVertical: hp(0.5) },
    activeMonthItem: { backgroundColor: COLORS.primary },
    monthText: { color: "#333" },
    activeMonthText: { color: "#fff" },
    yearItem: { marginHorizontal: wp(2), padding: wp(2), borderRadius: wp(2), marginVertical: hp(0.5) },
    activeYearItem: { backgroundColor: COLORS.primary },
    yearText: { color: "#333" },
    activeYearText: { color: "#fff" },
    grid: { flexDirection: "row", flexWrap: "wrap", marginTop: hp(1) },
    weekDay: { width: wp(12), textAlign: "center", fontWeight: "600" },
    dayItem: { width: wp(12), height: wp(12), justifyContent: "center", alignItems: "center", marginVertical: hp(0.5), borderRadius: wp(6) },
    inRangeDayItem: { backgroundColor: COLORS.primary + "80" },
    activeDayItem: { backgroundColor: COLORS.primary },
    todayDayItem: { borderWidth: 2, borderColor: COLORS.primary },
    todayDayText: { color: COLORS.primary, fontFamily: "Poppins_600SemiBold" },
    dayText: { fontSize: wp(4) },
    activeDayText: { color: "#fff", fontFamily: "Poppins_600SemiBold" },
    actions: { flexDirection: "row", justifyContent: "space-between", marginTop: hp(2) },
    cancel: { color: COLORS.primary, fontSize: wp(4.5) },
    ok: { color: COLORS.primary, fontSize: wp(4.5), fontFamily: "Poppins_600SemiBold" },
});

export default CustomDateRangePickerModal;
