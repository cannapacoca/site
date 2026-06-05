import { supabase } from '../lib/supabase';

const toSnakeCase = (rota) => ({
  id: rota.id,
  nome: rota.nome,
  data_criacao: rota.dataCriacao,
  frequencia: rota.frequencia,
  distancia_km: rota.distanciaKm,
  consumo_km_l: rota.consumoKmL,
  clientes: rota.clientes, // JSONB
});

const toCamelCase = (dbRota) => ({
  id: dbRota.id,
  nome: dbRota.nome,
  dataCriacao: dbRota.data_criacao,
  frequencia: dbRota.frequencia,
  distanciaKm: dbRota.distancia_km,
  consumoKmL: dbRota.consumo_km_l,
  clientes: dbRota.clientes,
});

export const rotasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('rotas_salvas')
      .select('*')
      .order('id');
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('rotas_salvas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toCamelCase(data);
  },

  async create(rota) {
    const { data, error } = await supabase
      .from('rotas_salvas')
      .insert([toSnakeCase(rota)])
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('rotas_salvas')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async delete(id) {
    const { error } = await supabase
      .from('rotas_salvas')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};