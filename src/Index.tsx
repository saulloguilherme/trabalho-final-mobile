import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';

import Dashboard from './pages/Dashboard';
import Estoque from './pages/Estoque';
import Entregas from './pages/Entregas';
import Faturamento from './pages/Faturamento';
import Fornecedores from './pages/Fornecedores';
import Login from './pages/Login';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      {/* Lista de telas */}
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Botão Sair (respeitando safe area) */}
      <View
        style={{
          paddingBottom: insets.bottom + 8,
          borderTopWidth: 1,
          borderTopColor: '#eee',
        }}
      >
        <DrawerItem
          label="Sair"
          onPress={() => signOut()}
          icon={({ size, color }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )}
        />
      </View>
    </View>
  );
}


export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Login />;
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Dashboard"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerActiveTintColor: '#007AFF',
          drawerInactiveTintColor: '#8E8E93',
          drawerStyle: { backgroundColor: '#FFFFFF' },
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#FFFFFF',
        }}
      >
        <Drawer.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="Estoque"
          component={Estoque}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="archive" size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="Entregas"
          component={Entregas}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="navigate" size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="Faturamento"
          component={Faturamento}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="wallet" size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="Fornecedores"
          component={Fornecedores}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="business" size={size} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
