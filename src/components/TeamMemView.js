import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    FlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function TeamMembersView({ teamMembers }) {
    const [modalVisible, setModalVisible] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const teamUsers = teamMembers?.team_users || [];

    useEffect(() => {
        console.log("Team Members:", teamUsers);
    }, [teamUsers]);
    if (!teamUsers) {
        return null
    }
    const openModal = () => {
        setModalVisible(true);
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 200,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => setModalVisible(false));
    };

    if (!teamUsers) return null;

    return (
        <View style={{ marginHorizontal: hp(0.1) }}>
            {/* Grid of team members */}
            <FlatList
                ListHeaderComponent={
                    <Text
                        style={{
                            marginHorizontal: wp(0.5),
                            marginBottom: wp(2),
                            fontFamily: "Poppins_400Regular",
                            fontSize: wp(4),
                        }}
                    >
                        Team Members
                    </Text>
                }
                data={teamUsers}
                keyExtractor={(item, index) => item.value?.toString() || index.toString()}
                numColumns={4}
                scrollEnabled={false}
                ListEmptyComponent={<>
                    <Text style={{
                        marginHorizontal: wp(2), marginBottom: wp(2),
                        fontFamily: "Poppins_600SemiBold",
                    }}>
                        No Members Found
                    </Text>
                </>}
                renderItem={({ item, index }) => (
                    <Pressable
                        onPress={openModal}
                        style={{
                            alignItems: "center",
                            marginRight: index % 4 !== 3 ? wp(2) : 0,
                            marginBottom: hp(2),
                        }}
                    >
                        <Image
                            source={{ uri: item.image }}
                            style={{
                                width: wp(12),
                                height: wp(12),
                                borderRadius: wp(6),
                                borderColor: COLORS.primary,
                                borderWidth: wp(0.4),
                            }}
                        />
                        <Text
                            style={{
                                fontSize: wp(3),
                                marginTop: hp(0.5),
                                textAlign: "center",
                                maxWidth: wp(15),
                                textTransform: "capitalize",
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.label}
                        </Text>
                    </Pressable>
                )}
            />

            {/* Modal for vertical list */}
            <Modal transparent visible={modalVisible} animationType="none">
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay}>
                        {/* Prevent closing when pressing inside modal content */}
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.modalContent,
                                    {
                                        transform: [{ scale: scaleAnim }],
                                        opacity: opacityAnim,
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        fontSize: wp(4),
                                        fontFamily: "Poppins_600SemiBold",
                                        marginBottom: hp(2),
                                    }}
                                >
                                    Team Members
                                </Text>
                                <ScrollView>
                                    {teamUsers.map((item, index) => (
                                        <View
                                            key={item.value?.toString() || index}
                                            style={styles.modalItem}
                                        >
                                            <Image
                                                source={{ uri: item.image }}
                                                style={styles.modalImage}
                                            />
                                            <Text style={styles.modalText}>{item.label}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                                <Pressable
                                    onPress={closeModal}
                                    style={styles.closeButton}
                                >
                                    <Text style={{ color: "#fff", fontSize: wp(5) }}>Close</Text>
                                </Pressable>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        paddingHorizontal: wp(5),
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: wp(3),
        padding: wp(4),
        maxHeight: hp(70),
        position: "absolute",
        width: wp(95),
        bottom: hp(4),
        alignSelf: "center",
    },
    modalItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp(2),
    },
    modalImage: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginRight: wp(3),
    },
    modalText: {
        fontSize: wp(5),
        fontFamily: "Poppins_400Regular",
        textTransform: "capitalize",
    },
    closeButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: hp(1.1),
        borderRadius: wp(2),
        marginTop: hp(2),
        alignItems: "center",
    },
});
