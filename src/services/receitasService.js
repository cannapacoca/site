import { supabase } from '../lib/supabase';

const toSnakeCase = (receita) => ({
  id: receita.id,
  nome: receita.nome,
  rendimento_kg: receita.rendimentoKg,
  embalagens: receita.embalagens || [], // Array de IDs ou objetos de embalagem
  rotulos: receita.rotulos || [],       // Array de IDs ou objetos de rótulo
  ingredientes: receita.ingredientes,   // Array de ingredientes
});

const toCamelCase = (dbRec) => ({
  id: dbRec.id,
  nome: dbRec.nome,
  rendimentoKg: dbRec.rendimento_kg,
  embalagens: dbRec.embalagens || [],
  rotulos: dbRec.rotulos || [],
  ingredientes: dbRec.ingredientes,
});

export const receitasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('receitas')
      .select('*')
      .order('id');
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('receitas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toCamelCase(data);
  },

  async create(receita) {
    const { data, error } = await supabase
      .from('receitas')
      .insert([toSnakeCase(receita)])
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('receitas')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async delete(id) {
    const { error } = await supabase
      .from('receitas')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};