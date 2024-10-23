const express = require("express");
const router = express.Router();

const fs = require('fs');
const csv = require("csv-parser");
const fastcsv = require('fast-csv');
const bodyParser = require('body-parser');

// ipアドレス
let ip;

// -----------スコア編集画面------------------
// CSVファイルを読み込んでWebページに表示
router.get('/', auth, (req, res) => {
  ip = req.headers['x-forwarded-for'];

  //ログ
  const lograw = [];
  let logs = [];
  const results = [];

  fs.createReadStream('data/editLog.csv')
    .pipe(csv())
    .on('data', (data) => lograw.push(data))
    .on('end', () => {

      lograw.forEach((l) => {
        if(l.ipAddress == ip) {
          // ログに表示させるテキストを用意
          let log_sentence;
          if(l.operation == "update") {
            switch(l.updatedColumn) {
              case 'curling':
                log_sentence = l.date + " ID:" + l.editID + " の " + "カーリング" + " のスコアを " + l.preCurling + " から " + l.curling + "に更新しました！";
                logs.push(log_sentence);
                break;
              case 'fencing':
                log_sentence = l.date + " ID:" + l.editID + " の " + "フェンシング" + " のスコアを " + l.preFencing + " から " + l.fencing + "に更新しました！";
                logs.push(log_sentence);
                break;
              case 'hockey':
                log_sentence = l.date + " ID:" + l.editID + " の " + "エアホッケー" + " のスコアを " + l.preHockey + " から " + l.hockey + "に更新しました！";
                logs.push(log_sentence);
                break;
              case 'scrollaction':
                log_sentence = l.date + " ID:" + l.editID + " の " + "スクロールアクション" + " のスコアを " + l.preScrollaction + " から " + l.scrollaction + "に更新しました！";
                logs.push(log_sentence);
                break;
              default:
                console.log("edit.js: unknown updatedColumn");
            }
            
          } else if(l.operation == "create") {
            
            switch(l.updatedColumn) {
              case 'curling':
                log_sentence = l.date + " ID:" + l.editID + " の " + l.updatedColumn + " のスコアを " + l.preCurling + " から " + l.curling + "に更新しました！";
                logs.push(log_sentence);
                break;
              case 'fencing':
                log_sentence = l.date + " ID:" + l.editID + " の " + l.updatedColumn + " のスコアを " + l.preFencing + " から " + l.fencing + "に更新しました！";
                logs.push(log_sentence);
                break;
              case 'hockey':
                log_sentence = l.date + " ID:" + l.editID + " の " + l.updatedColumn + " のスコアを " + l.preHockey + " から " + l.hockey + "に更新しました！";
                logs.push(log_sentence);
                break;
              case 'scrollaction':
                log_sentence = l.date + " ID:" + l.editID + " の " + l.updatedColumn + " のスコアを " + l.preScrollaction + " から " + l.scrollaction + "に更新しました！";
                logs.push(log_sentence);
                break;
              default:
                console.log("edit.js: unknown updatedColumn");
            }
            logs.push(l.date + " ID: " + l.editID + " を新規作成！");

          } else if(l.operation = "delete") {
            logs.push(l.date + " ID: " + l.editID + " のデータ..." + " カーリング:" + l.preCurling + " フェンシング:" + l.preFencing + " エアホッケー:" + l.preHockey + " スクロールアクション:" + l.scrollaction);
            logs.push(l.date + " ID: " + l.editID + " のデータを削除");
          } 
        }
      });

      fs.createReadStream('data/scores.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // CSVデータをフォームとして表示
        res.render('editCsv', { data: results , log: logs});
      });      
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
      //  （ログに格納する）操作の種類を記録
      let op = "update";
      // （ログに格納する）編集前のデータ&編集後のデータを定義しておく
      let preCurling, preFencing, preHockey, preScrollaction, curling, fencing, hockey, scrollaction, updatedColumn;

      // 削除する処理
      if ((kind == 'delete') && (score == -1)){
        op = "delete";
        // 削除前のデータを格納
        results.map((row) => {
          if (row.id === id) {
            preCurling = row.curling;
            preFencing = row.fencing;
            preHockey = row.hockey;
            preScrollaction = row.scrollaction;
          }
        });

        const updatedData = results.filter(row => row.id !== id); // IDが一致しない行だけを残す
        const ws = fs.createWriteStream('data/scores.csv');
        fastcsv
          .write(updatedData, { headers: true })
          .pipe(ws)
          .on('finish', () => {
            console.log(`id ${id} deleted successfully!`);
            // editLog.csvに新行追加
            pushNewEditLog(id, "delete", preCurling, preFencing, preHockey, preScrollaction, -1, -1, -1, -1, "delete");
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

          // 編集前のデータを格納
          preCurling = row.curling;
          preFencing = row.fencing;
          preHockey = row.hockey;
          preScrollaction = row.scrollaction;
          // 新しい値を入れる
          updatedColumn = kind;
          row[kind] = score;
          curling = row.curling == -1 ? 0 : Number(row.curling);
          fencing = row.fencing == -1 ? 0 : Number(row.fencing);
          hockey = row.hockey == -1 ? 0 : Number(row.hockey);
          scrollaction = row.scrollaction == -1 ? 0 : Number(row.scrollaction);
          row.totalscore = curling + fencing + hockey + scrollaction;
        }
        return row;
      });

      // IDが存在しない場合、新しい行を追加
      if (!idExists) {
        op = "create";
        // 編集前のデータを格納
        preCurling = -1;
        preFencing = -1;
        preHockey = -1;
        preScrollaction = -1;
        // 編集後のデータを格納
        updatedColumn = kind;
        curling = kind === 'curling' ? score : -1;
        fencing = kind === 'fencing' ? score : -1;
        hockey = kind === 'hockey' ? score : -1;
        scrollaction = kind === 'scrollaction' ? score : -1;
        const newRow = {
          id: id,
          curling: curling,
          fencing: fencing,
          hockey: hockey,
          scrollaction: scrollaction,
          totalscore: (kind === 'curling' ? Number(score) : 0) + (kind === 'fencing' ? Number(score) : 0) + (kind === 'hockey' ? Number(score) : 0) + (kind === 'scrollaction' ? Number(score) : 0)
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
          // editLog.csvに新行追加
          pushNewEditLog(id, op, preCurling, preFencing, preHockey, preScrollaction, curling, fencing, hockey, scrollaction, updatedColumn);
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

// （編集処理が成功したら）editLogに新しい行を追加
function pushNewEditLog(id, op, preCurling, preFencing, preHockey, preScrollaction, curling, fencing, hockey, scrollaction, updatedColumn = "none") {
  const date = new Date();
  const options = { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const formatter = new Intl.DateTimeFormat('ja-JP', options);
  const newDate = `"` + formatter.format(date) + `"`;
  
  const logNewRow = {
    date: newDate,
    ipAddress: ip,
    editID: id,
    operation: op,
    preCurling: preCurling,
    preFencing: preFencing,
    preHockey: preHockey,
    preScrollaction: preScrollaction,
    curling: curling,
    fencing: fencing,
    hockey: hockey,
    scrollaction: scrollaction,
    updatedColumn: updatedColumn
  }

  const logs = [];
  fs.createReadStream('data/editLog.csv')
    .pipe(csv())
    .on('data', (data) => logs.push(data))
    .on('end', () => {

      const updatedLog = logs.map((row) => {
        return row;
      });
      updatedLog.push(logNewRow);

      // CSVファイルに書き戻す
      const ws = fs.createWriteStream('data/editLog.csv');
      fastcsv
        .write(updatedLog, { headers: true })
        .pipe(ws)
        .on('finish', () => {
          console.log('Log updated successfully!');
        })
        .on('error', (err) => {
          console.error('Error writing log CSV:', err);
          res.status(500).send('Error writing log CSV');
        });

    });
}

module.exports = router;