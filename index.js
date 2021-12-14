//Part of this code was written during the group project,
//with Finn Janssens taking the biggest part of the coding on him.
const mongodb = require('./mongodb.js');

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT

app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(300).redirect('/info.html');
})

app.get('/users', async (req, res, next) => {
    try {
        await mongodb.connectDatabase();
        const users = await mongodb.getUsers();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
    } finally {
        mongodb.closeConnection();
    }
})

app.get('/user/:userId/boardgames', async (req, res, next) => {
    let {
        userId
    } = req.params;

    try {
        await mongodb.connectDatabase();
        const boardgames = await mongodb.getUserBoardgamesId(userId);
        res.status(200).json(boardgames);
    } catch (error) {
        console.log(error);
    } finally {
        mongodb.closeConnection();
    }
})

app.post('/user/:userId/boardgames', async (req, res, next) => {
    let {
        userId,
    } = req.params;

    if (!req.body.boardgame) {
        res.status(400).send('Bad request: boardgame info missing');
        return;
    }

    try {
        await mongodb.connectDatabase();
        const newBoardgame = req.body.boardgame;
        const result = await mongodb.addUserBoardgame(userId, newBoardgame);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
    } finally {
        mongodb.closeConnection();
    }
})

app.delete('/user/:userId/boardgames/:boardgameId', async (req, res, next) => {
    let {
        userId,
        boardgameId
    } = req.params;

    try {
        await mongodb.connectDatabase();
        await mongodb.deleteUserBoardgame(userId, boardgameId);
        res.status(200).json(`Boardgame with id ${boardgameId} deleted from user ${userId}`);
    } catch (error) {
        console.log(error);
    } finally {
        mongodb.closeConnection();
    }
})

app.get('/boardgames', async (req, res, next) => {
    try {
        await mongodb.connectDatabase();
        const boardgames = await mongodb.getBoardgames();
        res.status(200).json(boardgames);
    } catch (error) {
        console.log(error);
    } finally {
        mongodb.closeConnection();
    }
});

app.get('/boardgames/:id', async (req, res, next) => {
    let {
        id
    } = req.params;

    try {
        await mongodb.connectDatabase();
        const boardgame = await mongodb.getBoardgame(id);
        res.status(200).json(boardgame);
    } catch (error) {
        console.log(error);
    } finally {
        mongodb.closeConnection();
    }
})

app.post('/boardgames/', async (req, res, next) => {

    if (!req.body.boardgame) {
        res.status(400).json("Boardgame missing")
    }

    try {
        await mongodb.connectDatabase();
        const result = await mongodb.addBoardgame(req.body.boardgame);
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(200).json("Boardgame already existed in database");
        }
    } catch (error) {
        console.log(error);
    } finally {
        mongodb.closeConnection();
    }
})

app.post('/categories', async (req, res, next) => {
    try {
        await mongodb.connectDatabase();
        const result = await mongodb.updateCategories(req.body.categories);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
    } finally {
        mongodb.closeConnection();
    }
})

app.get('/gamenights', async (req, res, next) => {
    try {
        await mongodb.connectDatabase();
        const gamenights = await mongodb.getGamenights();
        res.status(200).json(gamenights);
    } catch (error) {
        console.log(error);
    } finally {
        mongodb.closeConnection();
    }
})

app.post('/gamenights', async (req, res, next) => {
    if (!req.body.name ||
        !req.body.location ||
        !req.body.time ||
        !req.body.date ||
        !req.body.amountOfPlayers ||
        !req.body.duration ||
        !req.body.categories ||
        !req.body.ownerId) {
        res.status(400).json('Bad request: arguments missing');
        return;
    }
    try {
        await mongodb.connectDatabase();
        const newGamenight = req.body;
        await mongodb.buildGamenight(newGamenight);
        res.status(200).json('Gamenight added!')

    } catch (error) {
        console.log(error)
    } finally {
        mongodb.closeConnection();
    }
});

app.delete('/gamenights/:id', async (req, res, next) => {
    const {
        id
    } = req.params;

    try {
        await mongodb.connectDatabase();
        await mongodb.deleteGamenight(id);
        res.status(200).json(`Gamenight ${id} deleted`)
    } catch (error) {
        console.log(error);
    } finally {
        mongodb.closeConnection();
    }
})

app.listen(port, () => {
    console.log(`Boardgame app API listening at http://localhost:${port}`)
})