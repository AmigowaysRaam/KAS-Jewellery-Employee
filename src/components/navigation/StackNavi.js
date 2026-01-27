import { createStackNavigator } from '@react-navigation/stack';
import AssignTaskListScreen from '../AssignTaskListScreen';
import ChangeMpin from '../ChangeMpin';
import CreateMpin from '../CreateMpin';
import forgetotpVerfication from '../forgetotpVerfication';
import Login from '../Login';
import MaintainancePage from '../MaintainancePage';
import MobileLogin from '../MobileLogin';
import MpinLoginScreen from '../MpinLoginScreen';
import MyTaskListScreen from '../MyTaskListScreen';
import OtpVerfication from '../otpVerfication';
import ResetMpin from '../ResetMpin';
import SplashScreen from '../SplashScreen';
import BottomTab from './BottomTab';
export default function StackNavi() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName='splash' screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name='splash' component={SplashScreen} />
      <Stack.Screen name='login' component={Login} />
      <Stack.Screen name='home' component={BottomTab} />
      <Stack.Screen name='MobileLogin' component={MobileLogin} />
      <Stack.Screen name='OtpVerfication' component={OtpVerfication} />
      <Stack.Screen name='CreateMpin' component={CreateMpin} />
      <Stack.Screen name='MpinLoginScreen' component={MpinLoginScreen} />
      <Stack.Screen name='MaintainancePage' component={MaintainancePage} />
      <Stack.Screen name='ChangeMpin' component={ChangeMpin} />
      <Stack.Screen name='forgetotpVerfication' component={forgetotpVerfication} />
      <Stack.Screen name='ResetMpin' component={ResetMpin} />
      <Stack.Screen name='MyTaskListScreen' component={MyTaskListScreen} />
      <Stack.Screen name='AssignTaskListScreen' component={AssignTaskListScreen} />
    </Stack.Navigator>
  );
}
