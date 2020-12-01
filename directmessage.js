/* 
Author: Steven Katz 
Date: 11/30/20
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

//Get From Cookie

//Test Function
//app.get('/cookieSet', async(req,res) =>
//{
    //res.cookie('authToken', 'bc78c841-50de-4a2a-a8a5-7f55fc65b839');
    ///console.log(req.cookies.authToken);
    //res.render('direct');
//});

//function called when someone posts a new message
app.post('/newdirectmessage', async(req,res) =>{
  const db = await dbPromise;
  //var userID = req.cookies.userID;
  //'authToken'
  
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
    res.redirect('home');
  }

  userID = thisUser.user_id;
  var Head_User = userID;
  var usernameText = req.body.SelectedUserID;
  


  try
  {
    //gets userID using their username
  var userId = await db.get('SELECT user_id FROM accountHolder WHERE username =?',usernameText);
  if(!userId)
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
    if(req.body.message == " ")
    {
      
      throw "blank message" ;
    }
    //inserts a new message into the direct messages table
  var result = await db.run('INSERT INTO DirectMessages (Head_User,MessageTimestamp,Message,Other_User) VALUES (?, ?, ?, ?);',
  Head_User,new Date().toUTCString(),req.body.message,userId.user_id);
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
  

  var userID  = req.cookies.authToken;
  
  try
  {
  var thisUser = await db.get("SELECT user_id FROM accountHolder WHERE token=?",userID);
  if(!thisUser)
  {
     throw "User not found";
  }
  }
  catch(e)
  {
    res.redirect('home');
  }


    var DirectMessageThread = [];
    try
    {
      //gets message thread from database
    DirectMessageThread = await db.all("SELECT * FROM DirectMessages WHERE (Head_User =? OR Other_User =?) ORDER BY DM_ID ASC", thisUser.user_id, thisUser.user_id);
    
      
     
      if(!DirectMessageThread)
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
    var ExportOtherUser = [];
    var ExportMessages = [];
    var ExportUserID = [];
    var ExportTimeStamp = [];

    for(var q = 0;q < usernameReceived.length; q++)
    {
      //remove own user name from recipients 
      if(usernameReceived[q].user_id != thisUser.user_id)
      {
        ExportUserNames[q] = usernameReceived[q].username;
      }
    }

    var i = 0;
    
      for(var r = 0;r < DirectMessageThread.length; r++)
      {
        if(DirectMessageThread[r] != undefined)
        {
          ExportMessages[i] = DirectMessageThread[r].Message;
          ExportTimeStamp[i] =  DirectMessageThread[r].MessageTimestamp;
          ExportUserID[i] = DirectMessageThread[r].Head_User;
          ExportOtherUser[i] = DirectMessageThread[r].Other_User;
          i++
        }

      
      }
      
    try
    {
    var userMatch = [];
    //gets a list of all the usernames
    for(var l = 0; l < ExportUserID.length; l++)
    {
    userMatch[l] = await db.get("SELECT username FROM accountHolder WHERE user_id=?",ExportUserID[l]);
    }
    if(!userMatch)
      {
        throw "Unable to fetch usernames";
      }
    }
    catch(e)
    {
      return res.render('direct', { error: e })
    }

    var ComboArray = [];
    
    //puts all the data into one keyed array so it can be used easily in the handlebars
    for(var c = 0; c < ExportUserID.length; c++)
    {
      ComboArray.push({'user_id': ExportUserID[c],'username': userMatch[c].username,
      'MessageTimestamp': ExportTimeStamp[c],'Message': ExportMessages[c],'Other_User': ExportOtherUser[c]});
    }
      
  //display direct messages
  res.render("direct", {ComboArray, ExportUserNames});
});

//selects messages between two users
app.post('/select', async(req,res) =>
{
  const db = await dbPromise;

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
    res.redirect('home');
  }

  //get data from post request
  var otherUserName = req.body.SelectMessages;
  var DirectMessageThread = [];

  var OtherUserId = await db.get('SELECT user_id FROM accountHolder WHERE username =?', otherUserName);

    //check where user have messages together
    DirectMessageThread = await db.all(`SELECT * FROM DirectMessages WHERE (Head_User =? AND Other_User =?) 
    OR ((Head_User =? AND Other_User =?)) ORDER BY DM_ID ASC`, thisUser.user_id, OtherUserId.user_id,OtherUserId.user_id, thisUser.user_id);

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

    //define arrays to hold userdata
    var ExportUserNames = [];
    var ExportOtherUser = [];
    var ExportMessages = [];
    var ExportUserID = [];
    var ExportTimeStamp = [];

    for(var q = 0;q < usernameReceived.length; q++)
    {
      //remove own user name from recipients 
      if(usernameReceived[q].user_id != thisUser.user_id)
      {
        ExportUserNames[q] = usernameReceived[q].username;
      }
    }

    var i = 0;
    
      for(var r = 0;r < DirectMessageThread.length; r++)
      {
        if(DirectMessageThread[r] != undefined)
        {
          ExportMessages[i] = DirectMessageThread[r].Message;
          ExportTimeStamp[i] =  DirectMessageThread[r].MessageTimestamp;
          ExportUserID[i] = DirectMessageThread[r].Head_User;
          ExportOtherUser[i] = DirectMessageThread[r].Other_User;
          i++ //i only counts up on valid data since DirectMessageThread has undefined values
        }
      }
  
    try
    {
    var userMatch = [];
    for(var l = 0; l < ExportUserID.length; l++)
    {
    //gets the usernames to be displayed by handlebars
    userMatch[l] = await db.get("SELECT username FROM accountHolder WHERE user_id=?",ExportUserID[l]);
    }
    if(!userMatch)
      {
        throw "Unable to fetch usernames";
      }
    }
    catch(e)
    {
      return res.render('direct', { error: e })
    }

    var ComboArray = [];
    //create one key value pair for the handlebars to work with
    for(var c = 0; c < ExportUserID.length; c++)
    {
      ComboArray.push({'user_id': ExportUserID[c],'username': userMatch[c].username,
      'MessageTimestamp': ExportTimeStamp[c],'Message': ExportMessages[c],'Other_User': ExportOtherUser[c]});
    }
      
    

    
  
  //display direct messages
  res.render("direct", {ComboArray, ExportUserNames});
  
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