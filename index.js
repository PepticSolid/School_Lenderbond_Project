const express = require('express');

const app = express();

app.use(express.urlencoded());


app.get('/', (req, res) => {
    res.send("Hello Test");
})

app.listen(8080, () => {
    console.log("Server is listening on", 8080);
})

