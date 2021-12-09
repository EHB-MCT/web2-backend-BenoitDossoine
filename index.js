const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.status(300).redirect('/info.html');
})

app.listen(port, () => {
    console.log(`Boardgame app API listening at http://localhost:${port}`)
})