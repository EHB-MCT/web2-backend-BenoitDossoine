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
    const user = await usersCollection.findOne({
        _id: mongodb.ObjectId(userId)
    });

    return user.boardgames;
}

export {
    connectDatabase,
    closeConnection,
    getUsers,
    getUserBoardgames
}