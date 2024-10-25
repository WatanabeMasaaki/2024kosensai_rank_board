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
            //それぞれの競技で並び替えたもの
            const resultCurling = results.slice().sort((a, b) => b.curling - a.curling);
            const resultFencing = results.slice().sort((a, b) => b.fencing - a.fencing);
            const resultHockey = results.slice().sort((a, b) => b.hockey - a.hockey);
            const resultScrollaction = results.slice().sort((a, b) => b.scrollaction - a.scrollaction);
            const resultTotal = results.slice().sort((a, b) => b.totalscore - a.totalscore);


            // それぞれの順位を格納
            const rankCurling = getRank(resultCurling, resultCurling.map(r => r.curling), required_id);
            const rankFencing = getRank(resultFencing, resultFencing.map(r => r.fencing), required_id);
            const rankHockey = getRank(resultHockey, resultHockey.map(r => r.hockey), required_id);
            const rankScrollaction = getRank(resultScrollaction, resultScrollaction.map(r => r.scrollaction), required_id);
            const rankTotal = getRank(resultTotal, resultTotal.map(r => r.totalscore), required_id);

            // personal.ejsに個人スコアのデータを渡す
            res.render('personal', { data: user, rankCurling: rankCurling, rankFencing: rankFencing, rankHockey: rankHockey, rankScrollaction: rankScrollaction, rankTotal: rankTotal});
          } else {
            // ユーザーが見つからない場合
            res.render('error');
          }
        });
});

// ソートされた辞書配列と、ランキングにする対象となる配列（辞書配列からmapされたもの）, 順位を調べるID
function getRank(resultDictionary, result, id) {
  let rank = 1;
  if(resultDictionary[0].id == id) {
    return rank;
  }

  for (let i = 1; i < result.length; i++) {
    if (result[i] === result[i - 1]) {
      // 前の人と同じ点数なら、同じ順位を付ける→rankは変わらない
    } else {
      // 点数が異なれば、順位をインクリメント
      rank = i + 1;
    }

    if(result[i] == -1) {
      return -1;
    }
    if(resultDictionary[i].id == id) {
      return rank;
    }
    
  }
  return -1;

}

router.get('/display', (req, res) => {
  const results = [];

  fs.createReadStream('data/scores.csv')  // ファイル名を統一
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // 合計スコアで降順にソート
      results.sort((a, b) => b.totalscore - a.totalscore);

      // leaderboard.ejs に結果を渡す
      res.render('display', { data: results });
  });
});

module.exports = router;
