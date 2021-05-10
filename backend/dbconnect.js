const express = require('express');
const app = express();
const port = process.env.PORT || 8081;
const cors = require('cors');
const lowDb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const db = lowDb(new FileSync('memes.json'));

db.defaults({memes:[]}).write();

app.use(express.json());
app.use(cors());

// function checkURL(url) {
//     return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
// }

// var picNotFoundAltLink = "https://bitsofco.de/content/images/2018/12/broken-1.png";

app.get('/memes',(req,res) => {
    const data = db.get('memes').value();
    res.status(200).json(data);
});

app.post('/memes',(req,res) => {
    var meme = req.body;
    const data = db.get('memes').value();
    meme["id"] = data.length+1;

    if(meme.insertedId || meme.insertedId == "")
        delete meme.insertedId;

    // if(!checkURL(meme["url"])){
    //     meme.url = picNotFoundAltLink;
    // }

    if((!req.body.name) || (!req.body.caption) || (!req.body.url)){
        res.status(400).send("Invalid Request");
    }
    else{
        try{
            db.get('memes').push(meme).write();
            res.status(201).json({ id: meme.id });
        }catch(err){
            res.status(404).send('Error in retrieving data');
        }
    }
});

app.get('/memes/:memeId',(req,res) => {
    try{
        const data = db.get('memes').sortBy('id').value();
        if(data[req.params.memeId-1].id == req.params.memeId)
            res.status(201).json(data[req.params.memeId-1]);
        else 
            throw console.error();
    }catch(err){
        res.status(404).send('Error in retrieving data');
    }
});

app.patch('/memes/:memeId',(req,res) => {
    if((!req.body.caption) || (!req.body.url))
        res.status(400).json({"success" : false,"message": "Invalid Request"});
    else{
        try{
            const upId = parseInt(req.params.memeId);
            // if(!checkURL(req.params.url)){
            //     req.params.url = picNotFoundAltLink;
            // }
            db.get('memes').find({ id: upId }).assign({caption: req.body.caption},{url: req.body.url}).write();
            res.status(201).json({"success" : true});
        }catch(err){
            res.status(404).json({"success" : false,"message": "Data not found"});
        }
    }
    
});

app.all('/', (req,res) => {
    res.status(200).send("Hellow!!!");
});


app.listen(port,'0.0.0.0', () => {
    console.log('Server Up and Running!');
});