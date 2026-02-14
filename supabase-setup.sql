-- ============================================
-- Supabase セットアップSQL
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================

-- 1. expenses テーブル作成
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  date date not null,
  amount integer not null check (amount > 0),
  category text not null check (category in (
    '食費', '交通費', '住居費', '光熱費', '通信費',
    '医療費', '教育費', '娯楽費', '衣服費', '日用品',
    '交際費', 'その他'
  )),
  description text,
  receipt_path text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. updated_at 自動更新トリガー
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_expenses_updated_at
  before update on public.expenses
  for each row
  execute function public.update_updated_at_column();

-- 3. インデックス（パフォーマンス向上）
create index idx_expenses_user_date on public.expenses(user_id, date);

-- 4. RLS (Row Level Security) 有効化
alter table public.expenses enable row level security;

-- 5. RLSポリシー: ユーザーは自分のデータのみアクセス可能
create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- 6. Storage バケット作成（レシート画像用）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- 7. Storage RLSポリシー
create policy "Users can upload own receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own receipts"
  on storage.objects for select
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own receipts"
  on storage.objects for delete
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
