// Script para setup de env vars en Vercel
const fs = require('fs');
const path = require('path');

const envContent = `NEXT_PUBLIC_SUPABASE_URL=https://wzbyeilknoxzrddhzavm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_OkDHvv4P5OBl7y8DALgBwQ_uXyGrQ0T
`;

const envPath = path.join(process.cwd(), '.env.local');
fs.writeFileSync(envPath, envContent);
console.log('✅ Environment variables configured');
