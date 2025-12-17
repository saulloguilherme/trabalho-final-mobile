import { supabase } from "../api/supabase"

export interface ProdutoEstoque {
  id: string
  nome: string
  tipo: string
  quantidade_cheios: number
  quantidade_vazios: number
  quantidade_minima: number
  capacidade_maxima: number
  atualizado_em: string
}

export interface EstoqueMetrics {
  totalCheios: number
  totalVazios: number
  alertas: number
  capacidadePercent: number
}

export async function getEstoque(): Promise<ProdutoEstoque[]> {
  const { data, error } = await supabase
    .from('estoque')
    .select('*')
    .order('nome')

  if (error) throw error
  return data || []
}

export async function getEstoqueMetrics(): Promise<EstoqueMetrics> {
  const estoque = await getEstoque()
  
  const totalCheios = estoque.reduce((acc, item) => acc + item.quantidade_cheios, 0)
  const totalVazios = estoque.reduce((acc, item) => acc + item.quantidade_vazios, 0)
  const alertas = estoque.filter(item => item.quantidade_cheios < item.quantidade_minima).length
  
  const capacidadeTotal = estoque.reduce((acc, item) => acc + item.capacidade_maxima, 0)
  const capacidadePercent = capacidadeTotal > 0 ? (totalCheios / capacidadeTotal) * 100 : 0

  return {
    totalCheios,
    totalVazios,
    alertas,
    capacidadePercent: parseFloat(capacidadePercent.toFixed(1))
  }
}

export async function updateEstoqueQuantidade(
  id: string, 
  tipo: 'entrada' | 'saida', 
  quantidade: number
): Promise<void> {
  const { data: produto, error: fetchError } = await supabase
    .from('estoque')
    .select('quantidade_cheios')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError
  if (!produto) throw new Error('Produto não encontrado')

  const novaQuantidade = tipo === 'entrada' 
    ? produto.quantidade_cheios + quantidade
    : Math.max(0, produto.quantidade_cheios - quantidade)

  const { error: updateError } = await supabase
    .from('estoque')
    .update({ 
      quantidade_cheios: novaQuantidade,
      atualizado_em: new Date().toISOString()
    })
    .eq('id', id)

  if (updateError) throw updateError
}