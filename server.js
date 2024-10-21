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

// routes
const boardRouter = require("./routes/leaderboard.js");
const editRouter = require("./routes/edit.js");


//IDとパスワード
const User = {
  name: "4e",
  password: "22360679"
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


//ルーティング
app.use('/leaderboard', boardRouter);
app.use('/edit', editRouter);

// -----------ログインページ------------------
app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login', passport.authenticate('local',{
  successRedirect: '/edit',
  failureRedirect: '/login'
}));



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