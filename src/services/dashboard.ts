import { supabase } from "../api/supabase"

export interface DashboardMetrics {
  pedidosHoje: number
  variacaoPedidos: number
  totalClientes: number
  novosClientes: number
  estoqueTotal: number
  alertasEstoque: number
  faturamentoHoje: number
  variacaoFaturamento: number
}

export interface ChartData {
  labels: string[]
  data: number[]
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const hoje = new Date()
  const ontem = new Date()
  ontem.setDate(hoje.getDate() - 1)

  const hojeStr = formatDate(hoje)
  const ontemStr = formatDate(ontem)

  // PEDIDOS HOJE
  const { count: pedidosHoje } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })
    .gte('criado_em', `${hojeStr}T00:00:00`)
    .lt('criado_em', `${hojeStr}T23:59:59`)

  // PEDIDOS ONTEM
  const { count: pedidosOntem } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })
    .gte('criado_em', `${ontemStr}T00:00:00`)
    .lt('criado_em', `${ontemStr}T23:59:59`)

  // ESTOQUE
  const { data: estoque } = await supabase.from('estoque').select('*')

  const estoqueTotal = estoque?.reduce((acc, i) => acc + i.quantidade_cheios, 0) || 0
  const alertasEstoque = estoque?.filter(i => i.quantidade_cheios < i.quantidade_minima).length || 0

  // CLIENTES (30 dias)
  const trintaDias = new Date()
  trintaDias.setDate(hoje.getDate() - 30)

  const { data: pedidos30 } = await supabase
    .from('pedidos')
    .select('cliente_nome')
    .gte('criado_em', trintaDias.toISOString())

  const clientesUnicos = [...new Set(pedidos30?.map(p => p.cliente_nome))]

  // NOVOS CLIENTES HOJE
  const { data: pedidosHojeDetalhes } = await supabase
    .from('pedidos')
    .select('cliente_nome')
    .gte('criado_em', `${hojeStr}T00:00:00`)
    .lt('criado_em', `${hojeStr}T23:59:59`)

  const novosClientes = new Set(pedidosHojeDetalhes?.map(p => p.cliente_nome)).size

  // FATURAMENTO HOJE
  const { data: faturamentoHojeData } = await supabase
    .from('transacoes')
    .select('valor')
    .eq('tipo', 'receita')
    .eq('status', 'pago')
    .gte('data_transacao', `${hojeStr}T00:00:00`)
    .lt('data_transacao', `${hojeStr}T23:59:59`)

  const faturamentoHoje = faturamentoHojeData?.reduce((a, b) => a + b.valor, 0) || 0

  // FATURAMENTO ONTEM
  const { data: faturamentoOntemData } = await supabase
    .from('transacoes')
    .select('valor')
    .eq('tipo', 'receita')
    .eq('status', 'pago')
    .gte('data_transacao', `${ontemStr}T00:00:00`)
    .lt('data_transacao', `${ontemStr}T23:59:59`)

  const faturamentoOntem = faturamentoOntemData?.reduce((a, b) => a + b.valor, 0) || 0

  const variacaoFaturamento =
    faturamentoOntem > 0
      ? ((faturamentoHoje - faturamentoOntem) / faturamentoOntem) * 100
      : 0

  return {
    pedidosHoje: pedidosHoje || 0,
    variacaoPedidos: (pedidosHoje || 0) - (pedidosOntem || 0),
    totalClientes: clientesUnicos.length,
    novosClientes,
    estoqueTotal,
    alertasEstoque,
    faturamentoHoje,
    variacaoFaturamento: Number(variacaoFaturamento.toFixed(1)),
  }
}

export async function getPedidosPorDia(): Promise<ChartData> {
  const hoje = new Date()
  const dias = 7
  const labels: string[] = []
  const data: number[] = []

  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(hoje.getDate() - i)
    const dateStr = formatDate(d)

    const { count } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .gte('criado_em', `${dateStr}T00:00:00`)
      .lt('criado_em', `${dateStr}T23:59:59`)

    labels.push(d.getDate().toString())
    data.push(count || 0)
  }

  return { labels, data }
}

export async function getFaturamentoPorDia(): Promise<ChartData> {
  const hoje = new Date()
  const dias = 7
  const labels: string[] = []
  const data: number[] = []

  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(hoje.getDate() - i)
    const dateStr = formatDate(d)

    const { data: transacoes } = await supabase
      .from('transacoes')
      .select('valor')
      .eq('tipo', 'receita')
      .eq('status', 'pago')
      .gte('data_transacao', `${dateStr}T00:00:00`)
      .lt('data_transacao', `${dateStr}T23:59:59`)

    labels.push(d.getDate().toString())
    data.push(transacoes?.reduce((a, b) => a + b.valor, 0) || 0)
  }

  return { labels, data }
}
