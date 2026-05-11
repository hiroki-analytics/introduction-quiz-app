# 内定者クイズアプリ 🎯

内定者みんなが自己紹介を登録して、「この人だ～れだ？」クイズをリアルタイムで楽しめるWebアプリ。

---

## アプリの全体像

### 使用技術
| 技術 | 役割 |
|------|------|
| **React** | UIフレームワーク（画面の構築） |
| **Firebase Firestore** | リアルタイムデータベース（データ同期） |
| **Vite** | ビルドツール（開発・本番ビルド） |
| **Vercel** | ホスティング（公開・自動デプロイ） |
| **GitHub** | ソースコード管理 |

### データ構造（Firestore）
```
/session          ← ゲームの状態（登録中 / クイズ中 / 終了）
/members          ← 登録された全員の自己紹介とスコア
/answers          ← 全員の回答と正誤記録
```

### 画面の流れ
```
名前入力 → 自己紹介登録 → 待機室 → クイズ → ランキング
```

---

## 使い方

### 参加者
1. URLを開く → 自分の名前を入力
2. 自己紹介（出身地・特技・意外な一面・一言）を入力して「登録する」
3. 待機室で全員が揃うのを待つ
4. クイズが始まったら、ヒントを見て名前を選択
5. 最後にランキングが表示される

### 司会者
- 司会者URL: `https://naitei-quiz-app-1cax.vercel.app/?host=true`
- 全員が登録したら「クイズスタート！」を押す
- 各問題で「正解を発表する」→「次の問題へ」を操作
- ゲーム終了後のランキング画面で「新しいゲームを始める」を押すとリセット

### URL一覧
| 役割 | URL |
|------|-----|
| 参加者 | `https://naitei-quiz-app-1cax.vercel.app/` |
| 司会者 | `https://naitei-quiz-app-1cax.vercel.app/?host=true` |

### スコアルール
- 正解：**+10pt**
- 不正解：0pt
- 全問終了後にランキング表示

---

## ゼロからデプロイまでの手順書

### 1. 開発環境の準備

**必要なもの**
- Node.js（https://nodejs.org）
- Git（https://git-scm.com）
- GitHubアカウント（https://github.com）
- Vercelアカウント（https://vercel.com）
- Firebaseアカウント（https://firebase.google.com）

**Gitのユーザー設定**（初回のみ）
```bash
git config --global user.name "GitHubのユーザー名"
git config --global user.email "GitHubに登録したメールアドレス"
```
> ⚠️ メールアドレスはGitHubアカウントのものと一致させる（Vercelが認証に使う）

---

### 2. Reactプロジェクトの作成

```bash
npm create vite@latest naitei-quiz-app -- --template react
cd naitei-quiz-app
npm install
```

**Firebaseをインストール**
```bash
npm install firebase
```

---

### 3. Firebaseのセットアップ

1. https://console.firebase.google.com を開く
2. 「プロジェクトを作成」→ 名前を入力 → Analyticsはオフ
3. 左メニュー「Firestore Database」→「データベースを作成」
   - 「テストモードで開始」を選択
   - ロケーション: `asia-northeast1`（東京）
4. 左上の歯車アイコン →「プロジェクトの設定」→「ウェブアプリを追加（</>）」
5. 表示される `firebaseConfig` をコピーして `src/firebase.js` に貼り付ける

**src/firebase.js**
```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

---

### 4. GitHubにプッシュ

**GitHub CLIのインストールと認証**（初回のみ）
```bash
brew install gh
gh auth login
# 画面の指示に従ってブラウザで認証
```

**リポジトリの作成とプッシュ**
```bash
git init
git add .
git commit -m "initial commit"
```

1. https://github.com/new でリポジトリを作成（Privateを推奨）
2. 作成後に表示されるURLを使ってリモートを設定：
```bash
git remote add origin https://github.com/ユーザー名/naitei-quiz-app.git
git push -u origin main
```

---

### 5. Vercelへのデプロイ

1. https://vercel.com/new を開く
2. 「Import Git Repository」でGitHubのリポジトリを選択
3. 設定はそのまま「Deploy」をクリック
4. デプロイ完了後にURLが発行される

**以降はGitHubにプッシュするたびに自動デプロイされる**

---

### 6. 修正の手順（開発サイクル）

```bash
# 1. コードを編集する（src/App.jsx など）

# 2. ローカルで動作確認
npm run dev
# → http://localhost:5173 で確認

# 3. ビルドが通るか確認
npm run build

# 4. GitHubにプッシュ → Vercelが自動デプロイ
git add .
git commit -m "変更内容のメモ"
git push
```

---

## ファイル構成

```
naitei-quiz-app/
├── src/
│   ├── App.jsx        ← アプリ本体（全画面のコード）
│   ├── firebase.js    ← Firebase設定
│   ├── main.jsx       ← エントリーポイント
│   └── index.css      ← グローバルCSS
├── public/            ← 静的ファイル
├── index.html         ← HTMLテンプレート
├── package.json       ← 依存パッケージ
└── vite.config.js     ← Viteの設定
```

---

## トラブルシューティング

### Vercelデプロイが「not a valid email」エラーになる
→ Gitのメールアドレスがおかしい。GitHubアカウントのメールに合わせる：
```bash
git config --global user.email "GitHubのメールアドレス"
git commit --allow-empty -m "fix email"
git push
```

### Vercelで「not a member of the team」エラーになる
→ Vercel CLIではなく、ブラウザの https://vercel.com/new からGitHub連携でデプロイする

### データがリセットされない
→ 司会者URL（`?host=true`）でないとリセットボタンが表示されない
