"use strict";

import * as mongodb from 'mongodb';

const uri = "mongodb+srv://admin:admin@cluster0.d2vw0.mongodb.net/WEB2?retryWrites=true&w=majority";
const client = new mongodb.MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const usersCollection = client.db('gamenightapp').collection('users');

async function connectDatabase() {
    await client.connect();
    console.log("Succesful connection!")
}

function closeConnection() {
    client.close();
}

async function getUsers() {
    const users = await usersCollection.find({}).toArray();
    return users;
}

async function getUserBoardgames(userId) {
    const user = await findUser(userId);
    return user.boardgames;
}

async function addBoardgame(userId, gameId) {
    let boardgames = await getUserBoardgames(userId);
    boardgames.push(gameId);
    const result = await usersCollection.updateOne({
        _id: mongodb.ObjectId(userId)
    }, {
        $set: {
            boardgames: boardgames
        }
    });
    console.log(result)
    return result;
}

async function findUser(userId) {
    return await usersCollection.findOne({
        _id: mongodb.ObjectId(userId)
    });
}

export {
    connectDatabase,
    closeConnection,
    getUsers,
    getUserBoardgames,
    addBoardgame
}