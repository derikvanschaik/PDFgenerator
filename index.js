//simple express server 
const express = require('express');
const path = require('path');
const jsonData = require('./base64images.json'); 
const app = express(); 

const PORT = process.env.PORT || 3000; //when we deploy server needs port num in env var

app.use(express.static(path.join(__dirname, 'public'))); 
// API call for the data 
app.get('/urls', (req, res)=>{
	res.json(jsonData); 
}); 


app.listen(PORT, () => console.log(`servers started on Port${PORT}`)); 