import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

async function main() {
  const raw = readFileSync('.env.local','utf-8');
  for (const l of raw.split('\n')) { const m=l.match(/^([^#=]+)=(.*)/); if(m) process.env[m[1].trim()]=m[2].trim().replace(/^["']|["']$/g,''); }
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const {data, error} = await sb.from('categories').select('slug').like('slug','vozila%').limit(20);
  console.log('vozila slugs error:', error?.message);
  console.log('vozila slugs:', data?.map(d=>d.slug));

  const {data: allCats} = await sb.from('categories').select('count').single();
  console.log('total categories:', allCats);

  const {data: prof} = await sb.from('profiles').select('*').limit(1);
  console.log('profile columns:', prof?.[0] ? Object.keys(prof[0]) : []);
}

main().catch(console.error);
