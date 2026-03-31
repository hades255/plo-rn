import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/store/AuthContext';
import { ScratchCartProvider } from './src/store/ScratchCartContext';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <ScratchCartProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ScratchCartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
