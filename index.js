import express from "express";
import exphbs from "express-handlebars";
import bcrypt from 'bcrypt';

import sqlite3 from 'sqlite3';

import { open } from 'sqlite';
import cookieParser from "cookie-parser";
import { grantAuthToken, lookupUserFormAuthToken } from "./auth";

const express = require('express');

const app = express();

const dbPromise = open({
    filename: "lenderbond.db",
    driver: sqlite3.Database
})

app.use(express.urlencoded());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.send("Hello Test");
})

app.get('/accounts', (req,res) => {
    const db = await dbPromise;
    const {
        username,
        pass,
        first_name,
        last_name,
        email,
        address,
    } = req.body;
    const passwordHash = await bcrypt.hash(pass, 10);
    const user = await db.get("SELECT id FROM Users WHERE email=?", email);
    const token = await grantAuthToken(user.id);
    try {
        await db.run('INSERT INTO accountHolder (username, pass, first_name, last_name, email, address, token) VALUES (?, ?, ?, ?, ?, ?, ?);',
        username,
        email,
        passwordHash,
        first_name,
        last_name,
        email,
        address,
        token
        )
        res.cookie('authToken', token);
        res.redirect('/');
    } catch (e) {
        return res.render('accounts', {error : e});
    }
    res.redirect('/');
})

app.post('/login', async (req, res) => {
    const db = await dbPromise;
    const {
        email,
        password
    } = req.body;
    try {
        const existingUser = await db.get("SELECT * FROM Users WHERE email=?", email);
        if(!existingUser){
            throw "Incorrect login";
        }
        const passwordHash = await bcrypt.compare(password, existingUser.password);
        if(!passwordHash) {
            throw 'Incorrect login';    
        }
        const token = await grantAuthToken(existingUser.id);
        res.cookie('authToken', token);
        res.redirect('/');
    }
    catch (e){
        return res.render('login', {error: e});
    }
})

app.post('/logout', (req, res) => {
    if(req.user){
        res.clearCookie('authToken');
        res.redirect('/');
    }
    else{
        res.redirect('/');
    }
    console.log("user signed out!");
})

//import other js.file functions 
const messageboard = require('./messageboard');
const directMessage = require('./directmessage');

//handle requests using exported functions
app.post("/newtopic", messageboard.newTopic);
app.post("/newmessage", messageboard.newMessage);
app.get("/messagetopic", messageboard.messageTopic);
app.get("/messageboard", messageboard.messageBoard);

app.post("/newdirectmessage", directMessage.newDM);
app.get("/direct", directMessage.direct);
app.post("/select", directMessage.select);

app.use((req, res, next) => {
    next({
        status: 404,
        message: `${res.path} not found`
    })
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    console.log(err);
    res.render('errorPage', {error: err.message || err})
})


app.listen(8080, () => {
    console.log("Server is listening on", 8080);
})

