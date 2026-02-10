// src/config/env.ts

export const ENV = {
  // Supabase (PROD)
  SUPABASE_URL: 'https://ekwjtoebglvnowzbydui.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrd2p0b2ViZ2x2bm93emJ5ZHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzUwNTksImV4cCI6MjA4MTA1MTA1OX0.gWH7jKXA2IFByezCF2RtfbQxBbJKlEg7JV797tPwQlk',

  // RPC pública de verificación
  RPC_VERIFY_PATH: '/rest/v1/rpc/verify_by_hash_public',

  // Network
  HTTP_TIMEOUT_MS: 8000,

  // Allowlist estricta (QR URLs)
  ALLOWED_HOSTS: ['verify.pinealshield.com'],
};
