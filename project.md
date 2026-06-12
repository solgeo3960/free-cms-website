# 無料CMS付き静的ホームページ構築 仕様書

## 1. 目的

Astro + Sveltia CMS + GitHub + Cloudflare Pages を使い、低コストで運用できるCMS付きホームページを構築する。

WordPressのようなDB型CMSは使わず、MarkdownファイルをGitHubで管理し、Cloudflare Pagesで静的サイトとして配信する。

---

## 2. 採用技術

| 項目 | 技術 |
|---|---|
| フロントエンド | Astro |
| CMS | Sveltia CMS |
| データ保存 | GitHub Repository |
| ホスティング | Cloudflare Pages |
| 独自ドメイン | Cloudflare DNS |
| フォーム送信 | Resend |
| コンテンツ形式 | Markdown / MDX |
| スタイル | CSS / SCSS / Tailwindいずれか |

---

## 3. 全体構成

```txt
ユーザー
  ↓
Cloudflare Pages
  ↓
Astro 静的サイト

管理者
  ↓
/admin
  ↓
Sveltia CMS
  ↓
GitHub Repository
  ↓
Cloudflare Pages 自動ビルド
4. ディレクトリ構成案
project-root/
├── public/
│   ├── admin/
│   │   ├── index.html
│   │   └── config.yml
│   └── images/
│
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── news/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── contact.astro
│   │
│   └── content/
│       ├── news/
│       └── works/
│
├── astro.config.mjs
├── package.json
└── README.md
5. ページ構成

最低限、以下のページを作成する。

ページ	URL	備考
トップページ	/	メインビジュアル、概要、最新記事
会社概要	/about/	固定ページ
お知らせ一覧	/news/	Markdownから自動生成
お知らせ詳細	/news/[slug]/	Markdown詳細ページ
お問い合わせ	/contact/	Resendで送信
CMS管理画面	/admin/	Sveltia CMS
6. CMS管理対象

Sveltia CMSで以下を編集できるようにする。

お知らせ

保存先：

src/content/news/

項目：

フィールド	型	必須
title	string	必須
slug	string	必須
date	datetime	必須
thumbnail	image	任意
description	text	任意
body	markdown	必須

Markdown例：

---
title: "お知らせタイトル"
slug: "sample-news"
date: "2026-06-11"
thumbnail: "/images/news/sample.jpg"
description: "お知らせの概要文です。"
---

本文をMarkdownで記述します。
7. Sveltia CMS設定

public/admin/index.html

<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>CMS Admin</title>
  </head>
  <body>
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
  </body>
</html>

public/admin/config.yml

backend:
  name: github
  repo: your-github-user/your-repository-name
  branch: main

media_folder: "public/images/uploads"
public_folder: "/images/uploads"

collections:
  - name: "news"
    label: "お知らせ"
    folder: "src/content/news"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "タイトル", name: "title", widget: "string" }
      - { label: "スラッグ", name: "slug", widget: "string" }
      - { label: "公開日", name: "date", widget: "datetime" }
      - { label: "サムネイル", name: "thumbnail", widget: "image", required: false }
      - { label: "概要文", name: "description", widget: "text", required: false }
      - { label: "本文", name: "body", widget: "markdown" }
8. Astro側の実装要件

Astro Content Collectionsを使用する。

src/content/config.ts

import { defineCollection, z } from "astro:content";

const news = defineCollection({
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.date(),
    thumbnail: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = {
  news,
};
9. お知らせ一覧

src/pages/news/index.astro

要件：

src/content/news/ の記事を取得
公開日順で新しい順に並べる
タイトル、日付、概要文、サムネイルを表示
詳細ページへリンクする
10. お知らせ詳細

src/pages/news/[slug].astro

要件：

Markdown本文を表示
title / description / OGPを設定
存在しないslugは404
前後記事リンクは任意
11. お問い合わせフォーム

Resendを使ってメール送信する。

要件

フォーム項目：

項目	name	必須
お名前	name	必須
メールアドレス	email	必須
お問い合わせ内容	message	必須

送信先メールアドレスは環境変数で管理する。

RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=

AstroのAPI Routeを使う。

src/pages/api/contact.ts

送信後はJSONを返す。

成功：

{
  "success": true
}

失敗：

{
  "success": false,
  "message": "送信に失敗しました"
}
12. 環境変数

Cloudflare Pagesに以下を設定する。

RESEND_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
13. デプロイ

GitHubにpushするとCloudflare Pagesが自動ビルドする。

Build settings
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Node.js version: 20
14. 独自ドメイン

Cloudflare Pagesに独自ドメインを接続する。

例：

example.com
www.example.com

Cloudflare DNSでPagesの案内に従って設定する。

15. セキュリティ・運用
/admin/ はGitHub認証前提
GitHubアカウントは管理者のみ付与
Resend API KeyはGitHubにコミットしない
.env は .gitignore に含める
画像は public/images/uploads/ に保存
コンテンツ履歴はGitHubで管理する
16. 完成条件

以下を満たしたら完了。

Astroサイトがローカルで起動する
トップページが表示される
/news/ に記事一覧が表示される
/news/[slug]/ に記事詳細が表示される
/admin/ からSveltia CMSが開ける
CMSから記事追加・編集ができる
GitHubにMarkdownが保存される
Cloudflare Pagesで自動デプロイされる
お問い合わせフォームからResendでメール送信できる
独自ドメインで公開できる

注意点として、**Sveltia CMSのGitHub認証まわり**は実装時にOAuth設定が必要になる可能性があります。  
Cursorにはまずこの仕様で作らせて、認証部分だけあとで詰める流れで良いです。