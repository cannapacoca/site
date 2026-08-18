import { supabase } from '../lib/supabase';

const toSnakeCase = (prod) => ({
  id: prod.id,
  nome: prod.nome,
  peso_g: prod.pesoG,
  receita_id: prod.receitaId,
  venda: prod.venda,
  imposto: prod.imposto || 7.3,
});

const toCamelCase = (dbProd) => ({
  id: dbProd.id,
  nome: dbProd.nome,
  pesoG: dbProd.peso_g,
  receitaId: dbProd.receita_id,
  venda: dbProd.venda,
  imposto: dbProd.imposto,
  createdAt: dbProd.created_at,
});

export const produtosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('produtos_finais')
      .select('*')
      .order('id');
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('produtos_finais')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toCamelCase(data);
  },

  async create(produto) {
    const { data, error } = await supabase
      .from('produtos_finais')
      .insert([toSnakeCase(produto)])
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('produtos_finais')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async delete(id) {
    const { error } = await supabase
      .from('produtos_finais')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};