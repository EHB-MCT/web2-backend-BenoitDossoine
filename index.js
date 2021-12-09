//Part of this code was written during the group project,
//with Finn Janssens taking the biggest part of the coding on him.
import * as mongodb from './mongodb.js';

import express from 'express';

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

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

app.get('/boardgames/:id', async (req, res, next) => {
    let {
        id
    } = req.params;

    try {
        await mongodb.connectDatabase();
        const boardgames = await mongodb.getUserBoardgames(id);
        res.status(200).json(boardgames);
    } catch (error) {
        console.log(error);
    } finally {
        mongodb.closeConnection();
    }
})

app.post('/boardgames/:id', async (req, res, next) => {
    let {
        id
    } = req.params;

    console.log(req.body);
    if (!req.body.id) {
        res.status(400).send('Bad request: id missing');
        return;
    }

    try {
        await mongodb.connectDatabase();
        const newBoardgame = req.body.id;
        await mongodb.addBoardgame(id, newBoardgame);
        res.status(200).json("Boardgame added!")
    } catch (error) {
        console.log(error);
    } finally {
        mongodb.closeConnection();
    }
})

app.listen(port, () => {
    console.log(`Boardgame app API listening at http://localhost:${port}`)
})