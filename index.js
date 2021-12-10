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
        const boardgames = await mongodb.getUserBoardgames(userId);
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
        await mongodb.addBoardgame(userId, newBoardgameId);
        res.status(200).json("Boardgame added!")
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
        await mongodb.deleteBoardgame(userId, boardgameId);
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

app.listen(port, () => {
    console.log(`Boardgame app API listening at http://localhost:${port}`)
})