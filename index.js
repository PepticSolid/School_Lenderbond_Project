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
    const username = req.body.email;
    const pass = req.body.password;
    const passwordHash = await bcrypt.hash(pass, 10);
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const address = req.body.address;
    try {
        await db.run('INSERT INTO accountHolder (username, pass, first_name, last_name, email, address) VALUES (?, ?, ?, ?, ?, ?);'),
        username,
        email,
        passwordHash,
        first_name,
        last_name,
        email,
        address
    } catch (e) {
        return res.render('accounts', {error : e});
    }
    res.redirect('/');
})

app.post('/uname', async (req, res) => {
    const db = await dbPromise;
    const username = req.body.uname;
    const password = req.body.psw
    try {
        const existingUser = await db.get("SELECT * FROM USERS WHERE accountHolder=?", username);
        if(!existingUser){
            throw "Incorrect login";
        }
        const passwordHash = await bcrypt.compare(password, existingUser.password);
        if(!passwordHash) {
            throw 'Incorrect login';    
        }
    }
    catch (e){
        return res.render('login', {error: e});
    }
    res.redirect('/');
})


app.listen(8080, () => {
    console.log("Server is listening on", 8080);
})

