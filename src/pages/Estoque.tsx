import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Badge,
  Modal,
  Portal,
  Provider,
  SegmentedButtons,
  ProgressBar,
} from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ProdutoEstoque {
  id: string;
  nome: string;
  tipo: string;
  quantidade: number;
  minimo: number;
  maximo: number;
  cheios: number;
  vazios: number;
  localizacao: string;
}

const estoqueInicial: ProdutoEstoque[] = [
  { id: 'EST-001', nome: 'Botijão P13', tipo: 'P13', quantidade: 45, minimo: 30, maximo: 100, cheios: 45, vazios: 18, localizacao: 'Setor A' },
  { id: 'EST-002', nome: 'Botijão P20', tipo: 'P20', quantidade: 62, minimo: 40, maximo: 120, cheios: 62, vazios: 25, localizacao: 'Setor A' },
  { id: 'EST-003', nome: 'Botijão P45', tipo: 'P45', quantidade: 28, minimo: 20, maximo: 60, cheios: 28, vazios: 12, localizacao: 'Setor B' },
  { id: 'EST-004', nome: 'Botijão P8', tipo: 'P8', quantidade: 15, minimo: 25, maximo: 50, cheios: 15, vazios: 8, localizacao: 'Setor B' },
];

export default function EstoqueScreen() {
  const [estoque, setEstoque] = useState<ProdutoEstoque[]>(estoqueInicial);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoEstoque | null>(null);
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [quantidade, setQuantidade] = useState('0');

  const totalCheios = estoque.reduce((a, b) => a + b.quantidade, 0);
  const totalVazios = estoque.reduce((a, b) => a + b.vazios, 0);
  const alertas = estoque.filter((p) => p.quantidade < p.minimo).length;

  const statusInfo = (p: ProdutoEstoque) => {
    if (p.quantidade < p.minimo) return { label: 'Crítico', color: '#fee2e2', icon: 'alert' };
    if (p.quantidade < p.minimo * 1.5) return { label: 'Baixo', color: '#fef3c7', icon: 'trending-down' };
    return { label: 'Normal', color: '#dcfce7', icon: 'trending-up' };
  };

  const confirmarAjuste = () => {
    if (!produtoSelecionado) return;
    const qtd = parseInt(quantidade) || 0;

    setEstoque((prev) =>
      prev.map((p) =>
        p.id === produtoSelecionado.id
          ? {
              ...p,
              quantidade: tipo === 'entrada' ? p.quantidade + qtd : Math.max(0, p.quantidade - qtd),
              cheios: tipo === 'entrada' ? p.quantidade + qtd : Math.max(0, p.quantidade - qtd),
            }
          : p
      )
    );

    setModalVisivel(false);
    setProdutoSelecionado(null);
    setQuantidade('0');
    setTipo('entrada');
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Estoque</Text>
            <Text style={styles.subtitulo}>Controle de cilindros</Text>
          </View>

          <View style={styles.cardsResumo}>
            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Cheios</Text>
                <Text style={styles.resumoValor}>{totalCheios}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Vazios</Text>
                <Text style={styles.resumoValor}>{totalVazios}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Alertas</Text>
                <Text style={[styles.resumoValor, { color: '#dc2626' }]}>{alertas}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Capacidade</Text>
                <Text style={styles.resumoValor}>68%</Text>
              </Card.Content>
            </Card>
          </View>

          {estoque.map((p) => {
            const status = statusInfo(p);
            const progress = p.quantidade / p.maximo;

            return (
              <Card key={p.id} style={styles.cardProduto}>
                <Card.Content>
                  <View style={styles.cardTopo}>
                    <View>
                      <Text style={styles.nomeProduto}>{p.nome}</Text>
                      <Text style={styles.localizacao}>{p.localizacao}</Text>
                    </View>
                    <Badge style={{ backgroundColor: status.color }}>{status.label}</Badge>
                  </View>

                  <View style={styles.linhaQuantidade}>
                    <Text style={styles.qtdTexto}>
                      {p.quantidade} / {p.maximo}
                    </Text>
                  </View>

                  <ProgressBar progress={progress} style={styles.progress} />

                  <View style={styles.gridInfo}>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoLabel}>Cheios</Text>
                      <Text style={styles.infoValorVerde}>{p.cheios}</Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoLabel}>Vazios</Text>
                      <Text style={styles.infoValorCinza}>{p.vazios}</Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoLabel}>Mínimo</Text>
                      <Text style={styles.infoValorAzul}>{p.minimo}</Text>
                    </View>
                  </View>

                  <Button
                    mode="outlined"
                    onPress={() => {
                      setProdutoSelecionado(p);
                      setModalVisivel(true);
                    }}
                  >
                    Ajustar Estoque
                  </Button>
                </Card.Content>
              </Card>
            );
          })}
        </ScrollView>

        <Portal>
          <Modal
            visible={modalVisivel}
            onDismiss={() => setModalVisivel(false)}
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
                    { value: 'saida', label: 'Saída', icon: 'minus' },
                  ].map((b) => ({ ...b, icon: b.icon as keyof typeof Ionicons.glyphMap }))}
                />

                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={quantidade}
                  onChangeText={setQuantidade}
                  placeholder="Quantidade"
                />

                <View style={styles.resumoAjuste}>
                  <Text>Atual: {produtoSelecionado.quantidade}</Text>
                  <Text>
                    Nova:{' '}
                    {tipo === 'entrada'
                      ? produtoSelecionado.quantidade + (parseInt(quantidade) || 0)
                      : Math.max(0, produtoSelecionado.quantidade - (parseInt(quantidade) || 0))}
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
  );
}

const { width } = Dimensions.get('window');

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
});
