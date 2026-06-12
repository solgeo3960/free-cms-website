# 完全無料CMS付きコーポレートサイト テンプレート

**Astro + Sveltia CMS + GitHub + Cloudflare Pages** を使った、維持費ゼロで運用できるCMS付きホームページのテンプレートです。

WordPressのようなサーバーやデータベースは不要。記事はMarkdownファイルとしてGitHubで管理し、Cloudflare Pages が自動的にビルド＆配信します。

---

## このテンプレートでできること

- ✅ **CMS管理画面**（`/admin/`）から記事を追加・編集・削除できる
- ✅ **お知らせ（ニュース）** の一覧ページ・詳細ページが自動生成される
- ✅ **お問い合わせフォーム** からメールを送信できる（Resend使用）
- ✅ **完全無料**でホスティング・運用できる（Cloudflare Pages の無料枠内）
- ✅ **独自ドメイン**を接続できる（Cloudflare DNS）
- ✅ GitHub にプッシュするだけで**自動デプロイ**される

---

## 技術スタック

| 役割 | 技術 | 費用 |
|---|---|---|
| フロントエンド | [Astro](https://astro.build/) | 無料 |
| CMS管理画面 | [Sveltia CMS](https://github.com/sveltia/sveltia-cms) | 無料 |
| コンテンツ保存先 | GitHub リポジトリ | 無料 |
| ホスティング | Cloudflare Pages | 無料 |
| メール送信 | [Resend](https://resend.com/)（月100通まで無料） | 無料 |
| 独自ドメイン | Cloudflare DNS | ドメイン代のみ |

---

## ページ構成

| ページ | URL | 内容 |
|---|---|---|
| トップ | `/` | ヒーロー・事業紹介・最新ニュース |
| 会社情報 | `/about/` | ミッション・沿革・数値実績 |
| ニュース一覧 | `/news/` | 記事一覧（新しい順） |
| ニュース詳細 | `/news/{スラッグ}/` | Markdown記事の表示 |
| お問い合わせ | `/contact/` | フォーム送信 |
| CMS管理画面 | `/admin/` | Sveltia CMS |

---

## セットアップ手順

### 前提条件

以下のアカウントを事前に作成しておいてください（すべて無料）。

- [GitHub](https://github.com/) アカウント
- [Cloudflare](https://cloudflare.com/) アカウント
- [Resend](https://resend.com/) アカウント（お問い合わせフォームを使う場合）

また、ローカルPC に以下がインストールされていること。

- [Node.js](https://nodejs.org/) v20 以上
- [Git](https://git-scm.com/)

---

### ステップ 1：このリポジトリをフォークまたはクローンする

#### フォークする場合（推奨）

このリポジトリ右上の **「Fork」** ボタンをクリックして、自分のGitHubアカウントにコピーしてください。

#### クローンする場合

```bash
git clone https://github.com/solgeo3960/free-cms-website.git
cd free-cms-website
npm install
```

---

### ステップ 2：CMS の設定ファイルを編集する

`public/admin/config.yml` を開き、`repo:` の行を **自分のリポジトリ** に書き換えてください。

```yaml
backend:
  name: github
  repo: あなたのGitHubユーザー名/リポジトリ名   # ← ここを変更
  branch: main
```

**例：**

```yaml
backend:
  name: github
  repo: yamada-taro/my-corporate-site
  branch: main
```

---

### ステップ 3：Cloudflare Pages にデプロイする

#### 3-1. Cloudflare にログインする

[dash.cloudflare.com](https://dash.cloudflare.com) にアクセスしてログインします。

#### 3-2. Pages プロジェクトを作成する

1. 左メニューの **「Workers & Pages」** → **「Pages」** をクリック
2. **「Connect to Git」** をクリック
3. **GitHub** を選択し、対象のリポジトリを選ぶ
4. ビルド設定を以下のように入力する：

| 項目 | 設定値 |
|---|---|
| Framework preset | `Astro` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `20` |

5. **「Save and Deploy」** をクリックして初回デプロイを実行

#### 3-3. 環境変数を設定する（お問い合わせフォームを使う場合）

1. Pages プロジェクトの **「Settings」→「Environment variables」** を開く
2. 以下の変数を追加する：

| 変数名 | 値 | 説明 |
|---|---|---|
| `RESEND_API_KEY` | `re_xxxxx...` | Resend の APIキー |
| `CONTACT_TO_EMAIL` | `info@example.com` | 問い合わせの受信先アドレス |
| `CONTACT_FROM_EMAIL` | `noreply@yourdomain.com` | 送信元アドレス（Resendで認証済みドメイン必須） |

> **注意：** `CONTACT_FROM_EMAIL` に使うドメインは、Resend 管理画面でドメイン認証が必要です。  
> 詳しくは [Resend のドキュメント](https://resend.com/docs/dashboard/domains/introduction) を参照してください。

---

### ステップ 4：Sveltia CMS の GitHub 認証を設定する

Sveltia CMS で記事を編集するには、GitHub の OAuth 認証設定が必要です。

#### 4-1. GitHub OAuth App を作成する

1. GitHub の **「Settings」→「Developer settings」→「OAuth Apps」→「New OAuth App」** を開く
2. 以下を入力する：

| 項目 | 入力値 |
|---|---|
| Application name | `My CMS`（任意） |
| Homepage URL | `https://あなたのサイトURL` |
| Authorization callback URL | `https://あなたのサイトURL/admin/` |

3. **「Register application」** をクリック
4. **Client ID** と **Client Secret** をメモしておく

#### 4-2. Cloudflare Workers で認証プロキシを立てる

Sveltia CMS の GitHub認証には、OAuth トークンを安全に受け取るためのプロキシサーバーが必要です。Cloudflare Workers（無料）を使って簡単に立てられます。

公式の認証プロキシ実装：  
👉 [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)

上記リポジトリの手順に従って Workers にデプロイしてください（約5分で完了します）。

デプロイ後、`public/admin/config.yml` に以下を追加します：

```yaml
backend:
  name: github
  repo: あなたのGitHubユーザー名/リポジトリ名
  branch: main
  base_url: https://あなたのWorkers URL   # ← 追加
```

---

### ステップ 5：独自ドメインを設定する（任意）

1. Cloudflare DNS でドメインを管理している場合、Pages プロジェクトの **「Custom domains」** から追加するだけで自動的にSSL証明書も設定されます。
2. 他のレジストラで購入したドメインを使う場合は、ネームサーバーを Cloudflare に向けてから同様の手順で設定してください。

---

## ローカル開発

```bash
# 依存パッケージをインストール
npm install

# 開発サーバーを起動（http://localhost:4321）
npm run dev

# 本番ビルドを実行
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

## コンテンツの管理方法

### CMSから記事を追加・編集する（推奨）

1. `https://あなたのサイトURL/admin/` にアクセス
2. **「Login with GitHub」** でログイン
3. 「お知らせ」コレクションから記事を追加・編集
4. **「Publish」** をクリックすると GitHub に自動的にコミットされ、数十秒でサイトに反映される

### 直接Markdownファイルを編集する

`src/content/news/` フォルダに `.md` ファイルを作成します。

**ファイル名の例：** `src/content/news/my-first-post.md`

```markdown
---
title: "記事のタイトル"
slug: "my-first-post"
date: "2026-06-01"
thumbnail: "/images/uploads/my-image.jpg"
description: "記事の概要文（一覧ページや OGP に使用）"
---

## 見出し

本文をMarkdownで記述します。

- リスト項目
- リスト項目
```

> **`slug` フィールドについて：**  
> スラッグはURLになります（例：`my-first-post` → `/news/my-first-post/`）。  
> 半角英数字とハイフンのみ使用し、ファイル名と合わせることを推奨します。

---

## ディレクトリ構成

```
.
├── public/
│   ├── admin/
│   │   ├── index.html        # Sveltia CMSの読み込みHTML
│   │   └── config.yml        # CMS設定ファイル（★要編集）
│   ├── images/uploads/       # CMSからアップロードした画像の保存先
│   └── favicon.svg
│
├── src/
│   ├── content.config.ts     # コンテンツコレクションの型定義
│   ├── content/
│   │   └── news/             # お知らせ記事（Markdownファイル）
│   ├── layouts/
│   │   └── BaseLayout.astro  # 共通HTMLレイアウト・グローバルCSS
│   ├── components/
│   │   ├── Header.astro      # ナビゲーションバー
│   │   └── Footer.astro      # フッター
│   └── pages/
│       ├── index.astro       # トップページ
│       ├── about.astro       # 会社情報ページ
│       ├── contact.astro     # お問い合わせページ
│       ├── news/
│       │   ├── index.astro   # ニュース一覧ページ
│       │   └── [slug].astro  # ニュース詳細ページ
│       └── api/
│           └── contact.ts    # お問い合わせAPIエンドポイント
│
├── astro.config.mjs          # Astroの設定（Cloudflareアダプター）
├── package.json
└── .env.example              # 環境変数のテンプレート
```

---

## カスタマイズガイド

### 会社名・テキストを変更する

各 `.astro` ファイルを直接編集してください。

| 変更したい箇所 | ファイル |
|---|---|
| ナビゲーションのロゴ・リンク | [`src/components/Header.astro`](src/components/Header.astro) |
| フッターの会社名・リンク | [`src/components/Footer.astro`](src/components/Footer.astro) |
| トップページの文章・数値 | [`src/pages/index.astro`](src/pages/index.astro) |
| 会社情報ページの内容 | [`src/pages/about.astro`](src/pages/about.astro) |
| お問い合わせ情報（住所・電話番号） | [`src/pages/contact.astro`](src/pages/contact.astro) |

### カラーを変更する

デザインカラーは [`src/layouts/BaseLayout.astro`](src/layouts/BaseLayout.astro) および各ページの `<style>` セクション内で管理しています。

主なカラー：

```css
/* 主要カラー */
#2F6BFF   /* プライマリブルー */
#070D26   /* ダーク背景（ヒーローセクション） */
#F7F9FC   /* ライトグレー背景 */
#0A1430   /* テキスト（ダーク） */
```

### フォントを変更する

[`src/layouts/BaseLayout.astro`](src/layouts/BaseLayout.astro) の Google Fonts リンクを変更してください。

---

## 環境変数一覧

`.env.example` をコピーして `.env` ファイルを作成してください（`.env` はGitに含まれません）。

```bash
cp .env.example .env
```

| 変数名 | 必須 | 説明 |
|---|---|---|
| `RESEND_API_KEY` | お問い合わせ機能を使う場合は必須 | Resend のAPIキー（`re_` から始まる） |
| `CONTACT_TO_EMAIL` | 同上 | 問い合わせメールの受信先アドレス |
| `CONTACT_FROM_EMAIL` | 同上 | 送信元アドレス（Resend認証済みドメイン必須） |

---

## よくある質問

### Q. ローカルでお問い合わせフォームをテストしたい

`.env` ファイルに環境変数を設定した上で `npm run dev` を起動してください。  
Astro の開発サーバーがAPIルートも処理します。

### Q. 管理画面（/admin/）にアクセスできない

Sveltia CMS は GitHub OAuth 認証が必要です。「ステップ4」の認証プロキシ設定が完了しているか確認してください。

### Q. 記事を公開したのにサイトに反映されない

Cloudflare Pages のビルドが完了するまで1〜2分かかります。Cloudflare ダッシュボードの **「Deployments」** タブでビルド状況を確認してください。

### Q. 画像はどこに保存すればいい？

CMSからアップロードした画像は `public/images/uploads/` に保存されます。  
手動で追加する場合も同じフォルダに置き、Markdownでは `/images/uploads/ファイル名` と指定してください。

### Q. ページを追加したい

`src/pages/` 以下に `.astro` ファイルを作成するだけで自動的にルーティングされます。  
既存ページ（例：`about.astro`）をコピーして編集するのが簡単です。

---

## ライセンス

MIT License — 商用・個人問わず自由にご利用ください。

---

## 参考リンク

- [Astro ドキュメント](https://docs.astro.build/ja/)
- [Sveltia CMS ドキュメント](https://github.com/sveltia/sveltia-cms)
- [Sveltia CMS 認証プロキシ (sveltia-cms-auth)](https://github.com/sveltia/sveltia-cms-auth)
- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Resend ドキュメント](https://resend.com/docs)
