import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/store/AuthContext';
import { ScratchCartProvider } from './src/store/ScratchCartContext';
import { GameFlowProvider } from './src/store/GameFlowContext';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <ScratchCartProvider>
          <GameFlowProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </GameFlowProvider>
        </ScratchCartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
