import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Card } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

const entregas = [
  {
    id: 'ENT-001',
    cliente: 'João Silva',
    endereco: 'Rua das Flores, 123',
    produto: 'P13',
    quantidade: 2,
    horario: '09:00',
    status: 'Pendente',
    statusColor: '#f59e0b',
    icon: 'time',
  },
  {
    id: 'ENT-002',
    cliente: 'Maria Santos',
    endereco: 'Av. Central, 456',
    produto: 'P20',
    quantidade: 1,
    horario: '10:30',
    status: 'Em Rota',
    statusColor: '#3b82f6',
    icon: 'car',
  },
  {
    id: 'ENT-003',
    cliente: 'Pedro Oliveira',
    endereco: 'Rua do Comércio, 789',
    produto: 'P45',
    quantidade: 1,
    horario: '11:15',
    status: 'Concluída',
    statusColor: '#10b981',
    icon: 'checkmark-circle',
  },
];

export default function Entregas() {
  const pendentes = entregas.filter(e => e.status === 'Pendente').length;
  const emRota = entregas.filter(e => e.status === 'Em Rota').length;
  const concluidas = entregas.filter(e => e.status === 'Concluída').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Entregas</Text>
          <Text style={styles.subtitle}>Acompanhamento das entregas</Text>
        </View>

        {/* Métricas */}
        <View style={styles.metricsContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Total</Text>
                <Ionicons name="cube" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.cardValue}>{entregas.length}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Pendentes</Text>
                <Ionicons name="time" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.cardValue}>{pendentes}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Em Rota</Text>
                <Ionicons name="car" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.cardValue}>{emRota}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Concluídas</Text>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              </View>
              <Text style={styles.cardValue}>{concluidas}</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Lista de Entregas */}
        <Text style={styles.sectionTitle}>Lista de Entregas</Text>

        {entregas.map(entrega => (
          <Card key={entrega.id} style={styles.deliveryCard}>
            <Card.Content>
              <View style={styles.deliveryHeader}>
                <Text style={styles.deliveryClient}>{entrega.cliente}</Text>
                <View style={[styles.statusBadge, { backgroundColor: entrega.statusColor + '20' }]}>
                  <Ionicons name={entrega.icon as any} size={14} color={entrega.statusColor} />
                  <Text style={[styles.statusText, { color: entrega.statusColor }]}>
                    {entrega.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.deliveryInfo}>
                📍 {entrega.endereco}
              </Text>
              <Text style={styles.deliveryInfo}>
                📦 {entrega.produto} x{entrega.quantidade}
              </Text>
              <Text style={styles.deliveryInfo}>
                ⏰ {entrega.horario}
              </Text>
            </Card.Content>
          </Card>
        ))}

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
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    color: '#64748b',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  deliveryCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  deliveryInfo: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
});
