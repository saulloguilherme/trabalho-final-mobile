import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { Card } from 'react-native-paper'
import Ionicons from '@expo/vector-icons/Ionicons'
import { getEntregasMetrics, getEntregasList, Entrega } from '../services/entregas'

export default function Entregas() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filtro, setFiltro] = useState<string>('todos')
  const [metrics, setMetrics] = useState({
    total: 0,
    pendentes: 0,
    em_rota: 0,
    concluidas: 0
  })
  const [entregas, setEntregas] = useState<Entrega[]>([])

  useEffect(() => {
    loadEntregasData()
  }, [filtro])

  async function loadEntregasData() {
    try {
      const [metricsData, entregasData] = await Promise.all([
        getEntregasMetrics(),
        getEntregasList(filtro === 'todos' ? undefined : filtro)
      ])
      
      setMetrics(metricsData)
      setEntregas(entregasData)
    } catch (error) {
      console.error('Erro ao carregar entregas:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function onRefresh() {
    setRefreshing(true)
    loadEntregasData()
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente':
        return { color: '#f59e0b', icon: 'time' }
      case 'em_rota':
        return { color: '#3b82f6', icon: 'car' }
      case 'entregue':
        return { color: '#10b981', icon: 'checkmark-circle' }
      default:
        return { color: '#6b7280', icon: 'help-circle' }
    }
  }

  const formatHorario = (horario: string) => {
    if (!horario) return 'Não definido'
    const date = new Date(horario)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const handleFiltroPress = (tipo: string) => {
    setFiltro(tipo)
    setLoading(true)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando entregas...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Entregas</Text>
          <Text style={styles.subtitle}>Acompanhamento das entregas</Text>
        </View>

        <View style={styles.metricsContainer}>
          <Card 
            style={[styles.card, filtro === 'todos' && styles.cardSelecionado]} 
            onPress={() => handleFiltroPress('todos')}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Total</Text>
                <Ionicons name="cube" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.cardValue}>{metrics.total}</Text>
            </Card.Content>
          </Card>

          <Card 
            style={[styles.card, filtro === 'pendente' && styles.cardSelecionado]} 
            onPress={() => handleFiltroPress('pendente')}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Pendentes</Text>
                <Ionicons name="time" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.cardValue}>{metrics.pendentes}</Text>
            </Card.Content>
          </Card>

          <Card 
            style={[styles.card, filtro === 'em_rota' && styles.cardSelecionado]} 
            onPress={() => handleFiltroPress('em_rota')}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Em Rota</Text>
                <Ionicons name="car" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.cardValue}>{metrics.em_rota}</Text>
            </Card.Content>
          </Card>

          <Card 
            style={[styles.card, filtro === 'entregue' && styles.cardSelecionado]} 
            onPress={() => handleFiltroPress('entregue')}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Concluídas</Text>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              </View>
              <Text style={styles.cardValue}>{metrics.concluidas}</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.filtroInfo}>
          <Text style={styles.filtroTexto}>
            {filtro === 'todos' && 'Mostrando todas as entregas'}
            {filtro === 'pendente' && 'Mostrando apenas entregas pendentes'}
            {filtro === 'em_rota' && 'Mostrando apenas entregas em rota'}
            {filtro === 'entregue' && 'Mostrando apenas entregas concluídas'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Lista de Entregas ({entregas.length})</Text>

        {entregas.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContent}>
                <Ionicons name="cube-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>
                  {filtro === 'todos' && 'Nenhuma entrega encontrada'}
                  {filtro === 'pendente' && 'Nenhuma entrega pendente'}
                  {filtro === 'em_rota' && 'Nenhuma entrega em rota'}
                  {filtro === 'entregue' && 'Nenhuma entrega concluída'}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          entregas.map(entrega => {
            const statusInfo = getStatusInfo(entrega.status)
            const horario = entrega.horario_previsto || entrega.criado_em
            
            return (
              <Card key={entrega.id} style={styles.deliveryCard}>
                <Card.Content>
                  <View style={styles.deliveryHeader}>
                    <Text style={styles.deliveryClient}>{entrega.cliente_nome}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                      <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {entrega.status === 'pendente' ? 'Pendente' : 
                         entrega.status === 'em_rota' ? 'Em Rota' : 
                         entrega.status === 'entregue' ? 'Concluída' : entrega.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.deliveryInfo}>
                    📍 {entrega.cliente_endereco}
                  </Text>
                  <Text style={styles.deliveryInfo}>
                    📦 {entrega.produto_nome} x{entrega.quantidade}
                  </Text>
                  <Text style={styles.deliveryInfo}>
                    ⏰ {formatHorario(horario)}
                  </Text>
                  {entrega.valor_total && (
                    <Text style={styles.deliveryInfo}>
                      💰 R$ {entrega.valor_total.toFixed(2)}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollView: {
    padding: 16
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b'
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  card: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff'
  },
  cardSelecionado: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#3b82f6'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 12,
    color: '#64748b'
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b'
  },
  filtroInfo: {
    marginBottom: 16
  },
  filtroTexto: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16
  },
  deliveryCard: {
    marginBottom: 12,
    borderRadius: 12
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  deliveryClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  },
  deliveryInfo: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b'
  },
  emptyCard: {
    marginBottom: 12,
    borderRadius: 12
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16
  }
})
