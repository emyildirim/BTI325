const express = require("express")
const app = express()

const HTTP_PORT = process.env.PORT || 8080

// required for sending files back to the server
const path = require("path");

app.use(express.static('public'))

// for form data to be received properly (middleware)
app.use(express.urlencoded({ extended: true }));

const music = [
    { title: "Havana", artist: "Camila Cabello", artistImage: "camila.jpg" },
    { title: "Stitches", artist: "Shawn Mendes", artistImage: "shawn.jpg" },
    { title: "Eenie Meenie", artist: "Justin Bieber", artistImage: "justin.jpg" },
    { title: "Side To Side", artist: "Ariana Grande", artistImage: "ariana.jpg" }
]

// displays a HTML page with links to /all and /random endpoints
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

// The server should send all the items in the music array to 
// the browser as an HTML string
app.get("/all", (req, res) => {
    let output = `<link rel="stylesheet" href="styles.css">`
    const length = music.length;
    for(let i = 0; i < length; ++i){
        output = output + `<div><img src="${music[i].artistImage}" width="90px" height="90px">
                            <p>Song Title: ${music[i].title}<br>
                            Artist: ${music[i].artist}</p></div>`
    }
    res.send(output)
})

// Randomly selects 1 song from the music array.
// Sends a string message containing the song’s title and artist to 
// the browser
app.get("/random", (req, res) => {
    const index = Math.floor(Math.random() * ((music.length - 1) + 1))
    console.log(`random index: ${index}`)
    const musicPick = `<link rel="stylesheet" href="styles.css">
                        Your randomly selected song is ${music[index].title}
                         by ${music[index].artist}`
    res.send(musicPick)
})


const onHttpStart = () => {
    console.log(`Express web server running on port: ${HTTP_PORT}`)
    console.log(`Press CTRL+C to exit`)
}


app.listen(HTTP_PORT, onHttpStart)
