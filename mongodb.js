"use strict";

const mongodb = require('mongodb');
require('dotenv').config();

const uri = process.env.FINAL_URL;
const client = new mongodb.MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const usersCollection = client.db('gamenightapp').collection('users');
const boardgamesCollection = client.db('gamenightapp').collection('boardgames');
const gamenightsCollection = client.db('gamenightapp').collection('gamenights');

async function connectDatabase() {
    await client.connect();
}

function closeConnection() {
    client.close();
}

async function getUsers() {
    const users = await usersCollection.find({}).toArray();
    return users;
}

async function getUserBoardgamesId(userId) {
    const user = await findUser(userId);
    const boardgames = await user.boardgames;
    return user.boardgames;
}

async function getUserBoardgames(userId) {
    let userBoardgamesIds = await getUserBoardgamesId(userId);
    let userBoardgames = [];
    await userBoardgamesIds.forEach(async element => {
        const boardgame = await getBoardgame(element);
        userBoardgames.push(boardgame);
    })
}

async function addUserBoardgame(userId, gameId) {
    let boardgames = await getUserBoardgamesId(userId);
    boardgames.push(gameId);
    const result = await usersCollection.updateOne({
        _id: mongodb.ObjectId(userId)
    }, {
        $set: {
            boardgames: boardgames
        }
    });
    return result;
}

async function deleteUserBoardgame(userId, gameId) {
    let boardgames = await getUserBoardgamesId(userId);
    boardgames.splice(boardgames.indexOf(gameId), 1);
    const result = await usersCollection.updateOne({
        _id: mongodb.ObjectId(userId)
    }, {
        $set: {
            boardgames: boardgames
        }
    });
    return result;
}

async function findUser(userId) {
    return await usersCollection.findOne({
        _id: mongodb.ObjectId(userId)
    });
}

async function getBoardgames() {
    const boardgames = await boardgamesCollection.find({}).toArray();
    return boardgames;
}

async function getBoardgame(boardgameId) {
    const boardgame = await boardgamesCollection.findOne({
        _id: mongodb.ObjectId(boardgameId)
    });
    return boardgame;
}

async function getGamenights() {
    const gamenights = await gamenightsCollection.find({}).toArray();
    return gamenights;
}

async function buildGamenight(newGamenight) {
    const chosenCategories = await newGamenight.categories;
    const chosenDuration = await newGamenight.duration;
    const chosenAmountOfPlayers = await newGamenight.amountOfPlayers;
    const userGamesIds = await getUserBoardgamesId(newGamenight.ownerId);
    let boardgames = []

    for (let id in userGamesIds) {
        const boardgame = await boardgamesCollection.findOne({
            _id: mongodb.ObjectId(userGamesIds[id]),
        })
        boardgames.push(boardgame);
    }
    boardgames = await filterByCategories(boardgames, chosenCategories);
    boardgames = await filterByDuration(boardgames, chosenDuration);
    boardgames = await filterByPlayers(boardgames, chosenAmountOfPlayers);
    let boardgameIds = boardgames.map(boardgame => boardgame._id);
    let builtGamenight = newGamenight;
    builtGamenight.games = boardgameIds;
    await addGamenight(builtGamenight);
}

async function filterByCategories(boardgames, chosenCategories) {
    let filteredBoardgames = boardgames.filter(boardgame => {
        return boardgame.categories.some(value => chosenCategories.includes(value));
    });
    return filteredBoardgames;
}

async function filterByDuration(boardgames, chosenDuration) {
    let filteredBoardgames = boardgames.filter(boardgame => {
        return parseInt(boardgame.duration) <= parseInt(chosenDuration);
    });
    return filteredBoardgames;
}

async function filterByPlayers(boardgames, amountOfPlayers) {
    let filteredBoardgames = boardgames.filter(boardgame => {
        return ((parseInt(amountOfPlayers) >= parseInt(boardgame["min-players"])) && (parseInt(amountOfPlayers) <= parseInt(boardgame["max-players"])));
    })
    return filteredBoardgames;
}


async function addGamenight(newGamenight) {
    const result = await gamenightsCollection.insertOne(newGamenight);
    return result;
}

async function deleteGamenight(id) {
    const result = await gamenightsCollection.deleteOne({
        _id: mongodb.ObjectId(id)
    });
    return result;
}

module.exports = {
    connectDatabase,
    closeConnection,
    getUsers,
    getUserBoardgames,
    getUserBoardgamesId,
    addUserBoardgame,
    deleteUserBoardgame,
    getBoardgames,
    getGamenights,
    addGamenight,
    buildGamenight,
    deleteGamenight
}