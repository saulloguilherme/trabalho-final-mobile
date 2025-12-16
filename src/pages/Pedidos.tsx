import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Card, Button, Badge, Modal, Portal, Provider, SegmentedButtons } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

// 1. Definição de Tipos (TypeScript)
type StatusPedido = 'pendente' | 'em_rota' | 'entregue' | 'cancelado';

interface Pedido {
  id: string;
  cliente: string;
  produto: string;
  quantidade: number;
  valor: number;
  status: StatusPedido;
  data: string;
  endereco: string;
}

// 2. Dados Mockados Iniciais
const pedidosIniciais: Pedido[] = [
  {
    id: 'PED-001',
    cliente: 'João Silva',
    produto: 'P13 (13kg)',
    quantidade: 2,
    valor: 180,
    status: 'pendente',
    data: '21/11/2025',
    endereco: 'Rua das Flores, 123 - Centro',
  },
  {
    id: 'PED-002',
    cliente: 'Maria Santos',
    produto: 'P20 (20kg)',
    quantidade: 1,
    valor: 150,
    status: 'em_rota',
    data: '21/11/2025',
    endereco: 'Av. Central, 456 - Jardins',
  },
  {
    id: 'PED-003',
    cliente: 'Pedro Oliveira',
    produto: 'P13 (13kg)',
    quantidade: 1,
    valor: 90,
    status: 'entregue',
    data: '20/11/2025',
    endereco: 'Rua do Comércio, 789',
  },
  {
    id: 'PED-004',
    cliente: 'Ana Costa',
    produto: 'P45 (45kg)',
    quantidade: 1,
    valor: 220,
    status: 'pendente',
    data: '21/11/2025',
    endereco: 'Praça da Paz, 321',
  },
  {
    id: 'PED-005',
    cliente: 'Carlos Mendes',
    produto: 'P20 (20kg)',
    quantidade: 3,
    valor: 420,
    status: 'entregue',
    data: '19/11/2025',
    endereco: 'Rua das Acácias, 99',
  },
];

// 3. Configuração de Status (Cores e Ícones)
const statusConfig: Record<StatusPedido, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  pendente: { label: 'Pendente', color: '#fef3c7', icon: 'time' },
  em_rota: { label: 'Em Rota', color: '#dbeafe', icon: 'car' },
  entregue: { label: 'Entregue', color: '#d1fae5', icon: 'checkmark-circle' },
  cancelado: { label: 'Cancelado', color: '#fee2e2', icon: 'close-circle' },
};

export default function PedidosScreen() {
  // 4. Estados Principais
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosIniciais);
  const [busca, setBusca] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [novoPedido, setNovoPedido] = useState({
    cliente: '',
    produto: 'P13 (13kg)',
    quantidade: 1,
    valor: 0,
    endereco: '',
  });

  // 5. Filtragem e Busca
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const buscaMatch =
      pedido.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      pedido.id.toLowerCase().includes(busca.toLowerCase()) ||
      pedido.produto.toLowerCase().includes(busca.toLowerCase());
    
    const statusMatch = filtroStatus === 'todos' || pedido.status === filtroStatus;
    
    return buscaMatch && statusMatch;
  });

  // 6. Estatísticas
  const estatisticas = {
    total: pedidos.length,
    pendentes: pedidos.filter((p) => p.status === 'pendente').length,
    emRota: pedidos.filter((p) => p.status === 'em_rota').length,
    entregues: pedidos.filter((p) => p.status === 'entregue').length,
  };

  // 7. Handler para Criar Pedido
  const handleCriarPedido = () => {
    const valorCalculado = novoPedido.produto === 'P13 (13kg)' ? 90 * novoPedido.quantidade :
                          novoPedido.produto === 'P20 (20kg)' ? 150 * novoPedido.quantidade :
                          220 * novoPedido.quantidade;

    const pedido: Pedido = {
      id: `PED-${String(pedidos.length + 1).padStart(3, '0')}`,
      cliente: novoPedido.cliente,
      produto: novoPedido.produto,
      quantidade: novoPedido.quantidade,
      valor: valorCalculado,
      status: 'pendente',
      data: new Date().toLocaleDateString('pt-BR'),
      endereco: novoPedido.endereco,
    };

    setPedidos([pedido, ...pedidos]);
    setModalVisivel(false);
    setNovoPedido({ cliente: '', produto: 'P13 (13kg)', quantidade: 1, valor: 0, endereco: '' });
  };

  // 8. Renderização de Cada Card de Pedido
  const renderItemPedido = ({ item }: { item: Pedido }) => (
    <Card style={styles.cardPedido} mode="elevated">
      <Card.Content>
        {/* Cabeçalho do Card: ID, Cliente e Status */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.pedidoId}>{item.id}</Text>
            <Text style={styles.pedidoCliente}>{item.cliente}</Text>
          </View>
        </View>

        {/* Detalhes do Produto */}
        <View style={styles.detalheLinha}>
          <Ionicons name="cube" size={16} color="#666" />
          <Text style={styles.detalheTexto}>
            {item.produto} × {item.quantidade}
          </Text>
          <Text style={styles.valorText}>R$ {item.valor.toFixed(2)}</Text>
        </View>

        {/* Endereço */}
        <View style={styles.detalheLinha}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={[styles.detalheTexto, styles.enderecoText]} numberOfLines={1}>
            {item.endereco}
          </Text>
        </View>

        {/* Data */}
        <View style={styles.detalheLinha}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.detalheTexto}>{item.data}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  // 9. Interface Principal
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View>
              <Text style={styles.titulo}>Pedidos</Text>
              <Text style={styles.subtitulo}>Gerenciamento de pedidos</Text>
            </View>
            <Button 
              mode="contained" 
              onPress={() => setModalVisivel(true)}
              style={styles.botaoNovo}
              icon={() => <Ionicons name="add" size={20} color="#fff" />}
            >
              Novo
            </Button>
          </View>

          {/* Barra de Busca */}
          <View style={styles.buscaContainer}>
            <Ionicons name="search" size={20} color="#94a3b8" style={styles.iconeBusca} />
            <TextInput
              style={styles.inputBusca}
              placeholder="Buscar pedido por ID, cliente ou produto..."
              value={busca}
              onChangeText={setBusca}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Filtro de Status */}
          <SegmentedButtons
            value={filtroStatus}
            onValueChange={setFiltroStatus}
            buttons={[
              { value: 'todos', label: 'Todos', icon: 'grid' },
              { value: 'pendente', label: 'Pendente', icon: 'time' },
              { value: 'em_rota', label: 'Em Rota', icon: 'car' },
              { value: 'entregue', label: 'Entregues', icon: 'checkmark' },
            ].map(btn => ({
              ...btn,
              icon: btn.icon as keyof typeof Ionicons.glyphMap
            }))}
            style={styles.segmentedButtons}
          />

          {/* Cards de Estatísticas */}
          <View style={styles.estatisticasContainer}>
            <Card style={styles.cardEstatistica}>
              <Card.Content>
                <Text style={styles.estatisticaTitulo}>Total</Text>
                <Text style={styles.estatisticaValor}>{estatisticas.total}</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.cardEstatistica}>
              <Card.Content>
                <Text style={styles.estatisticaTitulo}>Pendentes</Text>
                <Text style={[styles.estatisticaValor, { color: '#d97706' }]}>{estatisticas.pendentes}</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.cardEstatistica}>
              <Card.Content>
                <Text style={styles.estatisticaTitulo}>Em Rota</Text>
                <Text style={[styles.estatisticaValor, { color: '#2563eb' }]}>{estatisticas.emRota}</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.cardEstatistica}>
              <Card.Content>
                <Text style={styles.estatisticaTitulo}>Entregues</Text>
                <Text style={[styles.estatisticaValor, { color: '#059669' }]}>{estatisticas.entregues}</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Lista de Pedidos */}
          <View style={styles.listaContainer}>
            <Text style={styles.listaTitulo}>Pedidos Recentes ({pedidosFiltrados.length})</Text>
            <FlatList
              data={pedidosFiltrados}
              renderItem={renderItemPedido}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separador} />}
            />
          </View>
        </ScrollView>

        {/* Modal para Criar Novo Pedido */}
        <Portal>
          <Modal
            visible={modalVisivel}
            onDismiss={() => setModalVisivel(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalTitulo}>Criar Novo Pedido</Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Nome do cliente"
                value={novoPedido.cliente}
                onChangeText={(text) => setNovoPedido({ ...novoPedido, cliente: text })}
              />
              
              <View style={styles.modalSelectContainer}>
                <Text style={styles.modalLabel}>Produto</Text>
                <SegmentedButtons
                  value={novoPedido.produto}
                  onValueChange={(value) => setNovoPedido({ ...novoPedido, produto: value })}
                  buttons={[
                    { value: 'P13 (13kg)', label: 'P13', icon: 'cube' },
                    { value: 'P20 (20kg)', label: 'P20', icon: 'cube' },
                    { value: 'P45 (45kg)', label: 'P45', icon: 'cube' },
                  ].map(btn => ({
                    ...btn,
                    icon: btn.icon as keyof typeof Ionicons.glyphMap
                  }))}
                />
              </View>
              
              <View style={styles.modalRow}>
                <View style={styles.modalCol}>
                  <Text style={styles.modalLabel}>Quantidade</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Qtd"
                    keyboardType="numeric"
                    value={novoPedido.quantidade.toString()}
                    onChangeText={(text) => setNovoPedido({ ...novoPedido, quantidade: parseInt(text) || 1 })}
                  />
                </View>
                
                <View style={styles.modalCol}>
                  <Text style={styles.modalLabel}>Valor Estimado</Text>
                  <Text style={styles.valorEstimado}>
                    R$ {(
                      novoPedido.produto === 'P13 (13kg)' ? 90 * novoPedido.quantidade :
                      novoPedido.produto === 'P20 (20kg)' ? 150 * novoPedido.quantidade :
                      220 * novoPedido.quantidade
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>
              
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Endereço completo de entrega"
                value={novoPedido.endereco}
                onChangeText={(text) => setNovoPedido({ ...novoPedido, endereco: text })}
                multiline
                numberOfLines={3}
              />
              
              <View style={styles.modalBotoes}>
                <Button mode="outlined" onPress={() => setModalVisivel(false)} style={styles.botaoCancelar}>
                  Cancelar
                </Button>
                <Button mode="contained" onPress={handleCriarPedido} style={styles.botaoConfirmar}>
                  Criar Pedido
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>
      </SafeAreaView>
    </Provider>
  );
}

// 10. Estilos
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1, padding: 16 },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 20 
  },
  titulo: { fontSize: 28, fontWeight: '700', color: '#1e293b' },
  subtitulo: { fontSize: 14, color: '#64748b', marginTop: 4 },
  botaoNovo: { borderRadius: 8 },
  
  // Busca
  buscaContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  iconeBusca: { marginRight: 8 },
  inputBusca: { 
    flex: 1, 
    height: 48, 
    fontSize: 16, 
    color: '#334155' 
  },
  
  // Filtros
  segmentedButtons: { marginBottom: 20 },
  
  // Estatísticas
  estatisticasContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: 24 
  },
  cardEstatistica: { 
    width: (width - 40) / 2, 
    marginBottom: 12, 
    backgroundColor: '#fff' 
  },
  estatisticaTitulo: { 
    fontSize: 12, 
    color: '#64748b', 
    fontWeight: '500', 
    marginBottom: 4 
  },
  estatisticaValor: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1e293b' 
  },
  
  // Lista de Pedidos
  listaContainer: { marginBottom: 40 },
  listaTitulo: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1e293b', 
    marginBottom: 16 
  },
  cardPedido: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 0 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 16 
  },
  pedidoId: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  pedidoCliente: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  badgeStatus: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  detalheLinha: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  detalheTexto: { 
    fontSize: 14, 
    color: '#475569', 
    marginLeft: 8, 
    flex: 1 
  },
  enderecoText: { color: '#64748b' },
  valorText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1e293b' 
  },
  separador: { height: 12 },
  
  // Modal
  modalContainer: { 
    backgroundColor: 'white', 
    margin: 20, 
    borderRadius: 16, 
    maxHeight: '80%' 
  },
  modalScroll: { padding: 24 },
  modalTitulo: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 20 
  },
  modalInput: { 
    backgroundColor: '#f8fafc', 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16, 
    color: '#334155', 
    marginBottom: 16 
  },
  textArea: { 
    minHeight: 80, 
    textAlignVertical: 'top' 
  },
  modalSelectContainer: { marginBottom: 16 },
  modalLabel: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#475569', 
    marginBottom: 8 
  },
  modalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  modalCol: { width: '48%' },
  valorEstimado: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#059669', 
    padding: 12, 
    backgroundColor: '#f0fdf4', 
    borderRadius: 8, 
    textAlign: 'center' 
  },
  modalBotoes: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 8 
  },
  botaoCancelar: { flex: 1, marginRight: 8 },
  botaoConfirmar: { flex: 1, marginLeft: 8 },
});