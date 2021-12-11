//Part of this code was written during the group project,
//with Finn Janssens taking the biggest part of the coding on him.
import * as mongodb from './mongodb.js';

import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());

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
        userId
    } = req.params;

    if (!req.body.id) {
        res.status(400).send('Bad request: boardgame id missing');
        return;
    }

    try {
        await mongodb.connectDatabase();
        const newBoardgameId = req.body.id;
        await mongodb.addUserBoardgame(userId, newBoardgameId);
        res.status(200).json("Boardgame added to user collection!")
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