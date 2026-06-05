import { supabase } from '../lib/supabase';

const toSnakeCase = (compra) => ({
  id: compra.id,
  material_id: compra.materialId,
  nome_material: compra.nomeMaterial,
  quantidade: compra.quantidade,
  preco_total: compra.precoTotal,
  preco_unitario: compra.precoUnitario,
  data: compra.data,
  caminho_nota: compra.caminhoNota,
});

const toCamelCase = (dbCompra) => ({
  id: dbCompra.id,
  materialId: dbCompra.material_id,
  nomeMaterial: dbCompra.nome_material,
  quantidade: dbCompra.quantidade,
  precoTotal: dbCompra.preco_total,
  precoUnitario: dbCompra.preco_unitario,
  data: dbCompra.data,
  caminhoNota: dbCompra.caminho_nota,
});

export const comprasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('historico_compras')
      .select('*')
      .order('data', { ascending: false });
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async getByMaterialId(materialId) {
    const { data, error } = await supabase
      .from('historico_compras')
      .select('*')
      .eq('material_id', materialId)
      .order('data', { ascending: false });
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async create(compra) {
    const { data, error } = await supabase
      .from('historico_compras')
      .insert([toSnakeCase(compra)])
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('historico_compras')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async delete(id) {
    const { error } = await supabase
      .from('historico_compras')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};