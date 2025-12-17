import React, { useState, useEffect } from 'react'
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
  Badge,
  Provider,
  ProgressBar
} from 'react-native-paper'
import Ionicons from '@expo/vector-icons/Ionicons'
import {
  getFaturamentoResumo,
  getFaturamentoSemanal,
  getVendasPorProduto,
  getMovimentacoesRecentes,
  FaturamentoDiario,
  VendaPorProduto,
  Movimentacao
} from '../services/faturamento'

export default function FaturamentoScreen() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [resumo, setResumo] = useState({
    receitaHoje: 0,
    despesasHoje: 0,
    receitaSemana: 0,
    despesasSemana: 0,
    variacaoHoje: 0
  })
  const [faturamentoSemanal, setFaturamentoSemanal] = useState<FaturamentoDiario[]>([])
  const [vendasPorProduto, setVendasPorProduto] = useState<VendaPorProduto[]>([])
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])

  useEffect(() => {
    loadFaturamentoData()
  }, [])

  async function loadFaturamentoData() {
    try {
      const [resumoData, semanalData, vendasData, movimentacoesData] = await Promise.all([
        getFaturamentoResumo(),
        getFaturamentoSemanal(),
        getVendasPorProduto(),
        getMovimentacoesRecentes()
      ])

      setResumo(resumoData)
      setFaturamentoSemanal(semanalData)
      setVendasPorProduto(vendasData)
      setMovimentacoes(movimentacoesData)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function onRefresh() {
    setRefreshing(true)
    loadFaturamentoData()
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`
    }
    return `R$ ${value.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const getMaxValor = () => {
    const maxReceita = Math.max(...faturamentoSemanal.map(d => d.receita), 0)
    return Math.max(maxReceita * 1.2, 1000)
  }

  if (loading) {
    return (
      <Provider>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando faturamento...</Text>
        </SafeAreaView>
      </Provider>
    )
  }

  const maxValor = getMaxValor()

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.titulo}>Faturamento</Text>
              <Text style={styles.subtitulo}>Relatórios financeiros</Text>
            </View>
          </View>

          <View style={styles.cardsResumo}>
            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Receita Hoje</Text>
                <Text style={styles.resumoValor}>{formatCurrency(resumo.receitaHoje)}</Text>
                <Text style={resumo.variacaoHoje >= 0 ? styles.crescimentoPositivo : styles.crescimentoNegativo}>
                  {resumo.variacaoHoje >= 0 ? '+' : ''}{resumo.variacaoHoje}% ontem
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Despesas Hoje</Text>
                <Text style={styles.resumoValor}>{formatCurrency(resumo.despesasHoje)}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Receita Semana</Text>
                <Text style={styles.resumoValor}>{formatCurrency(resumo.receitaSemana)}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Despesas Semana</Text>
                <Text style={styles.resumoValor}>{formatCurrency(resumo.despesasSemana)}</Text>
              </Card.Content>
            </Card>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitulo}>Receita vs Despesas - Semana</Text>
              {faturamentoSemanal.map((dia) => (
                <View key={`${dia.dia}-${dia.diaSemana}`} style={styles.linhaGrafico}>
                  <View style={styles.diaContainer}>
                    <Text style={styles.diaSemana}>{dia.diaSemana}</Text>
                    <Text style={styles.diaNumero}>{dia.dia}</Text>
                  </View>
                  <View style={styles.barrasContainer}>
                    <ProgressBar progress={dia.receita / maxValor} style={styles.barReceita} />
                    <ProgressBar progress={dia.despesas / maxValor} style={styles.barDespesa} />
                  </View>
                  <View style={styles.valoresContainer}>
                    <Text style={styles.valorReceita}>{formatCurrency(dia.receita)}</Text>
                    <Text style={styles.valorDespesa}>{formatCurrency(dia.despesas)}</Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitulo}>Vendas por Produto - Semana</Text>
              {vendasPorProduto.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma venda registrada</Text>
              ) : (
                vendasPorProduto.map((p) => (
                  <View key={p.nome} style={styles.linhaProduto}>
                    <Text style={styles.produtoNome}>{p.nome}</Text>
                    <Text style={styles.produtoValor}>{formatCurrency(p.valor)}</Text>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitulo}>Movimentações Recentes</Text>
              {movimentacoes.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma movimentação recente</Text>
              ) : (
                movimentacoes.map((m) => (
                  <View key={`${m.origem}-${m.id}`} style={styles.transacao}>
                    <Ionicons
                      name={m.tipo === 'receita' ? 'trending-up' : 'trending-down'}
                      size={18}
                      color={m.tipo === 'receita' ? '#059669' : '#dc2626'}
                    />
                    <View style={styles.transacaoInfo}>
                      <Text style={styles.transacaoDesc}>{m.descricao}</Text>
                      <Text style={styles.transacaoData}>{formatDate(m.data)}</Text>
                    </View>
                    <View style={styles.transacaoValor}>
                      <Text
                        style={{
                          color: m.tipo === 'receita' ? '#059669' : '#dc2626',
                          fontWeight: '600'
                        }}
                      >
                        {m.tipo === 'receita' ? '+' : '-'}R$ {m.valor.toFixed(2)}
                      </Text>
                      <Badge
                        style={[
                          styles.badgeMovimentacao,
                          m.status === 'pago' || m.status === 'entregue' ? styles.pago : styles.pendente
                        ]}
                      >
                        {m.status === 'pago' ? 'Pago' : m.status === 'entregue' ? 'Entregue' : 'Pendente'}
                      </Badge>
                    </View>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Provider>
  )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16 },
  header: { marginBottom: 20 },
  titulo: { fontSize: 28, fontWeight: '700', color: '#1e293b' },
  subtitulo: { fontSize: 14, color: '#64748b' },
  cardsResumo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  cardResumo: { width: (width - 40) / 2, marginBottom: 12 },
  resumoLabel: { fontSize: 12, color: '#64748b' },
  resumoValor: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  crescimentoPositivo: { fontSize: 12, color: '#059669' },
  crescimentoNegativo: { fontSize: 12, color: '#dc2626' },
  card: { marginBottom: 16 },
  cardTitulo: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  linhaGrafico: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  diaContainer: { width: 40, alignItems: 'center' },
  diaSemana: { fontSize: 12, color: '#64748b' },
  diaNumero: { fontSize: 14, fontWeight: '600' },
  barrasContainer: { flex: 1, marginHorizontal: 12 },
  barReceita: { height: 8, marginBottom: 4, backgroundColor: '#10b981' },
  barDespesa: { height: 8, backgroundColor: '#ef4444' },
  valoresContainer: { width: 80, alignItems: 'flex-end' },
  valorReceita: { fontSize: 10, color: '#10b981', marginBottom: 2 },
  valorDespesa: { fontSize: 10, color: '#ef4444' },
  linhaProduto: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  produtoNome: { fontSize: 14 },
  produtoValor: { fontSize: 14, fontWeight: '600' },
  transacao: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  transacaoInfo: { flex: 1, marginLeft: 8 },
  transacaoDesc: { fontSize: 14, fontWeight: '500' },
  transacaoData: { fontSize: 12, color: '#64748b' },
  transacaoValor: { alignItems: 'flex-end' },
  badgeMovimentacao: { marginTop: 2 },
  pago: { backgroundColor: '#dcfce7' },
  pendente: { backgroundColor: '#fef3c7' },
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
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    padding: 16
  }
})
