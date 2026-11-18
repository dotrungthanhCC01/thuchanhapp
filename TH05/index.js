/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerBackgroundHandler } from './src/services/notificationService';

// notifee yêu cầu đăng ký xử lý sự kiện nền trước khi app được đăng ký
registerBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
