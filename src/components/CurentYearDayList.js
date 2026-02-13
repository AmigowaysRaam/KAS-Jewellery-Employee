import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "Sep", "Oct", "Nov", "Dec"
];
const YEARS = Array.from({ length: 50 }, (_, i) => 2000 + i);

export default function MonthYearDatePickerModal({ isVisible, onClose, onSelect }) {
    const today = dayjs();
    const [selectedMonth, setSelectedMonth] = useState(today.month());
    const [selectedYear, setSelectedYear] = useState(today.year());
    const [selectedDate, setSelectedDate] = useState(today.date());

    const monthRef = useRef(null);
    const yearRef = useRef(null);
    const dateRef = useRef(null);
    const ITEM_WIDTH = wp(20);

    // Animation for top slide
    const translateY = useRef(new Animated.Value(-hp(50))).current;
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isVisible) openPicker();
        else closePicker();
    }, [isVisible]);

    // Scroll to current month/year/date on open
    useEffect(() => {
        setTimeout(() => {
            monthRef.current?.scrollToIndex({ index: selectedMonth, animated: true });
            yearRef.current?.scrollToIndex({ index: YEARS.indexOf(selectedYear), animated: true });
            dateRef.current?.scrollToIndex({ index: selectedDate - 1, animated: true });
        }, 200);
    }, [isOpen]);

    const openPicker = () => {
        setIsOpen(true);

    };

    const closePicker = () => {
        setIsOpen(false);
        onClose && onClose();
    };

    const selectDate = (month, year, date) => {
        setSelectedMonth(month);
        setSelectedYear(year);
        setSelectedDate(date);
        onSelect && onSelect({ month, year, date });
        closePicker();
    };

    const renderMonthItem = (index) => (
        <Pressable
            onPress={() => setSelectedMonth(index)}
            style={[styles.item, selectedMonth === index && styles.activeItem]}
        >
            <Text style={[styles.itemText, selectedMonth === index && styles.activeItemText]}>
                {MONTHS[index]}
            </Text>
        </Pressable>
    );

    const renderYearItem = (year) => (
        <Pressable
            onPress={() => setSelectedYear(year)}
            style={[styles.item, selectedYear === year && styles.activeItem]}
        >
            <Text style={[styles.itemText, selectedYear === year && styles.activeItemText]}>
                {year}
            </Text>
        </Pressable>
    );

    const renderDateItem = (date) => {
        const dayName = dayjs().year(selectedYear).month(selectedMonth).date(date).format("ddd");
        return (
            <Pressable
                onPress={() => selectDate(selectedMonth, selectedYear, date)}
                style={[styles.item, selectedDate === date && styles.activeItem]}
            >
                <Text style={[styles.itemText, selectedDate === date && styles.activeItemText]}>
                    {dayName} {date}
                </Text>
            </Pressable>
        );
    };

    const getItemLayout = (_, index) => ({
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
        index,
    });
    // Generate dates in selected month
    const totalDays = dayjs().year(selectedYear).month(selectedMonth).daysInMonth();
    const datesArray = Array.from({ length: totalDays }, (_, i) => i + 1);
    if (!isOpen) return null;
    return (
        <>
            <TouchableWithoutFeedback onPress={closePicker}>
                <View style={styles.overlayBackground} />
            </TouchableWithoutFeedback>
            {/* Picker Modal */}
            <View style={[styles.overlay,]}>
                <View style={styles.modal}>
                    {/* Month Picker */}
                    <FlatList
                        horizontal
                        ref={monthRef}
                        data={MONTHS}
                        keyExtractor={(_, index) => index.toString()}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ index }) => renderMonthItem(index)}
                        getItemLayout={getItemLayout}
                        contentContainerStyle={styles.listContainer}
                    />

                    {/* Year Picker */}
                    <FlatList
                        horizontal
                        ref={yearRef}
                        data={YEARS}
                        keyExtractor={(item) => item.toString()}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => renderYearItem(item)}
                        getItemLayout={getItemLayout}
                        contentContainerStyle={styles.listContainer}
                    />
                    {/* Date Picker */}
                    {/* <FlatList
            horizontal
            ref={dateRef}
            data={datesArray}
            keyExtractor={(item) => item.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => renderDateItem(item)}
            getItemLayout={getItemLayout}
            contentContainerStyle={styles.listContainer}
          /> */}
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    overlayBackground: {
        position: "absolute",
        top: 10,
        left: 0,
        width: wp(100),
        height: hp(100),
        backgroundColor: "rgba(0,0,0,0.3)",
        zIndex: 10,
    },
    overlay: {
        position: "absolute",
        top: hp(2),
        width: wp(100),
        backgroundColor: "#fff",
        paddingVertical: hp(2),
        zIndex: 11,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    modal: {
        alignItems: "center",
    },
    listContainer: { paddingVertical: hp(1) },
    item: {
        width: wp(20),
        paddingVertical: hp(1),
        marginHorizontal: wp(1),
        borderRadius: wp(6),
        backgroundColor: "#EAEAEA",
        alignItems: "center",
    },
    activeItem: { backgroundColor: COLORS.primary },
    itemText: { fontSize: wp(3.8), color: "#333" },
    activeItemText: { color: "#fff", fontFamily: "Poppins_600SemiBold" },
});
