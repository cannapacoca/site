import { supabase } from '../lib/supabase';

const toSnakeCase = (mat) => ({
  id: mat.id,
  nome: mat.nome,
  unidade: mat.unidade,
  peso_compra: mat.pesoCompra,
  unidades_pacote: mat.unidadesPacote,
  preco_compra: mat.precoCompra,
});

const toCamelCase = (dbMat) => ({
  id: dbMat.id,
  nome: dbMat.nome,
  unidade: dbMat.unidade,
  pesoCompra: dbMat.peso_compra,
  unidadesPacote: dbMat.unidades_pacote,
  precoCompra: dbMat.preco_compra,
});

export const materiaisService = {
  async getAll() {
    const { data, error } = await supabase
      .from('materiais')
      .select('*')
      .order('id');
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('materiais')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toCamelCase(data);
  },

  async create(material) {
    const { data, error } = await supabase
      .from('materiais')
      .insert([toSnakeCase(material)])
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('materiais')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async delete(id) {
    const { error } = await supabase
      .from('materiais')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};