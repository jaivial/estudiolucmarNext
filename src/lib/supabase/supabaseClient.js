import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA;

export const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: schema } });

console.log('schema', schema); // Debugging line
