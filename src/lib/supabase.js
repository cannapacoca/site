// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Para Vite: use import.meta.env e prefixo VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
  throw new Error(
    'Supabase URL and Anon Key are required.\n' +
    'Create a .env file in the project root with:\n' +
    'VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=sua_chave_anon'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);