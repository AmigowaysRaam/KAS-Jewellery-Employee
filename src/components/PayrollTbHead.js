import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../app/resources/colors';
import { wp } from '../../app/resources/dimensions';

const PayrollTbHead = ({ style = {} }) => {
  return (
    <View style={[styles.tableHeader, style.tableHeader]}>
      <Text style={[styles.headerCell, style.headerCell]}>Date</Text>
      <Text style={[styles.headerCell, style.headerCell]}>Emp</Text>
      <Text style={[styles.headerCell, style.headerCell]}>Dept</Text>
      <Text style={[styles.headerCell, style.headerCell]}>Status</Text>
      <Text style={[styles.headerCell, style.headerCell]}>Amt</Text>
    </View>
  );
};

export default PayrollTbHead;
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
    fontFamily: "Poppins_600SemiBold",
    fontSize: wp(3.2)
  },
});
