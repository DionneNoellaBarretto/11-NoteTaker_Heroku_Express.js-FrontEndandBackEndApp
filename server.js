// dependency npm imports/global declaration
const express = require("express");
const fs = require("fs");
const uuid = require("uuid");
const path = require("path");
require("./db/db.json");
require("constants");
const app = express();
let PORT = process.env.PORT || 3001;

// Middleware for urlencoded form data and parsing JSON and displaying all thats in public
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


//Get /api/notes fetches saved notes from existing list of notes in db.json
app.get("/api/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "/db/db.json"))
});

// Post /api/notes/ function adds new notes to db.json list of notes
app.post("/api/notes", (req, res) => {
    fs.readFile('db/db.json', 'utf8', (err, data) => {
              //error handling
        if(err){ res.status(400).json(err) };
        const dbInfo = JSON.parse(data);
        const newNote = {
            // stringify the information of each note using this format separated by ,
                title: req.body.title,
                text: req.body.text,
                // appends a unique uuid to id for each note
                id: uuid.v4() 
        };
        dbInfo.push(newNote)
        console.log("New Note added to db.json");
        fs.writeFile('db/db.json', JSON.stringify(dbInfo), 'utf8', (err) => {
                  //error handling
        if(err){ res.status(400).json(err) };
        return true;
        });
    });
    // else redirect to landing page ('getting started')
    res.redirect('/')
})

// /api/notes/(specific note id) ensures deletion of that specific note
app.delete("/api/notes/:id", (req, res) => {
    // local function declaration
    const notes = JSON.parse(fs.readFileSync("./db/db.json"));
    const delNote = notes.filter((rmvNote) => rmvNote.id !== req.params.id);
    fs.writeFileSync("./db/db.json", JSON.stringify(delNote));
          //return the updated parsed information & display on screen to user
    res.json(delNote);
})

//routing to /notes renders the  second page of the note taker application
app.get("/notes", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});

// routing to the landing page when navigating to anything apart from /notes will take you to the first page of the app
app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/index.html"));
});

//link to the app using localhost/port number
app.listen(PORT, function () {
    console.log("Application is listening on PORT: " + PORT);
    console.log(`Review your Note Taker application at http://localhost:${PORT} 🚀`)
});