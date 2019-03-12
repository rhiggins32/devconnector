const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const app = express()

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

//Body Parser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Db Config
const db = require('./config/keys').mongoURI;

//Connect to MongoDB
mongoose 
    .connect(db, {useNewUrlParser : true})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World'));

//Use Routes 
app.use('/api/users', users)
app.use('/api/posts', posts)
app.use('/api/profile', profile)

const port = process.env.PORT || 5000 

app.listen(port, () => console.log(`Example app listening on port ${port}`))