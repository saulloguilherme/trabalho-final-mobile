import { supabase } from "../api/supabase"

export interface Pagamento {
  id: string
  fornecedor_nome: string
  fornecedor_contato: string
  descricao: string
  valor: number
  vencimento: string
  status: 'pago' | 'pendente' | 'atrasado'
  data_pagamento: string | null
  criado_em: string
}

export interface PagamentosResumo {
  totalPago: number
  totalPendente: number
  totalAtrasado: number
}

/**
 * Busca pagamentos (opcionalmente filtrando por status)
 */
export async function getPagamentos(
  status?: 'pago' | 'pendente' | 'atrasado'
): Promise<Pagamento[]> {
  let query = supabase
    .from('pagamentos')
    .select('*')
    .order('vencimento', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Resumo SEM depender de filtro
 */
export async function getPagamentosResumo(): Promise<PagamentosResumo> {
  const { data, error } = await supabase
    .from('pagamentos')
    .select('valor, status')

  if (error) throw error
  if (!data) {
    return { totalPago: 0, totalPendente: 0, totalAtrasado: 0 }
  }

  return data.reduce(
    (acc, p) => {
      if (p.status === 'pago') acc.totalPago += Number(p.valor)
      if (p.status === 'pendente') acc.totalPendente += Number(p.valor)
      if (p.status === 'atrasado') acc.totalAtrasado += Number(p.valor)
      return acc
    },
    {
      totalPago: 0,
      totalPendente: 0,
      totalAtrasado: 0
    }
  )
}

export async function marcarPagamentoComoPago(id: string): Promise<void> {
  const hoje = new Date().toISOString().split('T')[0]

  const { data: pagamento, error } = await supabase
    .from('pagamentos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  const { error: updateError } = await supabase
    .from('pagamentos')
    .update({
      status: 'pago',
      data_pagamento: hoje
    })
    .eq('id', id)

  if (updateError) throw updateError

  const { error: transacaoError } = await supabase
    .from('transacoes')
    .insert([{
      tipo: 'despesa',
      descricao: `Pagamento: ${pagamento.descricao} - ${pagamento.fornecedor_nome}`,
      valor: pagamento.valor,
      categoria: 'fornecedor',
      data_transacao: hoje,
      status: 'pago'
    }])

  if (transacaoError) throw transacaoError
}

export async function criarPagamento(pagamento: {
  fornecedor_nome: string
  fornecedor_contato: string
  descricao: string
  valor: number
  vencimento: string
}): Promise<void> {
  const { error } = await supabase
    .from('pagamentos')
    .insert([{
      ...pagamento,
      status: 'pendente'
    }])

  if (error) throw error
}
