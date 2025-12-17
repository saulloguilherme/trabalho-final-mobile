import { supabase } from "../api/supabase"

export interface Entrega {
  id: string
  cliente_nome: string
  cliente_endereco: string
  status: string
  produto_id: string
  quantidade: number
  valor_total: number
  horario_previsto: string
  horario_realizado: string
  criado_em: string
  produto_nome?: string
}

export interface EntregasMetrics {
  total: number
  pendentes: number
  em_rota: number
  concluidas: number
}

export async function getEntregasMetrics(): Promise<EntregasMetrics> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('status')

  if (error) throw error

  const total = data?.length || 0
  const pendentes = data?.filter(p => p.status === 'pendente').length || 0
  const em_rota = data?.filter(p => p.status === 'em_rota').length || 0
  const concluidas = data?.filter(p => p.status === 'entregue').length || 0

  return { total, pendentes, em_rota, concluidas }
}

export async function getEntregasList(filtro?: string): Promise<Entrega[]> {
  let query = supabase
    .from('pedidos')
    .select('*')

  if (filtro && filtro !== 'todos') {
    query = query.eq('status', filtro)
  }

  query = query.order('criado_em', { ascending: false })

  const { data, error } = await query

  if (error) throw error

  if (!data) return []

  const entregasComProduto = await Promise.all(
    data.map(async (pedido) => {
      let produto_nome = 'Produto não encontrado'
      
      if (pedido.produto_id) {
        const { data: produto } = await supabase
          .from('estoque')
          .select('nome')
          .eq('id', pedido.produto_id)
          .single()
        
        produto_nome = produto?.nome || produto_nome
      }

      return {
        ...pedido,
        produto_nome
      }
    })
  )

  return entregasComProduto
}