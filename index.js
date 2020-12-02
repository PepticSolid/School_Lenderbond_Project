/* 
Author: Steven Katz 
Date: 11/30/20
Description: Message board for lenderbond project
*
*/


//import statements
//const messageboard = require('./messageboard');
import express from "express";
import exphbs  from "express-handlebars";
import bcrypt from "bcrypt";
import cookieParser from 'cookie-parser';
import {v4 as uuidv4} from "uuid";

const app = express();

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";
import e from "express";

//open local sqlite database
const dbPromise = open({
    filename:'lenderbond.db',
    driver: sqlite3.Database 

});



app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
app.use('/static', express.static(__dirname + '/static'));

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
app.post("/select", directMessage.select);;

//Test Function
app.get('/cookieSet', async(req,res) =>
{
    res.cookie('authToken', 'bc78c841-50de-4a2a-a8a5-7f55fc65b839');
    ///console.log(req.cookies.authToken);
    res.render('messageboard');
});

app.get('/', async(req, res) => {
  res.render("home");
})

app.get('/accounts', async (req,res) => {
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

app.get('/messageboard', async(req, res) => {
  res.render("messageboard");
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

//setup will migrate the database and then the server start listing on port 8080

const setup = async () => {
    const db = await dbPromise;
    await db.migrate();
  
    app.listen(8080, () => {
      console.log("listening on http://localhost:8080");
    });
  }
  
  setup();