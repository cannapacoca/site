import { supabase } from '../lib/supabase';

const toSnakeCase = (mat) => {
  const result = {};
  if (mat.id !== undefined) result.id = mat.id;
  if (mat.nome !== undefined) result.nome = mat.nome;
  if (mat.tipo !== undefined) result.tipo = mat.tipo;
  if (mat.unidade !== undefined) result.unidade = mat.unidade;
  if (mat.pesoCompra !== undefined) result.peso_compra = mat.pesoCompra;
  if (mat.unidadesPacote !== undefined) result.unidades_pacote = mat.unidadesPacote;
  if (mat.precoCompra !== undefined) result.preco_compra = mat.precoCompra;
  return result;
};

const toCamelCase = (dbMat) => ({
  id: dbMat.id,
  nome: dbMat.nome,
  tipo: dbMat.tipo, 
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

    console.log('📦 [DEBUG getAll] Dados crus vindos do Supabase:', data);

    const mapeados = data.map(toCamelCase);
    console.log('✨ [DEBUG getAll] Dados mapeados pós toCamelCase:', mapeados);

    return mapeados;
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
    const dadosConvertidos = toSnakeCase(updates);
    console.log('📤 [DEBUG Service] Objeto convertido em snake_case:', dadosConvertidos);

    const { data, error } = await supabase
      .from('materiais')
      .update(dadosConvertidos)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ [DEBUG Service] Erro retornado pelo Supabase:', error);
      throw error;
    }

    console.log('📥 [DEBUG Service] Dados salvos no banco:', data);
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