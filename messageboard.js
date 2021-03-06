/* 
Author: Steven Katz 
Date: 12/1/20
Description: Message board for lenderbond project
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


//Test Function
//app.get('/cookieSet', async(req,res) =>
//{
    //res.cookie('authToken', 'bc78c841-50de-4a2a-a8a5-7f55fc65b839');
    ///console.log(req.cookies.authToken);
    //res.render('direct');
//});



/**
 * function for creating an new topic on the message board
 * using the topic type, subject and the first post from the user's input
 * 
 */
//app.post('/newtopic', 

exports.newTopic = async (req,res) =>
{

  console.log("working");
  const db = await dbPromise;
  var userID  = req.cookies.authToken;
  var topicText  = req.body.newtopic;
  var topicType  = req.body.TopicSubject;
  var newMessage = req.body.newMessage; 
  var newTopicId;
  
  try
  {
  var thisUser = await db.get("Select user_id FROM accountHolder WHERE token=?", userID);
  if(!thisUser)
  {
     throw "User not found";
  }
  }
  catch(e)
  {
    res.redirect('index.html');
  }

  userID = thisUser.user_id;

  
  try
  {
    if(topicText == "")
    {
      throw "topic left blank";
    }

    if(newMessage == "")
    {
     throw "message left blank"; 
    }
    //tries to insert a new topic into the message board
  var result = await db.run('INSERT INTO messageBoard (subjectTitle,dateCreated,threadTopic) VALUES (?, ?, ?);', topicText, new Date().toUTCString(), topicType);
  if(!result)
    {
        throw "Unable to insert message into message board";
    }
  
  }
  catch(e)
  {
   return res.render("messageboard", {error: e});
  }
  try
  {
  //gets all the thread ids
  newTopicId = await db.all("SELECT MBthred_id FROM messageBoard");
  if(!newTopicId)
    {
      throw "Unable select thread from messages";
    }  
  }
  catch(e)
  {
    return res.render("messageboard", {error: e});
  }
  var array = [];
  //converts raw data into numeric array
  for(var b = 0; b < newTopicId.length; b++)
  {
  array[b]  = newTopicId[b].MBthred_id;
  }
  
  //max value of thread ID is found
  var m = Math.max(...array);

  try
  {
    if(newMessage == "")
    {
      throw "Message field left blank"; 
    }
  var InsertResult = await db.run('INSERT INTO MBmessages (MBthred_id,user_id,MessageTimestamp,message) VALUES (?, ?, ?, ?);', m,userID, new Date().toUTCString(), newMessage);
  if(!InsertResult)
    {
      throw "unable to insert record into messages";
    }
  }
  catch(e)
  {
    return res.render("messageboard", {error: e});
  }
      //if sucessful redirect to newly created topic
      res.redirect("/messagetopic?id="+m); 
};

//when a user is in a topic and wants to post a new message this function will be called
exports.newMessage = async(req,res) =>
{
  const db = await dbPromise;
  var topicID = req.body.topicID;
  var newMessage = req.body.newmessage;
  var userID  = req.cookies.authToken;

  try
  {
  var thisUser = await db.get("Select user_id FROM accountHolder WHERE token=?", userID);
  if(!thisUser)
  {
     throw "User not found";
  }
  }
  catch(e)
  {
    res.redirect('index.html');
  }

  userID = thisUser.user_id;

  try
  {
  if(newMessage == "")
  {
    throw "Message left blank";
  }
  //tries to insert the message into the current thread
  var MessageResult = await db.run('INSERT INTO MBmessages (MBthred_id,user_id,MessageTimestamp,message) VALUES (?, ?, ?, ?);', topicID,userID, new Date().toUTCString(), newMessage);
  if(!MessageResult)
    {
      throw "Message could not be inserted";
    }
  }
  catch(e)
  {
    return res.render("messageboard", {error: e});
  }
  res.redirect("/messagetopic?id="+topicID); 
};

//this function gets and displays all the messages in a specific topic 
exports.messageTopic = async(req,res) =>{

   const db = await dbPromise;
   var allMessages;
   var topic;
  
   try
   {
     //Select all messages that match the thread id
    allMessages = await db.all("SELECT * FROM MBmessages Where MBthred_id =?",req.query.id);
   if(!allMessages)
    {
      throw "Could not retrieve messages from database";
    }
   }
   catch(e)
   {
    return res.render("messageboard", {error: e});
   }

   try
   {
    //gets the subject from the messageBoard table
    topic = await db.get("SELECT subjectTitle FROM messageBoard WHERE MBthred_id =?", req.query.id);
    if(!topic)
    {
      throw "could not select topic";
    }
   }
   catch(e)
   {
    return res.render("messageboard", {error: e});
   }
   
   
   var topicID = req.query.id;

 
   //sends data to be displayed in the message topic
   res.render("messagetopic",{allMessages, topic, topicID})

};

//this function gets and displays the information for the message board
exports.messageBoard = async (req,res) =>
{
  //Temp cookie set
  //res.cookie('userID', 1);
  //Set Cookie Externally in final
  //var userID = req.cookies.userID;
  var userID  = req.cookies.authToken;
  const db = await dbPromise;
  

  try
  {
  var thisUser = await db.get("Select user_id FROM accountHolder WHERE token=?", userID);
  if(!thisUser)
  {
     throw "User not found";
  }
  }
  catch(e)
  {
    res.redirect('index.html');
  }

  userID = thisUser.user_id;

  var allThreads;
  try
  {
    //get all message board threads
    allThreads = await db.all("SELECT * FROM messageBoard ORDER BY MBthred_id ASC");
    if(!allThreads)
    {
      throw "could not select threads from message board";
    }
  }
  catch(e)
  {
    return res.render("messagetopic", {error: e});
  }
  
  //prepare to display all threads
  res.render("messageboard",{allThreads});

};

/*
//setup will migrate the database and then the server start listing on port 8080
const setup = async () => {
    const db = await dbPromise;
    await db.migrate();
  
    app.listen(8080, () => {
      console.log("listening on http://localhost:8080");
    });
  }
  
  setup();

  */