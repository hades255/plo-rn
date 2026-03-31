import 'react-native-gesture-handler';
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
  AuthLanding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  Orders: undefined;
  DrawOrders: undefined;
  ScratchOrders: undefined;
  Profile: undefined;
  AddFunds: undefined;
  PaymentMethod: undefined;
  ProcessingPayment: undefined;
  FundsAdded: undefined;
  AllScratchGames: undefined;
  AllDrawGames: undefined;
  GameHome: undefined;
  PickNumbers: undefined;
  YourPlays: undefined;
  ViewCart: undefined;
  OrderSummary: undefined;
  OrderProcessing: undefined;
  OrderSuccess: undefined;
  LuckyDream: undefined;
  LuckyDreamSummary: undefined;
  LuckyHoroscope: undefined;
  ScratchOrderCart: undefined;
  ScratchGameInfo: undefined;
  ScratchTicket: undefined;
  ScratchOrderDetails: undefined;
  DrawOrderDetails: undefined;
  PrizeNotifications: undefined;
  PrizeNotificationDetail: undefined;
  VerifyIdentity: undefined;
  SoftTierKyc: undefined;
  RegionBlocked: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const appScreens: Array<{
  name: keyof RootStackParamList;
  title: string;
}> = [
  { name: 'ForgotPassword', title: 'Forgot Password' },
  { name: 'Orders', title: 'Orders' },
  { name: 'DrawOrders', title: 'Draw Orders' },
  { name: 'ScratchOrders', title: 'Scratch Orders' },
  { name: 'Profile', title: 'Profile' },
  { name: 'AddFunds', title: 'Add Funds' },
  { name: 'PaymentMethod', title: 'Payment Method' },
  { name: 'ProcessingPayment', title: 'Processing Payment' },
  { name: 'FundsAdded', title: 'Funds Added' },
  { name: 'AllScratchGames', title: 'All Scratch Games' },
  { name: 'AllDrawGames', title: 'All Draw Games' },
  { name: 'GameHome', title: 'Game Home' },
  { name: 'PickNumbers', title: 'Pick Numbers' },
  { name: 'YourPlays', title: 'Your Plays' },
  { name: 'ViewCart', title: 'View Cart' },
  { name: 'OrderSummary', title: 'Order Summary' },
  { name: 'OrderProcessing', title: 'Order Processing' },
  { name: 'OrderSuccess', title: 'Order Success' },
  { name: 'LuckyDream', title: 'Lucky Dream' },
  { name: 'LuckyDreamSummary', title: 'Lucky Dream Summary' },
  { name: 'LuckyHoroscope', title: 'Lucky Horoscope' },
  { name: 'ScratchOrderCart', title: 'Scratch Order Cart' },
  { name: 'ScratchGameInfo', title: 'Scratch Game Info' },
  { name: 'ScratchTicket', title: 'Scratch Ticket' },
  { name: 'ScratchOrderDetails', title: 'Scratch Order Details' },
  { name: 'DrawOrderDetails', title: 'Draw Order Details' },
  { name: 'PrizeNotifications', title: 'Prize Notifications' },
  { name: 'PrizeNotificationDetail', title: 'Prize Notification Detail' },
  { name: 'VerifyIdentity', title: 'Verify Identity' },
  { name: 'SoftTierKyc', title: 'Soft Tier KYC' },
  { name: 'RegionBlocked', title: 'Region Blocked' },
];

type NavProp = NativeStackNavigationProp<RootStackParamList>;

function AuthLandingScreen({ navigation }: { navigation: NavProp }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>PlayPlotto</Text>
        <Text style={styles.subtitle}>React Native app shell for iOS and Android</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.primaryText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.secondaryText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SignInScreen({ navigation }: { navigation: NavProp }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Sign In</Text>
        <TextInput placeholder="Email" style={styles.input} autoCapitalize="none" />
        <TextInput
          placeholder="Password"
          style={styles.input}
          autoCapitalize="none"
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.primaryText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SignUpScreen({ navigation }: { navigation: NavProp }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput placeholder="Full name" style={styles.input} />
        <TextInput placeholder="Email" style={styles.input} autoCapitalize="none" />
        <TextInput
          placeholder="Password"
          style={styles.input}
          autoCapitalize="none"
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.primaryText}>Create</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function HomeScreen({ navigation }: { navigation: NavProp }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Starter mobile navigation based on web routes</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('GameHome')}>
          <Text style={styles.primaryText}>Play Draw Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.secondaryText}>View Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.secondaryText}>Open Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          This screen is mapped from the web app and ready for detailed component porting.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="AuthLanding">
          <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          {appScreens.map(screen => (
            <Stack.Screen key={screen.name} name={screen.name}>
              {() => <PlaceholderScreen title={screen.title} />}
            </Stack.Screen>
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 18,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: '#FF5B04',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default App;
