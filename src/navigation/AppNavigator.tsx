import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AuthLandingScreen } from '../screens/auth/AuthLandingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { PlaceholderScreen } from '../screens/common/PlaceholderScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AllDrawGamesScreen } from '../screens/home/AllDrawGamesScreen';
import { AllScratchGamesScreen } from '../screens/home/AllScratchGamesScreen';
import { GameHomeScreen } from '../screens/home/GameHomeScreen';
import { ScratchGameInfoScreen } from '../screens/home/ScratchGameInfoScreen';
import { PickNumbersScreen } from '../screens/gameflow/PickNumbersScreen';
import { YourPlaysScreen } from '../screens/gameflow/YourPlaysScreen';
import { ViewCartScreen } from '../screens/gameflow/ViewCartScreen';
import { OrderSummaryScreen } from '../screens/gameflow/OrderSummaryScreen';
import { OrderProcessingScreen } from '../screens/gameflow/OrderProcessingScreen';
import { OrderSuccessScreen } from '../screens/gameflow/OrderSuccessScreen';
import { OrdersScreen } from '../screens/orders/OrdersScreen';
import { DrawOrdersScreen } from '../screens/orders/DrawOrdersScreen';
import { ScratchOrdersScreen } from '../screens/orders/ScratchOrdersScreen';
import { DrawOrderDetailsScreen } from '../screens/orders/DrawOrderDetailsScreen';
import { ScratchOrderDetailsScreen } from '../screens/orders/ScratchOrderDetailsScreen';
import { ScratchTicketScreen } from '../screens/scratch/ScratchTicketScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const appScreens: Array<{name: keyof RootStackParamList; title: string}> = [
  {name: 'Profile', title: 'Profile'},
  {name: 'AddFunds', title: 'Add Funds'},
  {name: 'PaymentMethod', title: 'Payment Method'},
  {name: 'ProcessingPayment', title: 'Processing Payment'},
  {name: 'FundsAdded', title: 'Funds Added'},
  {name: 'LuckyDream', title: 'Lucky Dream'},
  {name: 'LuckyDreamSummary', title: 'Lucky Dream Summary'},
  {name: 'LuckyHoroscope', title: 'Lucky Horoscope'},
  {name: 'ScratchOrderCart', title: 'Scratch Order Cart'},
  {name: 'PrizeNotifications', title: 'Prize Notifications'},
  {name: 'PrizeNotificationDetail', title: 'Prize Notification Detail'},
  {name: 'VerifyIdentity', title: 'Verify Identity'},
  {name: 'SoftTierKyc', title: 'Soft Tier KYC'},
  {name: 'RegionBlocked', title: 'Region Blocked'},
];

export function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="AuthLanding">
      <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="DrawOrders" component={DrawOrdersScreen} />
      <Stack.Screen name="ScratchOrders" component={ScratchOrdersScreen} />
      <Stack.Screen name="AllDrawGames" component={AllDrawGamesScreen} />
      <Stack.Screen name="AllScratchGames" component={AllScratchGamesScreen} />
      <Stack.Screen name="GameHome" component={GameHomeScreen} />
      <Stack.Screen name="PickNumbers" component={PickNumbersScreen} />
      <Stack.Screen name="YourPlays" component={YourPlaysScreen} />
      <Stack.Screen name="ViewCart" component={ViewCartScreen} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
      <Stack.Screen name="OrderProcessing" component={OrderProcessingScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="ScratchGameInfo" component={ScratchGameInfoScreen} />
      <Stack.Screen name="DrawOrderDetails" component={DrawOrderDetailsScreen} />
      <Stack.Screen name="ScratchOrderDetails" component={ScratchOrderDetailsScreen} />
      <Stack.Screen name="ScratchTicket" component={ScratchTicketScreen} />
      {appScreens.map(screen => (
        <Stack.Screen key={screen.name} name={screen.name}>
          {() => <PlaceholderScreen title={screen.title} />}
        </Stack.Screen>
      ))}
    </Stack.Navigator>
  );
}
