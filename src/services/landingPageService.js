import { supabase } from '../lib/supabase';

const DEFAULT_TEXTS = {
  headerTitle: "Paçocas Canaã",
  phone: "(12) 98156-0520",
  email: "canaa.ltda@outlook.com.br",
  purposeTitle: "Nosso Proposito",
  purposeText: "Manter viva a tradição da paçoca e os momentos em família",
  missionText: "Levar o sabor autêntico da paçoca artesanal com qualidade e carinho.",
  visionText: "Ser referência em produtos artesanais no Vale do Paraíba.",
  valuesText: "Qualidade, tradição, honestidade e respeito ao cliente",
  historyTitle: "Nossa História",
  historyText: "A Paçocas Canaã começou em uma pequena cozinha familiar há mais de 30 anos. O segredo da receita foi passado de avó para neta, e hoje levamos nosso produto para toda a região. Cada paçoca é feita à mão, com amendoim selecionado e um toque especial que só a tradição pode dar.",
  footerText: "© 2024 Paçocas Canáá - Todos os direitos reservados.",
  addressText: "Rua Frei Jerônimo de São Brás, 202 - Taubaté - SP",
  cnpjText: "CNPJ: 21.520.975/0001-10"
};

export const landingPageService = {
  async getTexts() {
    try {
      const { data, error } = await supabase
        .from('landing_page_config')
        .select('*');
      
      if (error) {
        console.warn('Erro ao carregar textos do Supabase, usando localStorage/Padrão:', error);
        return this.getLocalTexts();
      }

      if (!data || data.length === 0) {
        // Inicializar com os padrões no Supabase se possível
        await this.saveAllTexts(DEFAULT_TEXTS);
        return DEFAULT_TEXTS;
      }

      const texts = { ...DEFAULT_TEXTS };
      data.forEach(row => {
        if (row.key && row.value !== undefined) {
          texts[row.key] = row.value;
        }
      });
      return texts;
    } catch (err) {
      console.warn('Falha na requisição, usando localStorage/Padrão:', err);
      return this.getLocalTexts();
    }
  },

  async saveText(key, value) {
    try {
      const { error } = await supabase
        .from('landing_page_config')
        .upsert([{ key, value }], { onConflict: 'key' });
      
      if (error) {
        throw error;
      }
    } catch (err) {
      console.warn(`Erro ao salvar no Supabase para ${key}, salvando no localStorage:`, err);
      const local = this.getLocalTexts();
      local[key] = value;
      localStorage.setItem('landing_page_config_local', JSON.stringify(local));
    }
  },

  async saveAllTexts(texts) {
    const promises = Object.entries(texts).map(([key, value]) => this.saveText(key, value));
    await Promise.all(promises);
  },

  async trackView(page = 'landing') {
  try {
    await supabase.rpc('track_page_view', {
      page_name: page
    });
  } catch (err) {
    console.warn('Erro ao registrar view:', err);
  }
},

  getLocalTexts() {
    const local = localStorage.getItem('landing_page_config_local');
    if (local) {
      try {
        return { ...DEFAULT_TEXTS, ...JSON.parse(local) };
      } catch (e) {
        return DEFAULT_TEXTS;
      }
    }
    return DEFAULT_TEXTS;
  }
};
