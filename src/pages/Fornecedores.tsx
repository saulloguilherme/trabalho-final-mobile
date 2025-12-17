import React, { useEffect, useState, useMemo } from 'react'
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import {
  Card,
  Button,
  Badge,
  Provider,
  TextInput,
  Modal,
  Portal
} from 'react-native-paper'
import Ionicons from '@expo/vector-icons/Ionicons'
import {
  getPagamentos,
  getPagamentosResumo,
  marcarPagamentoComoPago,
  criarPagamento,
  Pagamento
} from '../services/fornecedores'

type Filtro = 'todos' | 'pago' | 'pendente' | 'atrasado'

export default function FornecedoresScreen() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filtroAtivo, setFiltroAtivo] = useState<Filtro>('todos')
  const [resumo, setResumo] = useState({
    totalPago: 0,
    totalPendente: 0,
    totalAtrasado: 0
  })

  const [modalNovoVisivel, setModalNovoVisivel] = useState(false)
  const [novoPagamento, setNovoPagamento] = useState({
    fornecedor_nome: '',
    fornecedor_contato: '',
    descricao: '',
    valor: '',
    vencimento: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setLoading(true)
      const [lista, resumoData] = await Promise.all([
        getPagamentos(),
        getPagamentosResumo()
      ])
      setPagamentos(lista)
      setResumo(resumoData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function onRefresh() {
    setRefreshing(true)
    carregarDados()
  }

  const listaFiltrada = useMemo(() => {
    return pagamentos
      .filter(p => filtroAtivo === 'todos' || p.status === filtroAtivo)
      .filter(p =>
        p.fornecedor_nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        p.id.toLowerCase().includes(busca.toLowerCase())
      )
  }, [pagamentos, filtroAtivo, busca])

  const marcarPago = async (id: string) => {
    await marcarPagamentoComoPago(id)
    await carregarDados()
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`
    }
    return `R$ ${value.toLocaleString('pt-BR')}`
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR')

  if (loading) {
    return (
      <Provider>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Carregando pagamentos...</Text>
        </SafeAreaView>
      </Provider>
    )
  }

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
            />
          }
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.titulo}>Fornecedores</Text>
              <Text style={styles.subtitulo}>Pagamentos e contas</Text>
            </View>
            <Button
              mode="outlined"
              icon="plus"
              onPress={() => setModalNovoVisivel(true)}
            >
              Novo
            </Button>
          </View>

          {/* RESUMO */}
          <View style={styles.resumo}>
            <Card
              style={[
                styles.cardResumo,
                filtroAtivo === 'pago' && styles.cardSelecionado
              ]}
              onPress={() => setFiltroAtivo('pago')}
            >
              <Card.Content>
                <Text style={styles.label}>Pagos</Text>
                <Text style={[styles.valor, { color: '#059669' }]}>
                  {formatCurrency(resumo.totalPago)}
                </Text>
              </Card.Content>
            </Card>

            <Card
              style={[
                styles.cardResumo,
                filtroAtivo === 'pendente' && styles.cardSelecionado
              ]}
              onPress={() => setFiltroAtivo('pendente')}
            >
              <Card.Content>
                <Text style={styles.label}>Pendentes</Text>
                <Text style={[styles.valor, { color: '#ca8a04' }]}>
                  {formatCurrency(resumo.totalPendente)}
                </Text>
              </Card.Content>
            </Card>

            <Card
              style={[
                styles.cardResumo,
                filtroAtivo === 'atrasado' && styles.cardSelecionado
              ]}
              onPress={() => setFiltroAtivo('atrasado')}
            >
              <Card.Content>
                <Text style={styles.label}>Atrasados</Text>
                <Text style={[styles.valor, { color: '#dc2626' }]}>
                  {formatCurrency(resumo.totalAtrasado)}
                </Text>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.filtroInfo}>
            <Text style={styles.filtroTexto}>
              Mostrando {listaFiltrada.length} pagamentos
            </Text>
            {filtroAtivo !== 'todos' && (
              <Button mode="text" onPress={() => setFiltroAtivo('todos')}>
                Limpar
              </Button>
            )}
          </View>

          {/* BUSCA */}
          <TextInput
            mode="outlined"
            placeholder="Buscar pagamento"
            value={busca}
            onChangeText={setBusca}
            style={styles.input}
            left={<TextInput.Icon icon="magnify" />}
          />

          {/* LISTA */}
          {listaFiltrada.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons
                  name="receipt-outline"
                  size={48}
                  color="#9ca3af"
                />
                <Text style={styles.emptyText}>
                  Nenhum pagamento encontrado
                </Text>
              </Card.Content>
            </Card>
          ) : (
            listaFiltrada.map(p => (
              <Card key={p.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.linhaTopo}>
                    <View>
                      <Text style={styles.fornecedor}>
                        {p.fornecedor_nome}
                      </Text>
                      <Text style={styles.id}>{p.id}</Text>
                    </View>

                    <Badge
                      style={[
                        styles.badge,
                        p.status === 'pago'
                          ? styles.pago
                          : p.status === 'pendente'
                          ? styles.pendente
                          : styles.atrasado
                      ]}
                    >
                      {p.status.toUpperCase()}
                    </Badge>
                  </View>

                  <Text style={styles.descricao}>{p.descricao}</Text>

                  <View style={styles.linhaInfo}>
                    <View>
                      <Text style={styles.small}>Valor</Text>
                      <Text style={styles.valorItem}>
                        R$ {p.valor.toLocaleString('pt-BR')}
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.small}>
                        {p.status === 'pago'
                          ? 'Pago em'
                          : 'Vencimento'}
                      </Text>
                      <Text style={styles.data}>
                        {p.status === 'pago' && p.data_pagamento
                          ? formatDate(p.data_pagamento)
                          : formatDate(p.vencimento)}
                      </Text>
                    </View>
                  </View>

                  {p.status !== 'pago' && (
                    <Button
                      mode="outlined"
                      onPress={() => marcarPago(p.id)}
                      style={styles.botaoPagar}
                    >
                      Marcar como pago
                    </Button>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Provider>
  )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f8fafc' }, scroll: { padding: 16 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, titulo: { fontSize: 28, fontWeight: '700', color: '#1e293b' }, subtitulo: { fontSize: 14, color: '#64748b' }, resumo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 }, cardResumo: { width: (width - 48) / 2, marginBottom: 12 }, cardSelecionado: { backgroundColor: '#f0f9ff', borderWidth: 2, borderColor: '#3b82f6' }, label: { fontSize: 12, color: '#64748b' }, valor: { fontSize: 20, fontWeight: '700', color: '#1e293b' }, filtroInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 8 }, filtroTexto: { fontSize: 14, color: '#3b82f6', fontWeight: '500' }, botaoLimparFiltro: { padding: 0 }, input: { marginBottom: 16 }, card: { marginBottom: 16 }, linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }, fornecedor: { fontSize: 16, fontWeight: '600' }, id: { fontSize: 12, color: '#64748b' }, descricao: { fontSize: 14, color: '#475569', marginBottom: 12 }, linhaInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }, small: { fontSize: 12, color: '#64748b' }, valorItem: { fontSize: 16, fontWeight: '600' }, data: { fontSize: 14 }, badge: { alignSelf: 'flex-start' }, pago: { backgroundColor: '#dcfce7' }, pendente: { backgroundColor: '#fef9c3' }, atrasado: { backgroundColor: '#fee2e2' }, botaoPagar: { marginTop: 8 }, loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }, loadingText: { marginTop: 16, fontSize: 16, color: '#64748b' }, emptyCard: { marginBottom: 16 }, emptyContent: { alignItems: 'center', padding: 32 }, emptyText: { fontSize: 16, color: '#9ca3af', marginTop: 16 }, modal: { backgroundColor: '#fff', margin: 20, borderRadius: 16, padding: 20 }, modalTitulo: { fontSize: 20, fontWeight: '700', marginBottom: 16 }, modalInput: { marginBottom: 12 }, modalButton: { marginTop: 8 } })