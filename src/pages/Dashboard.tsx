import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Card } from 'react-native-paper'; // Instale: npx expo install react-native-paper
import { BarChart, LineChart } from 'react-native-chart-kit';
import Ionicons from '@expo/vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;

// Dados mockados
const pedidosData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [
    {
      data: [45, 52, 61, 58, 70, 68],
    },
  ],
};

const faturamentoData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [
    {
      data: [12500, 14800, 17300, 16500, 19800, 19200],
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    },
  ],
};

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#10b981',
  },
};

export default function Dashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Visão geral do seu negócio</Text>
        </View>

        {/* Cards de Métricas (2 por linha) */}
        <View style={styles.metricsContainer}>
          {/* Pedidos Hoje */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Pedidos Hoje</Text>
                <Ionicons name="cart" size={20} color="#3b82f6" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardValue}>24</Text>
                <View style={styles.trendContainer}>
                  <Ionicons name="trending-up" size={14} color="#10b981" />
                  <Text style={styles.trendPositive}>+12% ontem</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Clientes */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Clientes</Text>
                <Ionicons name="people" size={20} color="#10b981" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardValue}>342</Text>
                <View style={styles.trendContainer}>
                  <Ionicons name="person-add" size={14} color="#10b981" />
                  <Text style={styles.trendPositive}>+8 novos</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Estoque */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Estoque</Text>
                <Ionicons name="cube" size={20} color="#f97316" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardValue}>156</Text>
                <View style={styles.trendContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.trendNegative}>13 baixo</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Faturamento */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Faturamento</Text>
                <Ionicons name="trending-up" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardValue}>R$ 19,2k</Text>
                <View style={styles.trendContainer}>
                  <Ionicons name="trending-up" size={14} color="#10b981" />
                  <Text style={styles.trendPositive}>+15% mês</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Status de Entregas (3 por linha) */}
        <View style={styles.deliveryContainer}>
          <Text style={styles.sectionTitle}>Status de Entregas</Text>
          <View style={styles.deliveryCards}>
            {/* Pendentes */}
            <Card style={styles.deliveryCard}>
              <Card.Content>
                <View style={styles.deliveryCardHeader}>
                  <Text style={styles.deliveryCardTitle}>Pendentes</Text>
                  <Ionicons name="time" size={20} color="#f59e0b" />
                </View>
                <Text style={styles.deliveryCardValue}>8</Text>
              </Card.Content>
            </Card>

            {/* Em Rota */}
            <Card style={styles.deliveryCard}>
              <Card.Content>
                <View style={styles.deliveryCardHeader}>
                  <Text style={styles.deliveryCardTitle}>Em Rota</Text>
                  <Ionicons name="car" size={20} color="#3b82f6" />
                </View>
                <Text style={styles.deliveryCardValue}>5</Text>
              </Card.Content>
            </Card>

            {/* Entregues */}
            <Card style={styles.deliveryCard}>
              <Card.Content>
                <View style={styles.deliveryCardHeader}>
                  <Text style={styles.deliveryCardTitle}>Entregues</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <Text style={styles.deliveryCardValue}>16</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Gráfico de Pedidos */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Pedidos por Mês</Text>
            <BarChart
              data={pedidosData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
              showValuesOnTopOfBars
            />
          </Card.Content>
        </Card>

        {/* Gráfico de Faturamento */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Faturamento Mensal</Text>
            <LineChart
              data={faturamentoData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel="R$ "
              yAxisSuffix=""
              fromZero
              bezier
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  cardContent: {},
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendPositive: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 4,
  },
  trendNegative: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
  },
  deliveryContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  deliveryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryCard: {
    width: '31%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  deliveryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryCardTitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  deliveryCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -20,
  },
});