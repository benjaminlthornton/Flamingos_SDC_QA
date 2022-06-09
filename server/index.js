require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('.db.js');
const port = process.env.PORT || 3000

app.use(express.json());
app.use(cors());
app.listen(port);

console.log('listening on port:', port)

app.get('/:qid', (req, res) => {
  db.getById(req.params.qid)
  .then((data) => {
    res.send(data);
  })
  .catch((err) => {
    console.log('error retrieving question ids: index.js', err);
    res.end();
  })
})

