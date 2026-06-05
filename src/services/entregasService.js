import { supabase } from '../lib/supabase';

const toSnakeCase = (entrega) => ({
  id: entrega.id,
  cliente_id: entrega.clienteId,
  cliente_nome: entrega.clienteNome,
  data: entrega.data,
  rota_id: entrega.rotaId,
  tipo: entrega.tipo,
});

const toCamelCase = (dbEnt) => ({
  id: dbEnt.id,
  clienteId: dbEnt.cliente_id,
  clienteNome: dbEnt.cliente_nome,
  data: dbEnt.data,
  rotaId: dbEnt.rota_id,
  tipo: dbEnt.tipo,
});

export const entregasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('entregas_clientes')
      .select('*')
      .order('data', { ascending: false });
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async getByClienteId(clienteId) {
    const { data, error } = await supabase
      .from('entregas_clientes')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('data', { ascending: false });
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async create(entrega) {
    const { data, error } = await supabase
      .from('entregas_clientes')
      .insert([toSnakeCase(entrega)])
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async delete(id) {
    const { error } = await supabase
      .from('entregas_clientes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};