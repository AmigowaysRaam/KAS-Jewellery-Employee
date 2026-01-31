import { StyleSheet } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const Task = StyleSheet.create({
  inputContainer: { marginBottom: hp(2), position: "relative" },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: wp(2),
    padding: wp(3),
    fontSize: wp(3.5),
    fontFamily: "Poppins_400Regular",
    color: COLORS.black,
  },
  inputIcon: { position: "absolute", right: wp(3), top: hp(1.5) },
  audioPreview: {
    flexDirection: "row",
    marginTop: hp(1),
    justifyContent: "space-around",
    borderWidth: wp(0.3),
    paddingHorizontal: wp(1),
    maxWidth: wp(40),
    alignItems: "center",
    borderRadius: wp(24),
    borderColor: COLORS.primary,
  },
  errorText: {
    color: "red",
    fontSize: wp(3),
    marginTop: hp(-0.8),
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    marginHorizontal: wp(2),
  },
  recordingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingPopup: {
    backgroundColor: "#fff",
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: wp(1),
    borderColor: COLORS.primary,
  },
  recordingText: {
    fontSize: wp(3.5),
    marginBottom: hp(1),
    fontFamily: "Poppins_400Regular",
  },
  recordingTime: {
    fontSize: wp(5),
    marginBottom: hp(2),
    fontFamily: "Poppins_400Regular",
  },
  stopButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1),
    borderRadius: wp(2),
  },
  stopButtonText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontFamily: "Poppins_400Regular",
  },
  label: { fontSize: wp(4), fontFamily: "Poppins_400Regular", marginBottom: hp(0.5) },
  radioContainer: { flexDirection: "row", marginBottom: hp(2) },
  radioButton: { flexDirection: "row", alignItems: "center", marginRight: wp(4) },
  radioLabel: { fontSize: wp(3.8), fontFamily: "Poppins_400Regular", lineHeight: hp(4) },
  dateButton: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: wp(2),
    padding: wp(3),
  },
  micIconContainer: {
    position: "absolute",
    right: wp(3),
    top: hp(1.5),
    zIndex: 10,
  },
  dateText: { fontSize: wp(3.5), fontFamily: "Poppins_400Regular", color: COLORS.black },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: wp(4),
    borderRadius: wp(2),
    marginVertical: hp(4),
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontSize: wp(4), fontFamily: "Poppins_600SemiBold" },
});

export default Task;
