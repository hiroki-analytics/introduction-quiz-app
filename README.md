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
/rooms/{roomCode}             ← ゲームの状態（登録中 / クイズ中 / 終了）
/rooms/{roomCode}/members     ← 登録された全員の自己紹介とスコア
/rooms/{roomCode}/answers     ← 全員の回答と正誤記録
```

### 画面の流れ

**司会者**
```
ルーム番号発行 → 参加者を待つ → クイズ進行 → ランキング
```

**参加者**
```
ルーム番号入力 → 名前入力 → 自己紹介登録 → 待機室 → クイズ → ランキング
```

---

## 使い方

### 司会者
1. 司会者URL（`?host=true`）を開く → 4桁のルーム番号が自動発行される
2. ルーム番号を参加者に共有する
3. 全員が登録したら「クイズスタート！」を押す
4. 各問題で「正解を発表する」→「次の問題へ」を操作
5. ゲーム終了後のランキング画面で「新しいゲームを始める」または「終了してデータを削除」を押す

### 参加者
1. 参加者URLを開く → ルーム番号（4桁）を入力
2. 名前を入力
3. 自己紹介（出身地・特技・意外な一面・一言）を登録する
4. 待機室で司会者のスタートを待つ
5. クイズが始まったら、ヒントを見て名前を選択
6. 正解発表後に全員のスコアを確認、最後にランキングが表示される

### URL一覧
| 役割 | URL |
|------|-----|
| 参加者 | `https://naitei-quiz-app-1cax.vercel.app/` |
| 司会者 | `https://naitei-quiz-app-1cax.vercel.app/?host=true` |

### スコアルール
- 正解：**+10pt**
- 不正解：0pt
- 自分のスコアはクイズ画面のヘッダーに常時表示
- 正解発表のたびに全員の順位を確認できる
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
├── vite.config.js     ← Viteの設定
└── CHANGELOG.md       ← 更新履歴
```

---

## トラブルシューティング

### ルーム番号を入力しても「見つかりません」と出る
→ 司会者がまだURLを開いていない可能性がある。司会者に確認する

### 2回目のゲームで最初から回答済みになっている
→ 司会者が「新しいゲームを始める」または「新しいルーム番号を発行する」を押してリセットする

### Vercelデプロイが「not a valid email」エラーになる
→ Gitのメールアドレスがおかしい。GitHubアカウントのメールに合わせる：
```bash
git config --global user.email "GitHubのメールアドレス"
git commit --allow-empty -m "fix email"
git push
```

### Vercelで「not a member of the team」エラーになる
→ Vercel CLIではなく、ブラウザの https://vercel.com/new からGitHub連携でデプロイする
