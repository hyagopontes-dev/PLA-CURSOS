-- ============================================================
-- PLATAFORMA DE CURSOS — Schema principal
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (espelha auth.users)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  avatar_url  text,
  role        text not null default 'student' check (role in ('student', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger para criar profile automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- COURSES
-- ============================================================
create table public.courses (
  id              uuid primary key default uuid_generate_v4(),
  slug            text not null unique,
  title           text not null,
  description     text not null default '',
  thumbnail_url   text,
  price_cents     integer not null default 0,
  status          text not null default 'draft' check (status in ('draft', 'published')),
  instructor_name text not null default '',
  instructor_bio  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- MODULES
-- ============================================================
create table public.modules (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- LESSONS
-- ============================================================
create table public.lessons (
  id               uuid primary key default uuid_generate_v4(),
  module_id        uuid not null references public.modules(id) on delete cascade,
  title            text not null,
  content_type     text not null check (content_type in ('video', 'pdf', 'text')),
  video_url        text,
  pdf_url          text,
  content_md       text,
  order_index      integer not null default 0,
  duration_seconds integer,
  is_preview       boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- QUIZZES
-- ============================================================
create table public.quizzes (
  id            uuid primary key default uuid_generate_v4(),
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  question      text not null,
  options       text[] not null,
  correct_index integer not null,
  explanation   text,
  order_index   integer not null default 0
);

-- ============================================================
-- ENROLLMENTS
-- ============================================================
create table public.enrollments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  paid_at     timestamptz,
  payment_id  uuid,
  created_at  timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ============================================================
-- LESSON PROGRESS
-- ============================================================
create table public.lesson_progress (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  lesson_id       uuid not null references public.lessons(id) on delete cascade,
  completed       boolean not null default false,
  watched_seconds integer not null default 0,
  quiz_score      integer,
  updated_at      timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table public.payments (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.profiles(id),
  course_id             uuid not null references public.courses(id),
  stripe_session_id     text not null unique,
  stripe_payment_intent text,
  amount_cents          integer not null,
  status                text not null default 'pending' check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.courses        enable row level security;
alter table public.modules        enable row level security;
alter table public.lessons        enable row level security;
alter table public.quizzes        enable row level security;
alter table public.enrollments    enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.payments       enable row level security;

-- Helper: verifica se usuário é admin
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: verifica matrícula
create or replace function public.is_enrolled(p_course_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.enrollments
    where user_id = auth.uid()
      and course_id = p_course_id
      and paid_at is not null
  );
$$;

-- PROFILES
create policy "Usuário vê próprio perfil" on public.profiles
  for select using (auth.uid() = id);
create policy "Usuário edita próprio perfil" on public.profiles
  for update using (auth.uid() = id);
create policy "Admin vê todos os perfis" on public.profiles
  for select using (public.is_admin());

-- COURSES (publicados são visíveis para todos)
create policy "Cursos publicados são públicos" on public.courses
  for select using (status = 'published');
create policy "Admin gerencia cursos" on public.courses
  for all using (public.is_admin());

-- MODULES (visíveis se curso publicado ou admin)
create policy "Módulos de cursos publicados" on public.modules
  for select using (
    exists (select 1 from public.courses where id = course_id and status = 'published')
  );
create policy "Admin gerencia módulos" on public.modules
  for all using (public.is_admin());

-- LESSONS (preview livre; resto exige matrícula)
create policy "Aulas preview ou matriculado" on public.lessons
  for select using (
    is_preview = true
    or public.is_admin()
    or exists (
      select 1 from public.modules m
      where m.id = module_id
        and public.is_enrolled(m.course_id)
    )
  );
create policy "Admin gerencia aulas" on public.lessons
  for all using (public.is_admin());

-- QUIZZES (mesmo acesso das aulas)
create policy "Quiz apenas para matriculados" on public.quizzes
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      where l.id = lesson_id
        and public.is_enrolled(m.course_id)
    )
  );
create policy "Admin gerencia quizzes" on public.quizzes
  for all using (public.is_admin());

-- ENROLLMENTS
create policy "Usuário vê próprias matrículas" on public.enrollments
  for select using (auth.uid() = user_id);
create policy "Admin vê todas as matrículas" on public.enrollments
  for all using (public.is_admin());

-- LESSON PROGRESS
create policy "Usuário gerencia próprio progresso" on public.lesson_progress
  for all using (auth.uid() = user_id);
create policy "Admin vê todo progresso" on public.lesson_progress
  for select using (public.is_admin());

-- PAYMENTS
create policy "Usuário vê próprios pagamentos" on public.payments
  for select using (auth.uid() = user_id);
create policy "Admin vê todos os pagamentos" on public.payments
  for all using (public.is_admin());

-- ============================================================
-- ÍNDICES
-- ============================================================
create index on public.courses (slug);
create index on public.courses (status);
create index on public.modules (course_id, order_index);
create index on public.lessons (module_id, order_index);
create index on public.enrollments (user_id, course_id);
create index on public.lesson_progress (user_id, lesson_id);
create index on public.payments (stripe_session_id);
create index on public.payments (user_id);
