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
  TextInput,
} from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Pagamento {
  id: string;
  fornecedor: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'pago' | 'pendente' | 'atrasado';
  dataPagamento?: string;
}

const pagamentosIniciais: Pagamento[] = [
  {
    id: 'PAG-001',
    fornecedor: 'Distribuidora Ultragaz',
    descricao: 'Recarga de cilindros P13',
    valor: 4500,
    vencimento: '25/11/2025',
    status: 'pendente',
  },
  {
    id: 'PAG-002',
    fornecedor: 'Auto Peças Rápidas',
    descricao: 'Manutenção de veículo',
    valor: 850,
    vencimento: '22/11/2025',
    status: 'pago',
    dataPagamento: '20/11/2025',
  },
  {
    id: 'PAG-003',
    fornecedor: 'Posto Shell Centro',
    descricao: 'Combustível - Novembro',
    valor: 1200,
    vencimento: '18/11/2025',
    status: 'atrasado',
  },
];

export default function FornecedoresScreen() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>(pagamentosIniciais);
  const [busca, setBusca] = useState('');

  const filtrados = pagamentos.filter(
    (p) =>
      p.fornecedor.toLowerCase().includes(busca.toLowerCase()) ||
      p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      p.id.toLowerCase().includes(busca.toLowerCase())
  );

  const totalPago = pagamentos.filter(p => p.status === 'pago').reduce((a, b) => a + b.valor, 0);
  const totalPendente = pagamentos.filter(p => p.status === 'pendente').reduce((a, b) => a + b.valor, 0);
  const totalAtrasado = pagamentos.filter(p => p.status === 'atrasado').reduce((a, b) => a + b.valor, 0);

  const marcarPago = (id: string) => {
    setPagamentos(
      pagamentos.map(p =>
        p.id === id
          ? { ...p, status: 'pago', dataPagamento: new Date().toLocaleDateString('pt-BR') }
          : p
      )
    );
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll}>
          <View style={styles.header}>
            <View>
              <Text style={styles.titulo}>Fornecedores</Text>
              <Text style={styles.subtitulo}>Pagamentos e contas</Text>
            </View>
            <Button mode="outlined" icon="plus">
              Novo
            </Button>
          </View>

          <View style={styles.resumo}>
            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.label}>Pagos</Text>
                <Text style={[styles.valor, { color: '#059669' }]}>
                  R$ {(totalPago / 1000).toFixed(1)}k
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.label}>Pendentes</Text>
                <Text style={[styles.valor, { color: '#ca8a04' }]}>
                  R$ {(totalPendente / 1000).toFixed(1)}k
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.cardResumo}>
              <Card.Content>
                <Text style={styles.label}>Atrasados</Text>
                <Text style={[styles.valor, { color: '#dc2626' }]}>
                  R$ {(totalAtrasado / 1000).toFixed(1)}k
                </Text>
              </Card.Content>
            </Card>
          </View>

          <TextInput
            mode="outlined"
            placeholder="Buscar pagamento"
            value={busca}
            onChangeText={setBusca}
            style={styles.input}
            left={<TextInput.Icon icon="magnify" />}
          />

          {filtrados.map(p => (
            <Card key={p.id} style={styles.card}>
              <Card.Content>
                <View style={styles.linhaTopo}>
                  <View>
                    <Text style={styles.fornecedor}>{p.fornecedor}</Text>
                    <Text style={styles.id}>{p.id}</Text>
                  </View>
                  <Badge
                    style={[
                      styles.badge,
                      p.status === 'pago'
                        ? styles.pago
                        : p.status === 'pendente'
                        ? styles.pendente
                        : styles.atrasado,
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
                      R$ {p.valor.toLocaleString()}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.small}>
                      {p.status === 'pago' ? 'Pago em' : 'Vencimento'}
                    </Text>
                    <Text style={styles.data}>
                      {p.status === 'pago' && p.dataPagamento
                        ? p.dataPagamento
                        : p.vencimento}
                    </Text>
                  </View>
                </View>

                {p.status !== 'pago' && (
                  <Button
                    mode="outlined"
                    onPress={() => marcarPago(p.id)}
                  >
                    Marcar como pago
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))}

          {totalAtrasado > 0 && (
            <Card style={styles.alerta}>
              <Card.Content>
                <View style={styles.alertaLinha}>
                  <Ionicons name="alert-circle" size={24} color="#dc2626" />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.alertaTitulo}>Pagamentos atrasados</Text>
                    <Text style={styles.alertaTexto}>
                      Total em atraso: R$ {totalAtrasado.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </Provider>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
   flex: 1, backgroundColor: '#f8fafc' },
  scroll: {
   padding: 16 },
  header: {
   flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  titulo: {
   fontSize: 28, fontWeight: '700', color: '#1e293b' },
  subtitulo: {
   fontSize: 14, color: '#64748b' },
  resumo: {
   flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  cardResumo: {
   width: (width - 48) / 2, marginBottom: 12 },
  label: {
   fontSize: 12, color: '#64748b' },
  valor: {
   fontSize: 20, fontWeight: '700' },
  input: {
   marginBottom: 16 },
  card: {
   marginBottom: 16 },
  linhaTopo: {
   flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  fornecedor: {
   fontSize: 16, fontWeight: '600' },
  id: {
   fontSize: 12, color: '#64748b' },
  descricao: {
   fontSize: 14, color: '#475569', marginBottom: 12 },
  linhaInfo: {
   flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  small: {
   fontSize: 12, color: '#64748b' },
  valorItem: {
   fontSize: 16, fontWeight: '600' },
  data: {
   fontSize: 14 },
  badge: {
   alignSelf: 'flex-start' },
  pago: {
   backgroundColor: '#dcfce7' },
  pendente: {
   backgroundColor: '#fef9c3' },
  atrasado: {
   backgroundColor: '#fee2e2' },
  alerta: {
   backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  alertaLinha: {
   flexDirection: 'row', alignItems: 'center' },
  alertaTitulo: {
   fontSize: 14, fontWeight: '600', color: '#991b1b' },
  alertaTexto: {
   fontSize: 12, color: '#7f1d1d' },
});
