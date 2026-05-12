# 📚 Plataforma de Cursos

Stack: **Next.js 14** (App Router) + **Supabase** (DB, Auth, Storage) + **Vercel** (deploy)

> 💳 Integração com Stripe será adicionada futuramente. Por enquanto, matrículas são feitas manualmente via Supabase.

---

## 🚀 Setup em 4 passos

### 1. Instalar dependências

```bash
npm install
cp .env.local.example .env.local
```

### 2. Criar projeto no Supabase

1. Acesse supabase.com → New project
2. Escolha a região South America (São Paulo)
3. Vá em SQL Editor → cole e execute supabase/migrations/001_schema.sql
4. Copie as chaves em Project Settings → API:

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

Em Authentication → URL Configuration:
- Site URL: https://seudominio.vercel.app
- Redirect URLs: https://seudominio.vercel.app/auth/callback

### 3. Deploy na Vercel

Suba o código no GitHub e importe na Vercel com as variáveis de ambiente.

### 4. Criar usuário admin

UPDATE public.profiles SET role = 'admin' WHERE email = 'seu@email.com';

---

## 👤 Matrícula manual de alunos

INSERT INTO public.enrollments (user_id, course_id, paid_at)
VALUES ('id-do-usuario', 'id-do-curso', now());

