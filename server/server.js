'use strict';

//dotenv, express cors
require('dotenv').config();
const express = require('express');
const cors = require('cors');

//THIS IS MAGIC
const PORT = process.env.PORT;

//get an 'instance' of express as our app

const app = express();

//.listen expects a PORT and a callback function

app.listen(PORT, () => console.log('server running on port', PORT));

// route on the '/' in the URL bar of the browser
app.get('/', (request, response) =>{
    response.send('testing123');
});

app.get('/location', (request, response)=>{
    let data = require('./data-contract/location.json');
    response.status(200).json(data);
});

app.use('*', (request, response)=>{
    response.status(404).send('I have no idea what you want');
});

app.use((error,request, response, next)=>{
    response.status(500).send('NERO FIDDLES, THE SERVERS BURN');
});

app.use(cors());