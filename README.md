# ランキングボードサイト

2024年の高専祭で使用するために制作した、競技スコアのランキングボードサイトです。

参加者ごとの競技結果を CSV で管理し、Web 画面上でランキング表示、個人結果の確認、運営側によるスコア編集ができるようにしています。文化祭などのイベント会場で、ランキングを掲示したり、来場者がQRコードによりそのWebサイトにアクセスし自分の順位を確認できます。そして、裏側では運営メンバーがスコアを更新することもできます。

## 主な機能

- 参加者の総合順位を一覧表示
- 個人 ID から各競技の順位とスコアを確認
- 会場表示向けのランキング画面
- ログイン認証付きのスコア編集画面
- CSV ファイルを使ったスコアデータ管理
- 編集履歴の記録

## 使用技術

- Node.js
- Express.js
- EJS
- Passport.js
- express-session
- csv-parser
- fast-csv
- dotenv
- Render.com

## ディレクトリ構成

```text
.
├── data/              # スコア CSV、編集ログ
├── routes/            # 画面ごとのルーティング
├── views/             # EJS ファイル
├── server.js          # Express アプリ本体
├── package.json       # 依存関係と起動スクリプト
└── .env.example       # 環境変数のサンプル
```

## セットアップ

依存パッケージをインストールします。

```sh
npm install
```

環境変数ファイルを作成します。

```sh
cp .env.example .env
```

`.env` を作成したら、ログイン用のユーザ名、パスワード、セッション秘密鍵を設定してください。

```env
USER_NAME=your_username
USER_PASSWORD=your_password
SESSION_SECRET=replace_with_a_long_random_secret
```

`SESSION_SECRET` には、推測されにくい長めのランダムな文字列を設定します。

## 起動方法

開発用に起動する場合は、以下のコマンドを実行します。

```sh
npm run dev
```

nodemon を使わずに直接起動する場合は、以下でも実行できます。

```sh
node server.js
```

起動後、ブラウザで以下の URL にアクセスします。

```text
http://localhost:3000/leaderboard
```

## 主なページ

- `http://localhost:3000/leaderboard`  
  ランキング一覧を表示します。

- `http://localhost:3000/leaderboard/personal`  
  個人 ID から個別のスコアや順位を確認します。

- `http://localhost:3000/leaderboard/display`  
  会場表示向けのランキング画面です。

- `http://localhost:3000/login`  
  運営用の編集画面に入るためのログインページです。

- `http://localhost:3000/edit`  
  ログイン後にスコアを編集する管理画面です。

## ポートフォリオでの見どころ

このプロジェクトでは、イベント現場で実際に使うことを意識して、閲覧画面と運営用編集画面を分けて実装しています。データベースではなく CSV を使うことで、スプレッドシートに近い感覚でデータを扱えるようにしつつ、Web アプリとしてランキングを即時に確認できる構成にしました。

また、編集画面にはログイン認証を付け、ユーザ名・パスワード・セッション秘密鍵は `.env` で管理するようにしています。公開リポジトリでも認証情報を直接コードに書かない設計にしています。
