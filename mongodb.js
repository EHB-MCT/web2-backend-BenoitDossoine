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
const categoriesCollection = client.db('gamenightapp').collection('categories');


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
    return user.boardgames;
}

async function getUserBoardgames(userId) {
    let userBoardgamesIds = await getUserBoardgamesId(userId);
    let userBoardgames = [];
    for (let boardgamesId of userBoardgamesIds) {
        const boardgame = await getBoardgame(boardgamesId);
        userBoardgames.push(boardgame);
    }
    return userBoardgames;
}

async function addUserBoardgame(userId, boardgame) {
    if (!await getBoardgame(boardgame.id)) {
        await addBoardgame(boardgame);
    }

    let boardgames = await getUserBoardgamesId(userId);
    if (!boardgames.includes(boardgame.id)) {
        boardgames.push(boardgame.id);
        const result = await usersCollection.updateOne({
            _id: mongodb.ObjectId(userId)
        }, {
            $set: {
                boardgames: boardgames
            }
        });
        return getBoardgame(boardgame.id);
    } else {
        return false;
    }
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
        _id: boardgameId
    });

    if (boardgame != null) {
        return boardgame;
    } else {
        return false;
    }
}

async function addBoardgame(boardgame) {
    if (!await getBoardgame(boardgame.id)) {
        const categories = [];
        for (let category of boardgame.categories) {
            categories.push(category.id);
        }
        const newBoardgame = {
            _id: boardgame.id,
            name: boardgame.name,
            imgUrl: boardgame["image_url"],
            minPlayers: boardgame["min_players"],
            maxPlayers: boardgame["max_players"],
            playtime: boardgame["min_playtime"],
            description: boardgame["description_preview"],
            categories: categories
        }
        const result = await boardgamesCollection.insertOne(newBoardgame);
        return result;
    } else {
        return false;
    }
}

async function getCategories() {
    const categories = await categoriesCollection.find({}).toArray();
    return categories;
}

async function getCategory(categoryId) {
    const category = await categoriesCollection.findOne({
        _id: categoryId
    });
    if (category != null) {
        return category;
    } else {
        return false;
    }
}

async function getCategoryId(categoryName) {
    categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    let category = await categoriesCollection.findOne({
        name: categoryName
    })
    return category._id;
}


async function updateCategories(categories) {
    return await categoriesCollection.insertMany(categories)
}

async function getGamenights() {
    const gamenights = await gamenightsCollection.find({}).toArray();
    return gamenights;
}

async function getUserGamenights(id) {
    let gamenights = await gamenightsCollection.find({
        ownerId: id
    }).toArray();

    for (let gamenight of gamenights) {
        const promises = gamenight.games.map(async gameId => await getBoardgame(gameId));
        gamenight.games = await Promise.all(promises);
    }
    return gamenights;
}

async function getUserGamenight(id, gamenightId) {
    let gamenight = await gamenightsCollection.findOne({
        _id: mongodb.ObjectId(gamenightId)
    });

    const promises = gamenight.games.map(async gameId => await getBoardgame(gameId));
    gamenight.games = await Promise.all(promises);

    return gamenight;
}

async function buildGamenight(newGamenight) {
    const chosenCategories = await newGamenight.categories;
    const chosenDuration = await newGamenight.duration;
    const chosenAmountOfPlayers = await newGamenight.amountOfPlayers;
    const userGamesIds = await getUserBoardgamesId(newGamenight.ownerId);
    let boardgames = []

    for (let id in userGamesIds) {
        const boardgame = await boardgamesCollection.findOne({
            _id: userGamesIds[id],
        })
        boardgames.push(boardgame);
    }
    boardgames = await filterByCategories(boardgames, chosenCategories);
    boardgames = await filterByDuration(boardgames, chosenDuration);
    boardgames = await filterByPlayers(boardgames, chosenAmountOfPlayers);
    boardgames = await reduceTotalTime(boardgames, chosenDuration);

    let boardgameIds = boardgames.map(boardgame => boardgame._id);
    let builtGamenight = newGamenight;
    builtGamenight.games = boardgameIds;
    if (builtGamenight.games.length == 0) {
        throw 'No games found for the given parameters'
    }
    await addGamenight(builtGamenight);
    builtGamenight.games = boardgames;
    return builtGamenight
}

async function filterByCategories(boardgames, chosenCategories) {
    let filteredBoardgames = boardgames.filter(boardgame => {
        return boardgame.categories.some(value => chosenCategories.includes(value));
    });
    return filteredBoardgames;
}

async function filterByDuration(boardgames, chosenDuration) {
    let filteredBoardgames = boardgames.filter(boardgame => {
        return parseInt(boardgame.playtime) <= parseInt(chosenDuration);
    });
    return filteredBoardgames;
}

async function filterByPlayers(boardgames, amountOfPlayers) {
    let filteredBoardgames = boardgames.filter(boardgame => {
        return ((parseInt(amountOfPlayers) >= parseInt(boardgame.minPlayers)) && (parseInt(amountOfPlayers) <= parseInt(boardgame.maxPlayers)));
    })
    return filteredBoardgames;
}

async function reduceTotalTime(boardgames, chosenDuration) {
    let totalTime = boardgames.reduce((a, b) => a.playtime + b.playtime);

    while (totalTime > parseInt(chosenDuration)) {
        const randomBgIndex = Math.floor(Math.random() * boardgames.length);

        console.log(boardgames);
        console.log(randomBgIndex);
        totalTime -= boardgames[randomBgIndex].playtime;
        boardgames = boardgames.splice(randomBgIndex, 1);
        console.log(boardgames);

    }
    return boardgames;
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
    getBoardgame,
    addBoardgame,
    getCategories,
    updateCategories,
    getGamenights,
    getUserGamenights,
    getUserGamenight,
    addGamenight,
    buildGamenight,
    deleteGamenight
}