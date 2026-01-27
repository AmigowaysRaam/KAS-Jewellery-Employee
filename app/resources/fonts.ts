import { Dimensions } from 'react-native';
import { wp } from './dimensions';

export const {width, height} = Dimensions.get('window');

export const fontConfig = {
  web: {
    regular: {
      fontFamily: 'Poppins-Regular',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Poppins-Medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'Poppins-Light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'Poppins-Thin',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: 'Poppins-Bold',
      fontWeight: 'normal',
    },
    semiBold: {
      fontFamily: 'Poppins-SemiBold',
      fontWeight: 'normal',
    },
  },
  ios: {
    regular: {
      fontFamily: 'Poppins-Regular',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Poppins-Medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'Poppins-Light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'Poppins-Thin',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: 'Poppins-Bold',
      fontWeight: 'normal',
    },
    semiBold: {
      fontFamily: 'Poppins-SemiBold',
      fontWeight: 'normal',
    },
  },
  android: {
    regular: {
      fontFamily: 'Poppins-Regular',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Poppins-Medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'Poppins-Light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'Poppins-Thin',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: 'Poppins-Bold',
      fontWeight: 'normal',
    },
    semiBold: {
      fontFamily: 'Poppins-SemiBold',
      fontWeight: 'normal',
    },
  },
} as const;

export const fonts = {
  poppins_thin: 'Poppins-Thin',
  poppins_light: 'Poppins-Light',
  poppins_bold: 'Poppins-Bold',
  poppins_regular: 'Poppins-Regular',
  poppins_medium: 'Poppins-Medium',
  poppins_semi_bold: 'Poppins-SemiBold',
};

export const fontSizes = {
  boldLarge: {fontSize: width <= 320 ? wp(16.66) : wp(16.66)}, // 60px
  larger: {fontSize: width <= 320 ? wp(8.3) : wp(8.3)}, // larger
  large: {fontSize: width <= 320 ? wp(7.9) : wp(7.9)}, // larger
  medium: {fontSize: width <= 320 ? wp(7.3) : wp(7.3)}, // medium
  h1: {fontSize: width <= 320 ? wp(6.95) : wp(6.95)}, // 26 large
  h2: {fontSize: width <= 320 ? wp(6.4) : wp(6.4)}, // 24
  h3: {fontSize: width <= 320 ? wp(5.87) : wp(5.87)}, // 22
  h4: {fontSize: width <= 320 ? wp(5.35) : wp(5.35)}, // 20
  h5: {fontSize: width <= 320 ? wp(4.8) : wp(4.8)}, // 18
  h6: {fontSize: width <= 320 ? wp(4.3) : wp(4.3)}, // 16 medium
  h7: {fontSize: width <= 320 ? wp(3.75) : wp(3.75)}, // 14 regular
  h8: {fontSize: width <= 320 ? wp(3.2) : wp(3.2)}, // 13 or 12 small
  h9: {fontSize: width <= 320 ? wp(2.8) : wp(2.8)}, // 11 or 10 xsmall
};

export const colors = {commonText: '#000000'};

export const poppins = {
  regular: {
    large: {
      fontFamily: fonts.poppins_regular,
      ...fontSizes.large,
      color: colors.commonText,
    },
    h1: {
      fontFamily: fonts.poppins_regular,
      ...fontSizes.h1,
      color: colors.commonText,
    },
    h2: {
      fontFamily: fonts.poppins_regular,
      ...fontSizes.h2,
      color: colors.commonText,
    },
    h3: {
      fontFamily: fonts.poppins_regular,
      ...fontSizes.h3,
      color: colors.commonText,
    },
    h4: {
      fontFamily: fonts.poppins_regular,
      ...fontSizes.h4,
      color: colors.commonText,
    },
    h5: {
      fontFamily: fonts.poppins_regular,
      ...fontSizes.h5,
      color: colors.commonText,
    },
    h6: {
      fontFamily: fonts.poppins_regular,
      ...fontSizes.h6,
      color: colors.commonText,
    },
    h7: {
      fontFamily: fonts.poppins_regular,
      ...fontSizes.h7,
      color: colors.commonText,
    },
    h8: {
      fontFamily: fonts.poppins_regular,
      ...fontSizes.h8,
      color: colors.commonText,
    },
    h9: {
      fontFamily: fonts.poppins_regular,
      ...fontSizes.h9,
      color: colors.commonText,
    },
  },
  medium: {
    h1: {
      fontFamily: fonts.poppins_medium,
      ...fontSizes.h1,
      color: colors.commonText,
    },
    h2: {
      fontFamily: fonts.poppins_medium,
      ...fontSizes.h2,
      color: colors.commonText,
    },
    h3: {
      fontFamily: fonts.poppins_medium,
      ...fontSizes.h3,
      color: colors.commonText,
    },
    h4: {
      fontFamily: fonts.poppins_medium,
      ...fontSizes.h4,
      color: colors.commonText,
    },
    h5: {
      fontFamily: fonts.poppins_medium,
      ...fontSizes.h5,
      color: colors.commonText,
    },
    h6: {
      fontFamily: fonts.poppins_medium,
      ...fontSizes.h6,
      color: colors.commonText,
    },
    h7: {
      fontFamily: fonts.poppins_medium,
      ...fontSizes.h7,
      color: colors.commonText,
    },
    h8: {
      fontFamily: fonts.poppins_medium,
      ...fontSizes.h8,
      color: colors.commonText,
    },
    h9: {
      fontFamily: fonts.poppins_medium,
      ...fontSizes.h9,
      color: colors.commonText,
    },
    medium: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.medium,
      color: colors.commonText,
    },
  },
  semi_bold: {
    h1: {
      fontFamily: fonts.poppins_semi_bold,
      ...fontSizes.h1,
      color: colors.commonText,
    },
    h2: {
      fontFamily: fonts.poppins_semi_bold,
      ...fontSizes.h2,
      color: colors.commonText,
    },
    h3: {
      fontFamily: fonts.poppins_semi_bold,
      ...fontSizes.h3,
      color: colors.commonText,
    },
    h4: {
      fontFamily: fonts.poppins_semi_bold,
      ...fontSizes.h4,
      color: colors.commonText,
    },
    h5: {
      fontFamily: fonts.poppins_semi_bold,
      ...fontSizes.h5,
      color: colors.commonText,
    },
    h6: {
      fontFamily: fonts.poppins_semi_bold,
      ...fontSizes.h6,
      color: colors.commonText,
    },
    h7: {
      fontFamily: fonts.poppins_semi_bold,
      ...fontSizes.h7,
      color: colors.commonText,
    },
    h8: {
      fontFamily: fonts.poppins_semi_bold,
      ...fontSizes.h8,
      color: colors.commonText,
    },
    h9: {
      fontFamily: fonts.poppins_semi_bold,
      ...fontSizes.h9,
      color: colors.commonText,
    },
  },
  bold: {
    boldLarge: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.boldLarge,
      color: colors.commonText,
      fontWeight: 'bold',
    },
    large: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.large,
      color: colors.commonText,
      fontWeight: 'bold',
    },
    medium: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.medium,
      color: colors.commonText,
      fontWeight: 'bold',
    },
    h1: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.h1,
      color: colors.commonText,
      fontWeight: 'bold',
    },
    h2: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.h2,
      color: colors.commonText,
      fontWeight: 'bold',
    },
    h3: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.h3,
      color: colors.commonText,
      fontWeight: 'bold',
    },
    h4: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.h4,
      color: colors.commonText,
      fontWeight: 'bold',
    },
    h5: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.h5,
      color: colors.commonText,
      fontWeight: 'bold',
    },
    h6: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.h6,
      color: colors.commonText,
      fontWeight: 'bold',
    },
    h7: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.h7,
      color: colors.commonText,
      fontWeight: 'bold',
    },
    h8: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.h8,
      color: colors.commonText,
      fontWeight: 'bold',
    },
    h9: {
      fontFamily: fonts.poppins_bold,
      ...fontSizes.h9,
      color: colors.commonText,
      fontWeight: 'bold',
    },
  },
};
