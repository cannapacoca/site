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

const LOCAL_STORAGE_KEY = 'landing_page_config_local';

let configTableAvailable = null;

function isMissingTableError(error) {
  return error?.code === 'PGRST205'
    || error?.message?.includes("Could not find the table");
}

async function checkConfigTable() {
  if (configTableAvailable !== null) return configTableAvailable;

  const { error } = await supabase
    .from('landing_page_config')
    .select('key')
    .limit(1);

  configTableAvailable = !error || !isMissingTableError(error);
  return configTableAvailable;
}

function saveLocalTexts(texts) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...DEFAULT_TEXTS, ...texts }));
}

export const landingPageService = {
  async isConfigRemoteAvailable() {
    return checkConfigTable();
  },

  async getTexts() {
    const remoteAvailable = await checkConfigTable();
    if (!remoteAvailable) {
      return this.getLocalTexts();
    }

    try {
      const { data, error } = await supabase
        .from('landing_page_config')
        .select('*');

      if (error) {
        if (isMissingTableError(error)) {
          configTableAvailable = false;
          return this.getLocalTexts();
        }
        console.warn('Erro ao carregar textos do Supabase, usando localStorage/padrão:', error);
        return this.getLocalTexts();
      }

      if (!data || data.length === 0) {
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
      console.warn('Falha na requisição, usando localStorage/padrão:', err);
      return this.getLocalTexts();
    }
  },

  async saveText(key, value) {
    const remoteAvailable = await checkConfigTable();
    if (!remoteAvailable) {
      const local = this.getLocalTexts();
      local[key] = value;
      saveLocalTexts(local);
      return { storage: 'local' };
    }

    const { error } = await supabase
      .from('landing_page_config')
      .upsert([{ key, value }], { onConflict: 'key' });

    if (error) {
      console.warn(`Erro ao salvar no Supabase (${key}), usando localStorage:`, error);
      const local = this.getLocalTexts();
      local[key] = value;
      saveLocalTexts(local);
      return { storage: 'local' };
    }

    return { storage: 'supabase' };
  },

  async saveAllTexts(texts) {
    const remoteAvailable = await checkConfigTable();
    if (!remoteAvailable) {
      saveLocalTexts(texts);
      return { storage: 'local' };
    }

    const rows = Object.entries(texts).map(([key, value]) => ({ key, value }));
    const { error } = await supabase
      .from('landing_page_config')
      .upsert(rows, { onConflict: 'key' });

    if (error) {
      console.warn('Erro ao salvar textos no Supabase, usando localStorage:', error);
      saveLocalTexts(texts);
      return { storage: 'local' };
    }

    saveLocalTexts(texts);
    return { storage: 'supabase' };
  },

  async trackView(page = 'landing') {
    const { error } = await supabase
      .from('page_views')
      .insert({ page });

    if (error) {
      console.warn('Erro ao registrar view:', error);
      return false;
    }
    return true;
  },

  getLocalTexts() {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
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
