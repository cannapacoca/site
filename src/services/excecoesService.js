import { supabase } from '../lib/supabase';

const toSnakeCase = (excecao) => ({
  id: excecao.id,
  cliente_id: excecao.clienteId,
  rota_destino_id: excecao.rotaDestinoId,
  rota_origem_id: excecao.rotaOrigemId,
  data_criacao: excecao.dataCriacao,
  entregue: excecao.entregue,
  data_entrega: excecao.dataEntrega,
});

const toCamelCase = (dbExc) => ({
  id: dbExc.id,
  clienteId: dbExc.cliente_id,
  rotaDestinoId: dbExc.rota_destino_id,
  rotaOrigemId: dbExc.rota_origem_id,
  dataCriacao: dbExc.data_criacao,
  entregue: dbExc.entregue,
  dataEntrega: dbExc.data_entrega,
});

export const excecoesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('excecoes_entrega')
      .select('*')
      .order('data_criacao', { ascending: false });
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async getByRotaDestino(rotaDestinoId) {
    const { data, error } = await supabase
      .from('excecoes_entrega')
      .select('*')
      .eq('rota_destino_id', rotaDestinoId)
      .eq('entregue', false);
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async create(excecao) {
    const { data, error } = await supabase
      .from('excecoes_entrega')
      .insert([toSnakeCase(excecao)])
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('excecoes_entrega')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async delete(id) {
    const { error } = await supabase
      .from('excecoes_entrega')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};