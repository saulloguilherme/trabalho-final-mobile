import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Dashboard from './pages/Dashboard';
import Pedidos from './pages/Pedidos';
import Clientes from './pages/Clientes';
import Estoque from './pages/Estoque';
import Entregas from './pages/Entregas';
import Faturamento from './pages/Faturamento';
import Fornecedores from './pages/Fornecedores';
import Usuarios from './pages/Usuarios';
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
        <Drawer.Screen name="Pedidos" component={Pedidos} options={{drawerIcon: ({ color, size }) => (<Ionicons name="document-text" size={size} color={color} />)}}/>
        <Drawer.Screen name="Clientes" component={Clientes} options={{drawerIcon: ({ color, size }) => (<Ionicons name="people" size={size} color={color} />)}}/>
        <Drawer.Screen name="Estoque" component={Estoque} options={{drawerIcon: ({ color, size }) => (<Ionicons name="archive" size={size} color={color} />)}}/>
        <Drawer.Screen name="Entregas" component={Entregas} options={{drawerIcon: ({ color, size }) => (<Ionicons name="navigate" size={size} color={color} />)}}/>
        <Drawer.Screen name="Faturamento" component={Faturamento} options={{drawerIcon: ({ color, size }) => (<Ionicons name="wallet" size={size} color={color} />)}}/>
        <Drawer.Screen name="Fornecedores" component={Fornecedores} options={{drawerIcon: ({ color, size }) => (<Ionicons name="business" size={size} color={color} />)}}/>
        <Drawer.Screen name="Usuarios" component={Usuarios} options={{drawerIcon: ({ color, size }) => (<Ionicons name="people-circle" size={size} color={color} />)}}/>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}