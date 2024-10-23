const express = require("express");
const router = express.Router();
const fs = require('fs');
const csv = require("csv-parser");

// -----------ランキングボード-------------------
router.get('/', (req, res) => {
    const results = [];
  
    fs.createReadStream('data/scores.csv')  // ファイル名を統一
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // 合計スコアで降順にソート
        results.sort((a, b) => b.totalscore - a.totalscore);
  
        // leaderboard.ejs に結果を渡す
        res.render('leaderboard', { data: results });
    });
});

// -----------個人スコア-------------------
router.get('/personal', (req, res) => {
    const required_id = req.query.id;  // クエリパラメータとしてIDを取得
    if (!required_id) {
        return res.status(400).send('User ID is required');  // IDがない場合のエラーハンドリング
    }

    const results = [];

    fs.createReadStream('data/scores.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            // 該当ユーザーを検索
            const user = results.find(row => row.id == required_id);

            if (user) {
              // personal.ejsに個人スコアのデータを渡す
              res.render('personal', { data: user });
            } else {
              // ユーザーが見つからない場合
              res.render('error');
            }
        });
});

module.exports = router;
