<<<<<<< HEAD
# 📚 Plataforma de Cursos

Stack: **Next.js 14** (App Router) + **Supabase** (DB, Auth, Storage) + **Stripe** (pagamentos) + **Vercel** (deploy)

---

## 🚀 Setup em 5 passos

### 1. Instalar dependências

```bash
npm install
```

### 2. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e cole o conteúdo de `supabase/migrations/001_schema.sql`
3. Execute para criar todas as tabelas, RLS e triggers

No painel do Supabase, copie:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

**Habilitar Google OAuth (opcional):**
- Supabase > Authentication > Providers > Google
- Configure Client ID e Secret do Google Cloud Console

**Supabase Storage para PDFs:**
- Crie um bucket chamado `pdfs` (público ou privado com signed URLs)

### 3. Stripe

1. Crie conta em [stripe.com](https://stripe.com)
2. Copie **Publishable key** e **Secret key** do dashboard
3. Para webhooks locais:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
4. Copie o `whsec_...` gerado para `STRIPE_WEBHOOK_SECRET`

**Em produção:**
- Stripe Dashboard > Developers > Webhooks > Add endpoint
- URL: `https://seudominio.com/api/stripe/webhook`
- Eventos: `checkout.session.completed`, `charge.refunded`

### 4. Variáveis de ambiente

```bash
cp .env.local.example .env.local
# Edite .env.local com seus valores
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Rodar localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy na Vercel

1. Push do código para um repositório GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Adicione todas as variáveis de ambiente no painel da Vercel
4. Atualize `NEXT_PUBLIC_APP_URL` para o domínio de produção
5. Atualize a URL do webhook no Stripe para o domínio de produção

---

## 🏗️ Estrutura do projeto

```
app/
├── (public)/          → Homepage, catálogo, login, cadastro
├── (aluno)/           → Dashboard, player de aula, quiz, certificado
├── (admin)/           → Painel admin: cursos, alunos, relatórios
├── (pagamento)/       → Página de confirmação pós-compra
└── api/               → Stripe checkout, webhook, certificado

components/
├── layout/            → Header, Footer, sidebars
├── course/            → CourseCard, BuyButton, CertificateView
├── player/            → VideoPlayer, PdfViewer, LessonSidebar
├── quiz/              → QuizClient
└── admin/             → CourseEditor, AdminSidebar

lib/
├── supabase/          → Clients (browser e server)
├── stripe.ts          → Instância do Stripe
└── utils.ts           → Funções utilitárias

types/
└── database.ts        → Types TypeScript do banco

supabase/
└── migrations/
    └── 001_schema.sql → Schema completo + RLS
```

---

## 👤 Criar primeiro admin

Após criar sua conta na plataforma, execute no **SQL Editor** do Supabase:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'seu@email.com';
```

Depois acesse `/admin` para gerenciar cursos.

---

## 🔐 Segurança (RLS)

- **Cursos publicados** são públicos para leitura
- **Aulas** só podem ser acessadas por alunos matriculados (exceto aulas marcadas como `is_preview`)
- **Quizzes** só acessíveis para matriculados
- **Admin** tem acesso total via `role = 'admin'` no perfil
- O **middleware** do Next.js bloqueia rotas protegidas antes de qualquer renderização

---

## 💳 Fluxo de pagamento

1. Aluno clica em "Comprar" → `POST /api/stripe/checkout`
2. API cria **Stripe Checkout Session** + registra `payment` com status `pending`
3. Stripe redireciona para checkout hospedado (cartão, PIX)
4. Após pagamento → Stripe envia evento `checkout.session.completed`
5. Webhook em `/api/stripe/webhook` atualiza `payment` para `paid` + cria `enrollment`
6. Aluno é redirecionado para `/obrigado` com acesso imediato
=======
# PLA-CURSOS
>>>>>>> 7f78e16c04d3cd751145a13084443edd3a49aab0
