/* 
Author: Steven Katz 
Date: 11/27/20
Description: Direct Message board for lenderbond project
*
*/

//import statements 
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

const dbPromise = open({
    filename:'lenderbond.db',
    driver: sqlite3.Database 

});

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
app.use('/static', express.static(__dirname + '/static'));

//Get From Cookie in final
const userID = 1; //change to test different values for user id 
//Get From Cookie in final

//function called when someone posts a new message
app.post('/newdirectmessage', async(req,res) =>{
  const db = await dbPromise;
  //var userID = req.cookies.userID;
  var Head_User = userID;
  var usernameText = req.body.SelectedUserID;

  try
  {
    //gets userID using their username
  var userId = await db.get('SELECT user_id FROM accountHolder WHERE username =?',usernameText);
  if(!userID)
    {
     throw "Username does not match existing username";
    }
  }
  catch(e)
  {
    return res.render('direct', { error: e })
  }

  try
  {
    //gets thread id using their user id
  var ThreadID =  await db.get("SELECT Thread_id FROM DirectMessages WHERE Head_User =(?) ORDER BY DM_ID ASC", userId.user_id);
  if(!ThreadID)
    {
      throw "Invalid user id";
    }
  }
  catch(e)
  {
    return res.render('direct', { error: e })
  }

  try
  {
    if(req.body.message = " ")
    {
      throw "blank message" ;
    }
    //inserts a new message into the direct messages table
  var result = await db.run('INSERT INTO DirectMessages (Head_User,MessageTimestamp,Message,Other_User,Thread_id) VALUES (?, ?, ?, ?,?);',
  Head_User,new Date().toISOString(),req.body.message,userId.user_id,ThreadID.Thread_id);
  if(!result)
    {
      throw "Unable to insert message" ;
    }
  }
  catch(e)
  {
    return res.render('direct', { error: e })
  }
      res.redirect("/direct") }

);
//selects a direct message chain based on the user's id
app.get("/direct",async (req,res) =>
{
  //Temp cookie set
  //res.cookie('userID', 1);
  //Set Cookie Externally in final
  //var userID = req.cookies.userID;

  const db = await dbPromise;
    try
    {
    //gets the thread id based on user id
    var ThreadID =  await db.get("SELECT Thread_id FROM DirectMessages WHERE Head_User =(?) ORDER BY DM_ID ASC", userID);
    if(!ThreadID)
      {
      throw "Non existent thread ID";
      }
    }
    catch(e)
    {
      return res.render('direct', { error: e })
    }
    var id = ThreadID.Thread_id;
  
    try
    {
      //gets message thread from database
    var MessageThread = await db.all("SELECT * FROM DirectMessages WHERE Thread_id =(?) ORDER BY DM_ID ASC",id);
      if(!MessageThread)
      {
       throw "Message thread of id:"+ id + "does not exist";
      }
    }
    catch (e)
    {
      return res.render('direct', { error: e })
    }

    try
    {
    //gets a list of all the usernames
    var usernameReceived = await db.all("SELECT user_id, username FROM accountHolder ORDER BY user_id ASC",);
    if(!usernameReceived)
      {
        throw "Unable to fetch usernames";
      }
    }
    catch(e)
    {
      return res.render('direct', { error: e })
    }
    var ExportUserNames = [];

    for(var q = 0;q < usernameReceived.length; q++)
    {
      //remove own user name from recipients 
      if(usernameReceived[q].user_id != userID)
      {
        ExportUserNames[q] = usernameReceived[q].username;
      }
    }
  
  //display direct messages
  res.render("direct", {MessageThread,ExportUserNames});
});

app.get('/',(req,res) =>
{
    res.render("home");
});

//setup will migrate the database and set the server listening to port 8080
const setup = async () => {
    const db = await dbPromise;
    await db.migrate();
  
    app.listen(8080, () => {
      console.log("listening on http://localhost:8080");
    });
  }
  
  setup();