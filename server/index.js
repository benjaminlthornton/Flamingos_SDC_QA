require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const app = express();
const port = process.env.PORT || 3000


app.use(express.json());
app.use(cors());
app.listen(port);

console.log('listening on port:', port)

app.get('/:question', (req, res) => {
  if (Number.isNaN(Number(req.query.product_id))) {
    res.sendStatus(404);
  } else {
    db.getQuestionsByProductId(req.query.product_id)
  .then((data) => {
    res.send(data);
  })
  .catch((err) => {
    console.log('error retrieving question ids: index.js', err);
    res.end();
  });
}
})

