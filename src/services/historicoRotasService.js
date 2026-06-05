import { supabase } from '../lib/supabase';

const toSnakeCase = (registro) => ({
  id: registro.id,
  rota_id: registro.rotaId,
  rota_nome: registro.rotaNome,
  data_execucao: registro.dataExecucao,
  data_conclusao: registro.dataConclusao,
  vendedor: registro.vendedor,
  valor_ganho: registro.valorGanho,
  preco_litro: registro.precoLitro,
  litros_consumidos: registro.litrosConsumidos,
  custo_combustivel: registro.custoCombustivel,
  lucro: registro.lucro,
});

const toCamelCase = (dbReg) => ({
  id: dbReg.id,
  rotaId: dbReg.rota_id,
  rotaNome: dbReg.rota_nome,
  dataExecucao: dbReg.data_execucao,
  dataConclusao: dbReg.data_conclusao,
  vendedor: dbReg.vendedor,
  valorGanho: dbReg.valor_ganho,
  precoLitro: dbReg.preco_litro,
  litrosConsumidos: dbReg.litros_consumidos,
  custoCombustivel: dbReg.custo_combustivel,
  lucro: dbReg.lucro,
});

export const historicoRotasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('historico_execucao_rotas')
      .select('*')
      .order('data_execucao', { ascending: false });
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async getByRotaId(rotaId) {
    const { data, error } = await supabase
      .from('historico_execucao_rotas')
      .select('*')
      .eq('rota_id', rotaId)
      .order('data_execucao', { ascending: false });
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async create(registro) {
    const { data, error } = await supabase
      .from('historico_execucao_rotas')
      .insert([toSnakeCase(registro)])
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('historico_execucao_rotas')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async delete(id) {
    const { error } = await supabase
      .from('historico_execucao_rotas')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};