import { supabase } from '../lib/supabase';

// Converte de camelCase (frontend) para snake_case (banco)
const toSnakeCase = (cliente) => ({
  razao_social: cliente.razaoSocial,
  nome_fantasia: cliente.nomeFantasia,
  cnpj: cliente.cnpj,
  ie: cliente.ie,
  endereco: cliente.endereco,
  numero: cliente.numero,
  bairro: cliente.bairro,
  cidade: cliente.cidade,
  uf: cliente.uf,
  cep: cliente.cep,
  telefone: cliente.telefone,
  email: cliente.email,
  ativo: cliente.ativo,
  emite_nota: cliente.emiteNota,
  emissao_bolet: cliente.emissaoBolet,
  a_vista: cliente.aVista,
  observacoes: cliente.observacoes,
});

// Converte de snake_case (banco) para camelCase (frontend)
const toCamelCase = (cliente) => ({
  id: cliente.id,
  razaoSocial: cliente.razao_social,
  nomeFantasia: cliente.nome_fantasia,
  cnpj: cliente.cnpj,
  ie: cliente.ie,
  endereco: cliente.endereco,
  numero: cliente.numero,
  bairro: cliente.bairro,
  cidade: cliente.cidade,
  uf: cliente.uf,
  cep: cliente.cep,
  telefone: cliente.telefone,
  email: cliente.email,
  ativo: cliente.ativo,
  emiteNota: cliente.emite_nota,
  emissaoBolet: cliente.emissao_bolet,
  aVista: cliente.a_vista,
  observacoes: cliente.observacoes,
  createdAt: cliente.created_at,
});

export const clientesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id');
    if (error) throw error;
    return data.map(toCamelCase);
  },

  async create(cliente) {
    const { data, error } = await supabase
      .from('clientes')
      .insert([toSnakeCase(cliente)])
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('clientes')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select();
    if (error) throw error;
    return toCamelCase(data[0]);
  },

  async delete(id) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};