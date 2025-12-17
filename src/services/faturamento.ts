import { supabase } from "../api/supabase"

export interface FaturamentoDiario {
  dia: string
  diaSemana: string
  receita: number
  despesas: number
}

export interface VendaPorProduto {
  nome: string
  valor: number
}

export interface Movimentacao {
  id: string
  tipo: string
  descricao: string
  valor: number
  data: string
  status: string
  origem: 'transacao' | 'pedido'
}

export interface FaturamentoResumo {
  receitaHoje: number
  despesasHoje: number
  receitaSemana: number
  despesasSemana: number
  variacaoHoje: number
}

function hojeStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function ontemStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function inicioSemanaStr() {
  const d = new Date()
  const day = d.getDay() === 0 ? 7 : d.getDay()
  d.setDate(d.getDate() - day + 1)
  return d.toISOString().slice(0, 10)
}

export async function getFaturamentoResumo(): Promise<FaturamentoResumo> {
  const hoje = hojeStr()
  const ontem = ontemStr()
  const inicioSemana = inicioSemanaStr()

  const { data: transacoesHoje } = await supabase
    .from('transacoes')
    .select('tipo, valor')
    .eq('data_transacao', hoje)

  const { data: transacoesOntem } = await supabase
    .from('transacoes')
    .select('tipo, valor')
    .eq('data_transacao', ontem)

  const { data: pedidosHoje } = await supabase
    .from('pedidos')
    .select('valor_total')
    .eq('status', 'entregue')
    .gte('criado_em', `${hoje}T00:00:00`)
    .lte('criado_em', `${hoje}T23:59:59`)

  const { data: pedidosOntem } = await supabase
    .from('pedidos')
    .select('valor_total')
    .eq('status', 'entregue')
    .gte('criado_em', `${ontem}T00:00:00`)
    .lte('criado_em', `${ontem}T23:59:59`)

  const receitaHoje =
    (transacoesHoje || []).filter(t => t.tipo === 'receita').reduce((a, b) => a + b.valor, 0) +
    (pedidosHoje || []).reduce((a, b) => a + (b.valor_total || 0), 0)

  const despesasHoje =
    (transacoesHoje || []).filter(t => t.tipo === 'despesa').reduce((a, b) => a + b.valor, 0)

  const receitaOntem =
    (transacoesOntem || []).filter(t => t.tipo === 'receita').reduce((a, b) => a + b.valor, 0) +
    (pedidosOntem || []).reduce((a, b) => a + (b.valor_total || 0), 0)

  const variacaoHoje = receitaOntem > 0 ? ((receitaHoje - receitaOntem) / receitaOntem) * 100 : 0

  const { data: transacoesSemana } = await supabase
    .from('transacoes')
    .select('tipo, valor')
    .gte('data_transacao', inicioSemana)

  const { data: pedidosSemana } = await supabase
    .from('pedidos')
    .select('valor_total')
    .eq('status', 'entregue')
    .gte('criado_em', `${inicioSemana}T00:00:00`)

  const receitaSemana =
    (transacoesSemana || []).filter(t => t.tipo === 'receita').reduce((a, b) => a + b.valor, 0) +
    (pedidosSemana || []).reduce((a, b) => a + (b.valor_total || 0), 0)

  const despesasSemana =
    (transacoesSemana || []).filter(t => t.tipo === 'despesa').reduce((a, b) => a + b.valor, 0)

  return {
    receitaHoje,
    despesasHoje,
    receitaSemana,
    despesasSemana,
    variacaoHoje: parseFloat(variacaoHoje.toFixed(1))
  }
}

export async function getFaturamentoSemanal(): Promise<FaturamentoDiario[]> {
  const inicioSemana = inicioSemanaStr()
  const hoje = hojeStr()
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const { data: transacoes } = await supabase
    .from('transacoes')
    .select('tipo, valor, data_transacao')
    .gte('data_transacao', inicioSemana)
    .lte('data_transacao', hoje)

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('valor_total, criado_em')
    .eq('status', 'entregue')
    .gte('criado_em', `${inicioSemana}T00:00:00`)
    .lte('criado_em', `${hoje}T23:59:59`)

  const mapa = new Map<string, FaturamentoDiario>()

  for (let i = 0; i < 7; i++) {
    const d = new Date(inicioSemana)
    d.setDate(d.getDate() + i)
    const ds = d.toISOString().slice(0, 10)

    mapa.set(ds, {
      dia: ds.split('-')[2],
      diaSemana: diasSemana[d.getDay()],
      receita: 0,
      despesas: 0
    })
  }

  for (const t of transacoes || []) {
    const item = mapa.get(t.data_transacao)
    if (!item) continue
    if (t.tipo === 'receita') item.receita += t.valor
    else item.despesas += t.valor
  }

  for (const p of pedidos || []) {
    const ds = p.criado_em.slice(0, 10)
    const item = mapa.get(ds)
    if (!item) continue
    item.receita += p.valor_total || 0
  }

  return Array.from(mapa.values())
}

export async function getVendasPorProduto(): Promise<VendaPorProduto[]> {
  const inicioSemana = inicioSemanaStr()

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('produto_id, valor_total')
    .eq('status', 'entregue')
    .gte('criado_em', `${inicioSemana}T00:00:00`)

  const mapa = new Map<string, number>()

  for (const p of pedidos || []) {
    if (!p.produto_id) continue
    mapa.set(p.produto_id, (mapa.get(p.produto_id) || 0) + (p.valor_total || 0))
  }

  const resultado: VendaPorProduto[] = []

  for (const [id, valor] of mapa) {
    const { data: produto } = await supabase
      .from('estoque')
      .select('nome')
      .eq('id', id)
      .single()

    resultado.push({
      nome: produto?.nome || 'Produto',
      valor
    })
  }

  return resultado.sort((a, b) => b.valor - a.valor)
}

export async function getMovimentacoesRecentes(): Promise<Movimentacao[]> {
  const movimentacoes: Movimentacao[] = []

  const { data: transacoes } = await supabase
    .from('transacoes')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(10)

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*')
    .eq('status', 'entregue')
    .order('criado_em', { ascending: false })
    .limit(10)

  for (const t of transacoes || []) {
    movimentacoes.push({
      id: t.id,
      tipo: t.tipo,
      descricao: t.descricao,
      valor: t.valor,
      data: t.data_transacao,
      status: t.status,
      origem: 'transacao'
    })
  }

  for (const p of pedidos || []) {
    let produtoNome = 'Produto'

    if (p.produto_id) {
      const { data: produto } = await supabase
        .from('estoque')
        .select('nome')
        .eq('id', p.produto_id)
        .single()

      produtoNome = produto?.nome || produtoNome
    }

    movimentacoes.push({
      id: p.id,
      tipo: 'receita',
      descricao: `Pedido - ${p.cliente_nome} (${produtoNome})`,
      valor: p.valor_total || 0,
      data: p.criado_em,
      status: 'entregue',
      origem: 'pedido'
    })
  }

  return movimentacoes
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 10)
}
