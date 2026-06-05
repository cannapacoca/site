import { supabase } from '../lib/supabase';

const toSnakeCase = (venda) => ({
  id: venda.id,
  cliente_id: venda.clienteId,
  nome_cliente: venda.nomeCliente,
  emite_nota: venda.emiteNota,
  forma_pagamento: venda.formaPagamento,
  data_recebimento: venda.dataRecebimento,
  data: venda.data,
  itens: venda.itens,
  total_venda: venda.totalVenda,
  custo_total_lote: venda.custoTotalLote,
  lucro_bruto_total: venda.lucroBrutoTotal,
});

const toCamelCase = (dbVenda) => ({
  id: dbVenda.id,
  clienteId: dbVenda.cliente_id,
  nomeCliente: dbVenda.nome_cliente,
  emiteNota: dbVenda.emite_nota,
  formaPagamento: dbVenda.forma_pagamento,
  dataRecebimento: dbVenda.data_recebimento,
  data: dbVenda.data,
  itens: dbVenda.itens,
  totalVenda: dbVenda.total_venda,
  custoTotalLote: dbVenda.custo_total_lote,
  lucroBrutoTotal: dbVenda.lucro_bruto_total,
});

export const vendasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('vendas_lancadas')
      .select('*')
      .order('data', { ascending: false });
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('vendas_lancadas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toCamelCase(data);
  },

  async create(venda) {
    const { data, error } = await supabase
      .from('vendas_lancadas')
      .insert([toSnakeCase(venda)])
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('vendas_lancadas')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async delete(id) {
    const { error } = await supabase
      .from('vendas_lancadas')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};