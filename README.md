# Expenses_Admin

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expenses_Admin — カレンダーベースの経費管理ウェブアプリ。日ごとに経費の入力・削除ができ、レシート画像のアップロードにも対応。複数ユーザーがそれぞれの経費を管理できる認証付きアプリ。

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + 手書きshadcn/ui風コンポーネント
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage)
- **Form:** react-hook-form + zod v4
- **Date:** date-fns（日本語ロケール）
- **UI言語:** 日本語のみ

## Commands

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run start    # プロダクションサーバー起動
npm run lint     # ESLint実行
```

## Architecture

```
src/
├── app/              # Next.js App Router ページ
│   ├── layout.tsx    # ルートレイアウト (lang="ja", Noto Sans JP)
│   ├── page.tsx      # / → /dashboard リダイレクト
│   ├── login/        # ログインページ
│   ├── register/     # 新規登録ページ
│   ├── auth/callback # Supabase認証コールバック
│   └── dashboard/    # カレンダー + 経費管理（認証必須）
├── components/
│   ├── ui/           # 基本UIコンポーネント (Button, Input, Dialog等)
│   ├── auth/         # 認証フォーム
│   ├── calendar/     # カレンダー表示
│   ├── expenses/     # 経費CRUD
│   ├── receipts/     # レシート画像アップロード/プレビュー
│   └── layout/       # ヘッダー, 月間サマリー
├── hooks/            # カスタムフック
└── lib/
    ├── supabase/     # client.ts (ブラウザ), server.ts (サーバー)
    ├── types.ts      # Zodスキーマ + 型定義
    ├── constants.ts  # カテゴリー, 色, 定数
    └── utils.ts      # cn(), formatCurrency()
middleware.ts         # 認証トークン更新 + ルート保護
```

## Environment Variables

`.env.local` に以下を設定:
```
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
```

## Conventions

- UIは全て日本語
- 金額は整数（円）、小数点なし
- カテゴリー: 食費, 交通費, 住居費, 光熱費, 通信費, 医療費, 教育費, 娯楽費, 衣服費, 日用品, 交際費, その他
- レシート画像: JPEG/PNG/WebP/HEIC、5MB上限
- RLS: ユーザーは自分のデータのみアクセス可能
