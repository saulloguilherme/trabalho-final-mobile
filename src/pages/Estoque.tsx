import React, { useState, useEffect } from 'react'
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import {
  Card,
  Button,
  Badge,
  Modal,
  Portal,
  Provider,
  SegmentedButtons,
  ProgressBar
} from 'react-native-paper'
import Ionicons from '@expo/vector-icons/Ionicons'
import { getEstoque, getEstoqueMetrics, updateEstoqueQuantidade, ProdutoEstoque } from '../services/estoque'

export default function EstoqueScreen() {
  const [estoque, setEstoque] = useState<ProdutoEstoque[]>([])
  const [modalVisivel, setModalVisivel] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoEstoque | null>(null)
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada')
  const [quantidade, setQuantidade] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState({
    totalCheios: 0,
    totalVazios: 0,
    alertas: 0,
    capacidadePercent: 0
  })

  useEffect(() => {
    loadEstoqueData()
  }, [])

  async function loadEstoqueData() {
    try {
      const [estoqueData, metricsData] = await Promise.all([
        getEstoque(),
        getEstoqueMetrics()
      ])
      
      setEstoque(estoqueData)
      setMetrics(metricsData)
    } catch (error) {
      console.error('Erro ao carregar estoque:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function onRefresh() {
    setRefreshing(true)
    loadEstoqueData()
  }

  const statusInfo = (p: ProdutoEstoque) => {
    if (p.quantidade_cheios < p.quantidade_minima) return { label: 'Crítico', color: '#fee2e2', icon: 'alert' }
    if (p.quantidade_cheios < p.quantidade_minima * 1.5) return { label: 'Baixo', color: '#fef3c7', icon: 'trending-down' }
    return { label: 'Normal', color: '#dcfce7', icon: 'trending-up' }
  }

  const confirmarAjuste = async () => {
    if (!produtoSelecionado) return
    const qtd = parseInt(quantidade) || 0
    if (qtd <= 0) return

    try {
      await updateEstoqueQuantidade(produtoSelecionado.id, tipo, qtd)
      
      setEstoque((prev) =>
        prev.map((p) =>
          p.id === produtoSelecionado.id
            ? {
                ...p,
                quantidade_cheios: tipo === 'entrada' ? p.quantidade_cheios + qtd : Math.max(0, p.quantidade_cheios - qtd),
              }
            : p
        )
      )

      setModalVisivel(false)
      setProdutoSelecionado(null)
      setQuantidade('')
      setTipo('entrada')
      
      await loadEstoqueData()
    } catch (error) {
      console.error('Erro ao ajustar estoque:', error)
    }
  }

  if (loading) {
    return (
      <Provider>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando estoque...</Text>
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
              tintColor="#007AFF"
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.titulo}>Estoque</Text>
            <Text style={styles.subtitulo}>Controle de cilindros</Text>
          </View>

          <View style={styles.cardsResumo}>
            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Cheios</Text>
                <Text style={styles.resumoValor}>{metrics.totalCheios}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Vazios</Text>
                <Text style={styles.resumoValor}>{metrics.totalVazios}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Alertas</Text>
                <Text style={[styles.resumoValor, { color: '#dc2626' }]}>{metrics.alertas}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Capacidade</Text>
                <Text style={styles.resumoValor}>{metrics.capacidadePercent}%</Text>
              </Card.Content>
            </Card>
          </View>

          {estoque.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <View style={styles.emptyContent}>
                  <Ionicons name="archive-outline" size={48} color="#9ca3af" />
                  <Text style={styles.emptyText}>Nenhum produto em estoque</Text>
                </View>
              </Card.Content>
            </Card>
          ) : (
            estoque.map((p) => {
              const status = statusInfo(p)
              const progress = p.quantidade_cheios / p.capacidade_maxima

              return (
                <Card key={p.id} style={styles.cardProduto}>
                  <Card.Content>
                    <View style={styles.cardTopo}>
                      <View>
                        <Text style={styles.nomeProduto}>{p.nome}</Text>
                        <Text style={styles.localizacao}>{p.tipo}</Text>
                      </View>
                      <Badge style={{ backgroundColor: status.color }}>{status.label}</Badge>
                    </View>

                    <View style={styles.linhaQuantidade}>
                      <Text style={styles.qtdTexto}>
                        {p.quantidade_cheios} / {p.capacidade_maxima}
                      </Text>
                    </View>

                    <ProgressBar progress={progress} style={styles.progress} />

                    <View style={styles.gridInfo}>
                      <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Cheios</Text>
                        <Text style={styles.infoValorVerde}>{p.quantidade_cheios}</Text>
                      </View>
                      <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Vazios</Text>
                        <Text style={styles.infoValorCinza}>{p.quantidade_vazios}</Text>
                      </View>
                      <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Mínimo</Text>
                        <Text style={styles.infoValorAzul}>{p.quantidade_minima}</Text>
                      </View>
                    </View>

                    <Button
                      mode="outlined"
                      onPress={() => {
                        setProdutoSelecionado(p)
                        setModalVisivel(true)
                      }}
                    >
                      Ajustar Estoque
                    </Button>
                  </Card.Content>
                </Card>
              )
            })
          )}
        </ScrollView>

        <Portal>
          <Modal
            visible={modalVisivel}
            onDismiss={() => {
              setModalVisivel(false)
              setProdutoSelecionado(null)
              setQuantidade('')
              setTipo('entrada')
            }}
            contentContainerStyle={styles.modal}
          >
            {produtoSelecionado && (
              <ScrollView>
                <Text style={styles.modalTitulo}>
                  Ajustar Estoque - {produtoSelecionado.nome}
                </Text>

                <SegmentedButtons
                  value={tipo}
                  onValueChange={(v) => setTipo(v as 'entrada' | 'saida')}
                  buttons={[
                    { value: 'entrada', label: 'Entrada', icon: 'plus' },
                    { value: 'saida', label: 'Saída', icon: 'minus' }
                  ]}
                />

                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={quantidade}
                  onChangeText={setQuantidade}
                  placeholder="Quantidade"
                />

                <View style={styles.resumoAjuste}>
                  <Text>Atual: {produtoSelecionado.quantidade_cheios}</Text>
                  <Text>
                    Nova:{' '}
                    {tipo === 'entrada'
                      ? produtoSelecionado.quantidade_cheios + (parseInt(quantidade) || 0)
                      : Math.max(0, produtoSelecionado.quantidade_cheios - (parseInt(quantidade) || 0))}
                  </Text>
                </View>

                <Button mode="contained" onPress={confirmarAjuste}>
                  Confirmar Ajuste
                </Button>
              </ScrollView>
            )}
          </Modal>
        </Portal>
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
  cardsResumo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  cardResumo: { width: (width - 40) / 2, marginBottom: 12 },
  resumoLabel: { fontSize: 12, color: '#64748b' },
  resumoValor: { fontSize: 24, fontWeight: '700', color: '#1e293b' },
  cardProduto: { marginBottom: 16 },
  cardTopo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  nomeProduto: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  localizacao: { fontSize: 12, color: '#64748b' },
  linhaQuantidade: { marginBottom: 8 },
  qtdTexto: { fontSize: 14, fontWeight: '500' },
  progress: { height: 8, borderRadius: 4, marginBottom: 12 },
  gridInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoBox: { alignItems: 'center', width: '30%' },
  infoLabel: { fontSize: 12, color: '#64748b' },
  infoValorVerde: { fontSize: 18, fontWeight: '600', color: '#059669' },
  infoValorCinza: { fontSize: 18, fontWeight: '600', color: '#475569' },
  infoValorAzul: { fontSize: 18, fontWeight: '600', color: '#2563eb' },
  modal: { backgroundColor: '#fff', margin: 20, borderRadius: 16, padding: 20 },
  modalTitulo: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginVertical: 16 },
  resumoAjuste: { marginBottom: 16 },
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
    marginBottom: 16
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
