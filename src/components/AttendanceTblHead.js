import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../app/resources/colors';
import { wp } from '../../app/resources/dimensions';

const AttendTableHeader = ({ style = {} }) => {
  return (
    <View style={[styles.tableHeader, style.tableHeader]}>
      <Text style={[styles.headerCell, style.headerCell]}>Date</Text>
      <Text style={[styles.headerCell, style.headerCell]}>Day</Text>
      <Text style={[styles.headerCell, style.headerCell]}>Login</Text>
      <Text style={[styles.headerCell, style.headerCell]}>Logout</Text>
      <Text style={[styles.headerCell, style.headerCell]}>Status</Text>
    </View>
  );
};

export default AttendTableHeader;
const styles = StyleSheet.create({
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS?.primary,
    paddingVertical: wp(2.5),
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
    fontFamily:"Poppins_600SemiBold",
    fontSize:wp(3.2)
  },
});
