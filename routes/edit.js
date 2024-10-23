const express = require("express");
const router = express.Router();

const fs = require('fs');
const csv = require("csv-parser");
const fastcsv = require('fast-csv');
const bodyParser = require('body-parser');

// -----------スコア編集画面------------------
// CSVファイルを読み込んでWebページに表示
router.get('/', auth, (req, res) => {
  const results = [];
  
  fs.createReadStream('data/scores.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // CSVデータをフォームとして表示
      res.render('editCsv', { data: results });
    });
});

// 編集後のCSVデータを保存
router.post('/', auth, (req, res) => {
  const { id, kind, score } = req.body; // フォームから送信されたデータ
  console.log(id);
  console.log(kind);
  console.log(score);

  const results = [];
  
  //csvファイルを編集
  fs.createReadStream('data/scores.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      
      if ((kind == 'delete') && (score == -1)){
        const updatedData = results.filter(row => row.id !== id); // IDが一致しない行だけを残す
        const ws = fs.createWriteStream('data/scores.csv');
        fastcsv
          .write(updatedData, { headers: true })
          .pipe(ws)
          .on('finish', () => {
            console.log(`id ${id} deleted successfully!`);
            res.redirect('/edit');
          })
          .on('error', (err) => {
            console.error('Error writing CSV:', err);
            res.status(500).send('Error writing CSV');
          });
        return;
      }else if (kind == 'delete'){
        console.log('data was not deleted');
        res.redirect('/edit');
        return;
      }
      
      let idExists = false;

      // 点数を更新
      const updatedData = results.map((row) => {
        if (row.id === id) {
          idExists = true;
          row[kind] = score;
          let score1 = row.curling == -1 ? 0 : Number(row.curling);
          let score2 = row.fencing == -1 ? 0 : Number(row.fencing);
          let score3 = row.hockey == -1 ? 0 : Number(row.hockey);
          let score4 = row.scrollaction == -1 ? 0 : Number(row.scrollaction);
          row.totalscore = score1 + score2 + score3 + score4;
        }
        return row;
      });

      // IDが存在しない場合、新しい行を追加
      if (!idExists) {
        const newRow = {
          id: id,
          curling: kind === 'curling' ? score : -1,
          fencing: kind === 'fencing' ? score : -1,
          hockey: kind === 'hockey' ? score : -1,
          scrollaction: kind === 'scrollaction' ? score : -1,
          totalscore: kind === 'curling' ? Number(score) : 0 + kind === 'fencing' ? Number(score) : 0 + kind === 'hockey' ? Number(score) : 0 + kind === 'scrollaction' ? Number(score) : 0
        };
        updatedData.push(newRow);
      }

      // CSVファイルに書き戻す
      const ws = fs.createWriteStream('data/scores.csv');
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

//ログイン処理
function auth(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/login');
  }
}

module.exports = router;