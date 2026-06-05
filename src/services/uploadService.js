import { supabase } from '../lib/supabase';

export const uploadService = {
  /**
   * Faz upload de um arquivo para o bucket 'notas-fiscais'
   * @param {File} file - arquivo a ser enviado
   * @param {string} path - caminho dentro do bucket (ex: 'compras/compra_123.pdf')
   * @returns {Promise<string>} - URL pública do arquivo
   */
  async uploadNotaFiscal(file, path) {
    const { data, error } = await supabase.storage
      .from('notas-fiscais')
      .upload(path, file);

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('notas-fiscais')
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  },

  /**
   * Deleta um arquivo do bucket
   * @param {string} path - caminho do arquivo
   */
  async deleteNotaFiscal(path) {
    const { error } = await supabase.storage
      .from('notas-fiscais')
      .remove([path]);
    if (error) throw error;
  },

  /**
   * Gera URL assinada temporária (útil se o bucket for privado)
   * @param {string} path - caminho do arquivo
   * @param {number} expiresIn - segundos (padrão 60)
   * @returns {Promise<string>}
   */
  async getSignedUrl(path, expiresIn = 60) {
    const { data, error } = await supabase.storage
      .from('notas-fiscais')
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },
};