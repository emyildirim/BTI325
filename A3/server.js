const express = require("express");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

// this is required for form data to be received properly (middleware)
app.use(express.urlencoded({ extended: true }));

// configure the server to serve static resources
app.use(express.static("public"))


// data sources
const ROOM_LIST = [
    { name: 'A101', bookings: ["", "", ""] },
    { name: 'B202', bookings: ["", "", ""] },
    { name: 'C303', bookings: ["", "", ""] },
]

const timeSlots = ["morning", "afternoon", "evening"]


// show all study rooms and & booking options
app.get("/", (req, res) => {
    res.render("homepage", { roomList: ROOM_LIST });
});

app.get("/book/:roomIndex/:timeIndex", (req, res) => {
    res.render("bookingform", {
        roomList:ROOM_LIST, 
        timeSlots:timeSlots, 
        roomIdx: req.params.roomIndex,
        timeIdx: req.params.timeIndex });
});

app.post("/booked/:roomIndex/:timeIndex", (req, res) => {
    const userIdFromUI = req.body.userId
    const roomIdx = req.params.roomIndex
    const timeIdx = req.params.timeIndex
    ROOM_LIST[roomIdx].bookings[timeIdx] = userIdFromUI
    res.redirect('/');
});

app.post("/cancel", (req, res) => {
    for(let i = 0; i < ROOM_LIST.length; ++i){
        for(let j = 0; j < timeSlots.length; ++j){
            ROOM_LIST[i].bookings[j] = ""
        }
    }
    console.log("All cancelled!")
    res.redirect('/');
});




const onHttpStart = () => {
    console.log("The web server has started...");
    console.log(`Server is listening on port ${HTTP_PORT}`);
    console.log("Press CTRL+C to stop the server.");
};


app.listen(HTTP_PORT, onHttpStart);
