const express = require("express");
const fs = require('fs');
const csv = require("csv-parser");
const fastcsv = require('fast-csv');
const bodyParser = require('body-parser');

//追加モジュール
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

const app = express();
const port = 3000;

const boardRouter = require("./routes/leaderboard.js");
const editRouter = require("./routes/edit.js");


//IDとパスワード
const User = {
  name: "4e",
  password: "8931"
};

//IDとパスワード照合
passport.use(new LocalStrategy((username, password, done) => {
  if(username !== User.name){
    return done(null, false);
  }else if(password !== User.password){
    return done(null, false);
  }else{
    return done(null, {username: username, password: password});
  }
}));
//ログイン状態を維持
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
app.use(session({
  secret: 'cat',
  resave: true,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//ログイン処理
function auth(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/login');
  }
}

//ルーティング
app.use('/leaderboard', boardRouter);
// app.use('/edit', editRouter);

// -----------ログインページ------------------
app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login', passport.authenticate('local',{
  successRedirect: '/edit',
  failureRedirect: '/login'
}));

// -----------スコア編集画面------------------
// CSVファイルを読み込んでWebページに表示
app.get('/edit', auth, (req, res) => {
  const results = [];
  
  fs.createReadStream('scores.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // CSVデータをフォームとして表示
      res.render('editCsv', { data: results });
    });
});
// 編集後のCSVデータを保存
app.post('/edit', auth, (req, res) => {
  const { id, kind, score } = req.body; // フォームから送信されたデータ
  console.log(id);
  console.log(kind);
  console.log(score);

  const results = [];
  
  //csvファイルを編集
  fs.createReadStream('scores.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      let idExists = false;

      // 点数を更新
      const updatedData = results.map((row) => {
        if (row.id === id) {
          row[kind] = score;
          row.totalscore = Number(row.curling) + Number(row.fencing) + Number(row.hockey) + Number(row.scrollaction)
        }
        return row;
      });

      // IDが存在しない場合、新しい行を追加
      if (!idExists) {
        const newRow = {
          id: id,
          curling: kind === 'curling' ? score : 0,
          fencing: kind === 'fencing' ? score : 0,
          hockey: kind === 'hockey' ? score : 0,
          scrollaction: kind === 'scrollaction' ? score : 0,
          totalscore: kind === 'curling' ? Number(score) : 0 + kind === 'fencing' ? Number(score) : 0 + kind === 'hockey' ? Number(score) : 0 + kind === 'scrollaction' ? Number(score) : 0
        };
        updatedData.push(newRow);
      }

      // CSVファイルに書き戻す
      const ws = fs.createWriteStream('scores.csv');
      fastcsv
        .write(updatedData, { headers: true })
        .pipe(ws)
        .on('finish', () => {
          console.log('Score updated successfully!');
          res.redirect('/edit');
        })
        .on('error', (err) => {
          console.error('Error writing CSV:', err);
          res.status(500).send('Error writing CSV');
        });

    });
  
});

//-------編集完了の画面-----------------
// app.get('/edit-complete', (req, res) => {
//   res.render('editComplete');
// });
// app.post('/edit-complete', (req, res) => {
//   res.redirect('/leaderboard');
// });



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});