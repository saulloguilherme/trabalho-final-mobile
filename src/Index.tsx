import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Dashboard from './pages/Dashboard';
import Estoque from './pages/Estoque';
import Entregas from './pages/Entregas';
import Faturamento from './pages/Faturamento';
import Fornecedores from './pages/Fornecedores';
import { Ionicons } from '@expo/vector-icons';

const Drawer = createDrawerNavigator();

export default function Index() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Dashboard" 
        screenOptions={{
          drawerActiveTintColor: '#007AFF',
          drawerInactiveTintColor: '#8E8E93',
          drawerStyle: { backgroundColor: '#FFFFFF' },
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#FFFFFF',
        }}
      >
        <Drawer.Screen name="Dashboard" component={Dashboard} options={{drawerIcon: ({ color, size }) => (<Ionicons name="stats-chart" size={size} color={color} />)}}/>
        <Drawer.Screen name="Estoque" component={Estoque} options={{drawerIcon: ({ color, size }) => (<Ionicons name="archive" size={size} color={color} />)}}/>
        <Drawer.Screen name="Entregas" component={Entregas} options={{drawerIcon: ({ color, size }) => (<Ionicons name="navigate" size={size} color={color} />)}}/>
        <Drawer.Screen name="Faturamento" component={Faturamento} options={{drawerIcon: ({ color, size }) => (<Ionicons name="wallet" size={size} color={color} />)}}/>
        <Drawer.Screen name="Fornecedores" component={Fornecedores} options={{drawerIcon: ({ color, size }) => (<Ionicons name="business" size={size} color={color} />)}}/>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}