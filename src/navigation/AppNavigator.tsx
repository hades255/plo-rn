import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AuthLandingScreen } from '../screens/auth/AuthLandingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { PlaceholderScreen } from '../screens/common/PlaceholderScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const appScreens: Array<{name: keyof RootStackParamList; title: string}> = [
  {name: 'Orders', title: 'Orders'},
  {name: 'DrawOrders', title: 'Draw Orders'},
  {name: 'ScratchOrders', title: 'Scratch Orders'},
  {name: 'Profile', title: 'Profile'},
  {name: 'AddFunds', title: 'Add Funds'},
  {name: 'PaymentMethod', title: 'Payment Method'},
  {name: 'ProcessingPayment', title: 'Processing Payment'},
  {name: 'FundsAdded', title: 'Funds Added'},
  {name: 'AllScratchGames', title: 'All Scratch Games'},
  {name: 'AllDrawGames', title: 'All Draw Games'},
  {name: 'GameHome', title: 'Game Home'},
  {name: 'PickNumbers', title: 'Pick Numbers'},
  {name: 'YourPlays', title: 'Your Plays'},
  {name: 'ViewCart', title: 'View Cart'},
  {name: 'OrderSummary', title: 'Order Summary'},
  {name: 'OrderProcessing', title: 'Order Processing'},
  {name: 'OrderSuccess', title: 'Order Success'},
  {name: 'LuckyDream', title: 'Lucky Dream'},
  {name: 'LuckyDreamSummary', title: 'Lucky Dream Summary'},
  {name: 'LuckyHoroscope', title: 'Lucky Horoscope'},
  {name: 'ScratchOrderCart', title: 'Scratch Order Cart'},
  {name: 'ScratchGameInfo', title: 'Scratch Game Info'},
  {name: 'ScratchTicket', title: 'Scratch Ticket'},
  {name: 'ScratchOrderDetails', title: 'Scratch Order Details'},
  {name: 'DrawOrderDetails', title: 'Draw Order Details'},
  {name: 'PrizeNotifications', title: 'Prize Notifications'},
  {name: 'PrizeNotificationDetail', title: 'Prize Notification Detail'},
  {name: 'VerifyIdentity', title: 'Verify Identity'},
  {name: 'SoftTierKyc', title: 'Soft Tier KYC'},
  {name: 'RegionBlocked', title: 'Region Blocked'},
];

function HomeScreen() {
  return <PlaceholderScreen title="Home" />;
}

export function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="AuthLanding">
      <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      {appScreens.map(screen => (
        <Stack.Screen key={screen.name} name={screen.name}>
          {() => <PlaceholderScreen title={screen.title} />}
        </Stack.Screen>
      ))}
    </Stack.Navigator>
  );
}
