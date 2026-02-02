import messaging from '@react-native-firebase/messaging';
import { registerRootComponent } from 'expo';
import App from './App';
// 🔥 MUST be defined before registerRootComponent
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Expo background message:', remoteMessage);
});
// Register app
registerRootComponent(App);
