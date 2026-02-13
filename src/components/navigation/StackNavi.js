import { createStackNavigator } from '@react-navigation/stack';
import AssignTaskListScreen from '../AssignTaskListScreen';
import Attendance from '../Attendance';
import ChangeMpin from '../ChangeMpin';
import CreateMpin from '../CreateMpin';
import CreateTask from '../CreateTask';
import forgetotpVerfication from '../forgetotpVerfication';
import Login from '../Login';
import MaintainancePage from '../MaintainancePage';
import MobileLogin from '../MobileLogin';
import MpinLoginScreen from '../MpinLoginScreen';
import MyTaskListScreen from '../MyTaskListScreen';
import Notification from '../Notification';
import OtpVerfication from '../otpVerfication';
import OurStoreScreen from '../Ourstore';
import PayRollScreen from '../PayRollScreen';
import PrivacyPolicyScreen from '../PrivacyPolicy';
import ResetMpin from '../ResetMpin';
import SettingsScreen from '../Settings';
import SplashScreen from '../SplashScreen';
import TasKDetailById from '../TasKDetailById';
import TermsScreen from '../Terms';
import UpdateTask from '../UpdateTask';
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
      <Stack.Screen name='CreateTask' component={CreateTask} />
      <Stack.Screen name='Notification' component={Notification} />
      <Stack.Screen name='TasKDetailById' component={TasKDetailById} />
      <Stack.Screen name='OurStoreScreen' component={OurStoreScreen} />
      <Stack.Screen name='TermsScreen' component={TermsScreen} />
      <Stack.Screen name='PrivacyPolicyScreen' component={PrivacyPolicyScreen} />
      <Stack.Screen name='SettingsScreen' component={SettingsScreen} />
      <Stack.Screen name='UpdateTask' component={UpdateTask} />
      <Stack.Screen name='Attendance' component={Attendance} />
      <Stack.Screen name='PayRollScreen' component={PayRollScreen} />
    </Stack.Navigator>
  );
}
