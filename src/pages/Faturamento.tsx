import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Badge,
  Provider,
  SegmentedButtons,
  ProgressBar,
} from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

const faturamentoMensal = [
  { mes: 'Jan', receita: 12500, despesas: 8200, lucro: 4300 },
  { mes: 'Fev', receita: 14800, despesas: 9100, lucro: 5700 },
  { mes: 'Mar', receita: 17300, despesas: 10200, lucro: 7100 },
  { mes: 'Abr', receita: 16500, despesas: 9800, lucro: 6700 },
  { mes: 'Mai', receita: 19800, despesas: 11500, lucro: 8300 },
  { mes: 'Jun', receita: 19200, despesas: 11200, lucro: 8000 },
];

const vendasPorProduto = [
  { nome: 'P13', valor: 8500, porcentagem: 44 },
  { nome: 'P20', valor: 6200, porcentagem: 32 },
  { nome: 'P45', valor: 3800, porcentagem: 20 },
  { nome: 'P8', valor: 700, porcentagem: 4 },
];

const transacoesRecentes = [
  { id: 'TRX-001', tipo: 'receita', descricao: 'Venda - João Silva', valor: 180, data: '21/11/2025', status: 'pago' },
  { id: 'TRX-002', tipo: 'receita', descricao: 'Venda - Maria Santos', valor: 150, data: '21/11/2025', status: 'pago' },
  { id: 'TRX-003', tipo: 'despesa', descricao: 'Fornecedor - Recarga', valor: 4500, data: '20/11/2025', status: 'pago' },
  { id: 'TRX-004', tipo: 'receita', descricao: 'Venda - Pedro Oliveira', valor: 90, data: '20/11/2025', status: 'pendente' },
  { id: 'TRX-005', tipo: 'despesa', descricao: 'Manutenção veículo', valor: 350, data: '19/11/2025', status: 'pago' },
];

export default function FaturamentoScreen() {
  const [periodo, setPeriodo] = useState('mensal');

  const atual = faturamentoMensal[faturamentoMensal.length - 1];
  const anterior = faturamentoMensal[faturamentoMensal.length - 2];

  const crescimento = (((atual.receita - anterior.receita) / anterior.receita) * 100).toFixed(1);
  const margem = ((atual.lucro / atual.receita) * 100).toFixed(1);

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll}>
          <View style={styles.header}>
            <View>
              <Text style={styles.titulo}>Faturamento</Text>
              <Text style={styles.subtitulo}>Relatórios financeiros</Text>
            </View>
            <Button icon="download" mode="outlined" />
          </View>

          <SegmentedButtons
            value={periodo}
            onValueChange={setPeriodo}
            buttons={[
              { value: 'diario', label: 'Diário' },
              { value: 'semanal', label: 'Semanal' },
              { value: 'mensal', label: 'Mensal' },
              { value: 'anual', label: 'Anual' },
            ]}
            style={styles.segmented}
          />

          <View style={styles.cardsResumo}>
            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Receita</Text>
                <Text style={styles.resumoValor}>R$ {(atual.receita / 1000).toFixed(1)}k</Text>
                <Text style={styles.crescimento}>+{crescimento}%</Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Despesas</Text>
                <Text style={styles.resumoValor}>R$ {(atual.despesas / 1000).toFixed(1)}k</Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Lucro</Text>
                <Text style={[styles.resumoValor, { color: '#059669' }]}>
                  R$ {(atual.lucro / 1000).toFixed(1)}k
                </Text>
                <Text style={styles.subInfo}>{margem}% margem</Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.resumoLabel}>Ticket Médio</Text>
                <Text style={styles.resumoValor}>R$ 145</Text>
              </Card.Content>
            </Card>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitulo}>Receita vs Despesas</Text>
              {faturamentoMensal.map((m) => (
                <View key={m.mes} style={styles.linhaGrafico}>
                  <Text style={styles.mes}>{m.mes}</Text>
                  <ProgressBar progress={m.receita / 20000} style={styles.barReceita} />
                  <ProgressBar progress={m.despesas / 20000} style={styles.barDespesa} />
                </View>
              ))}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitulo}>Vendas por Produto</Text>
              {vendasPorProduto.map((p) => (
                <View key={p.nome} style={styles.linhaProduto}>
                  <Text style={styles.produtoNome}>{p.nome}</Text>
                  <Text style={styles.produtoValor}>
                    R$ {(p.valor / 1000).toFixed(1)}k
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitulo}>Transações Recentes</Text>
              {transacoesRecentes.map((t) => (
                <View key={t.id} style={styles.transacao}>
                  <Ionicons
                    name={t.tipo === 'receita' ? 'trending-up' : 'trending-down'}
                    size={18}
                    color={t.tipo === 'receita' ? '#059669' : '#dc2626'}
                  />
                  <View style={styles.transacaoInfo}>
                    <Text style={styles.transacaoDesc}>{t.descricao}</Text>
                    <Text style={styles.transacaoData}>{t.data}</Text>
                  </View>
                  <View style={styles.transacaoValor}>
                    <Text
                      style={{
                        color: t.tipo === 'receita' ? '#059669' : '#dc2626',
                        fontWeight: '600',
                      }}
                    >
                      {t.tipo === 'receita' ? '+' : '-'}R$ {t.valor}
                    </Text>
                    <Badge>{t.status === 'pago' ? 'Pago' : 'Pendente'}</Badge>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Provider>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  titulo: { fontSize: 28, fontWeight: '700', color: '#1e293b' },
  subtitulo: { fontSize: 14, color: '#64748b' },
  segmented: { marginBottom: 20 },
  cardsResumo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardResumo: { width: (width - 40) / 2, marginBottom: 12 },
  resumoLabel: { fontSize: 12, color: '#64748b' },
  resumoValor: { fontSize: 22, fontWeight: '700', color: '#1e293b' },
  crescimento: { fontSize: 12, color: '#059669' },
  subInfo: { fontSize: 12, color: '#64748b' },
  card: { marginBottom: 16 },
  cardTitulo: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  linhaGrafico: { marginBottom: 8 },
  mes: { fontSize: 12, marginBottom: 4 },
  barReceita: { height: 6, marginBottom: 4 },
  barDespesa: { height: 6 },
  linhaProduto: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  produtoNome: { fontSize: 14 },
  produtoValor: { fontSize: 14, fontWeight: '600' },
  transacao: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  transacaoInfo: { flex: 1, marginLeft: 8 },
  transacaoDesc: { fontSize: 14, fontWeight: '500' },
  transacaoData: { fontSize: 12, color: '#64748b' },
  transacaoValor: { alignItems: 'flex-end' },
});
