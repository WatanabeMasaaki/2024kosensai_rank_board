# ランキングボードサイト

2024年の岐阜高専高専祭の専門展にて実際に使用した、競技スコアのランキングボードサイトです。

参加者ごとの競技結果を CSV で管理し、Web 画面上でランキング表示、個人結果の確認、運営側によるスコア編集ができるようにしています。

## 専門展
岐阜高専では、毎年高専4年生がそれまで学んだ技術を活かして展示物などを作り、秋に行われる高専祭にて一般の方々や学生、先生方に見ていただく専門展というイベントが行われます。専門展はクラスごとで分かれており、我々のクラスは、オリンピックをテーマとし、ハードウェアとソフトウェアを組みあわせ、実際の競技を体感できるゲームを4種類展示しました。

このシステムでは、各4種類のゲームの得点を管理し、ランキングボードに反映させるシステムとなっています。

来場者は、初めての来場時に以下の画像のようなカードを下線部に4桁のIDが書かれた状態で渡されます。このカードには、ランキングボードに繋がるQRコードが載っており、来場者はこれを読み取ることでランキングの閲覧ができます。

![来場者カード]("./images/senmonten_card.png")

また運営側は、得点を登録する際に







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

以下のコマンドで起動します。

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
  ログイン後にスコアを編集する管理画面です。ログインしていない状態でここにアクセスすると、`http://localhost:3000/edit`にリダイレクトされます。


