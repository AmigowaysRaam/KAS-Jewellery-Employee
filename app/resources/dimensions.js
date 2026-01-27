import { Dimensions, PixelRatio } from 'react-native';
const wp = (widthPercent, getScreenWidth) => {
  const screenWidth = Dimensions.get('window').width;
  const elemWidth = parseFloat(widthPercent);
  return getScreenWidth
    ? screenWidth * (widthPercent / 100)
    : PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
};

const hp = heightPercent => {
  const screenHeight = Dimensions.get('window').height;
  const elemHeight = parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};
export { hp, wp };

