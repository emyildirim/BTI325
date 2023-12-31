const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// setup sessions
const session = require('express-session')
app.use(session({
   secret: "the quick brown fox jumped over the lazy dog 1234567890",  // random string, used for configuring the session
   resave: false,
   saveUninitialized: true
}))

// configure a folder for external css stylesheets and images
app.use(express.static("assets"))

// req.body
app.use(express.urlencoded({ extended: false }));

// ejs
app.set("view engine", "ejs");

/// --------------
// DATABASE : Connecting to database and setting up your schemas/models (tables)
/// --------------

const mongoose = require("mongoose")

const CONNECTION_STRING = "mongodb+srv://dbUser:Y0OSvUvnvIbUmNRO@cluster0.g281hol.mongodb.net/A5?retryWrites=true&w=majority"

mongoose.connect(CONNECTION_STRING);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to database: "));
db.once("open", () => { console.log("Mongo DB connected successfully."); });


// define the schemas and models

// schemas
const Schema = mongoose.Schema
const BooksSchema = new Schema({ title: String, author: String, ImageOfBook: String, borrowedBy: String })
const UsersSchema = new Schema({ name: String, libCardNum: String })


// models - create collection if not exist and select it
const Book = mongoose.model("books", BooksSchema)
const User = mongoose.model("users", UsersSchema)

///////////////////
// COLLECTIONS IN THE MONGODB Database
//////////////////

// BOOKS
/*
  [
    { "title": "Harry Potter and the Chamber of Secrets", "author": "J. K. Rowling", "ImageOfBook": "http://bit.ly/47O2Q1i", "borrowedBy": "" },
    { "title": "Nineteen Eighty-Four", "author": "George Orwell", "ImageOfBook": "https://bit.ly/46t6psH", "borrowedBy": "" },
    { "title": "Dracula", "author": "Bram Stoker", "ImageOfBook": "https://bit.ly/3GjWafz", "borrowedBy": "" },
    { "title": "The Lord of the Rings", "author": "J. R. R. Tolkien", "ImageOfBook": "https://bit.ly/3Rc9gSl", "borrowedBy": "" },
    { "title": "The Handmaid's Tale", "author": "Margaret Atwood", "ImageOfBook": "https://bit.ly/47Iug8U", "borrowedBy": "" }
  ]
*/

// USERS
/*
  [
    { "name": "Abbie Lee", "libCardNum": "0000" },
    { "name": "David Aziz", "libCardNum": "0001" }
  ]
*/

// ----------------------------------------------
// endpoints
// ----------------------------------------------

//anyone can see the home page but functionality is limited without login
app.get("/",  async (req, res) => {
   console.log("DEBUG: ")
   console.log(req.session)
   console.log("----------")

  try {
    const results = await Book.find().lean().exec()
    if (req.session.hasOwnProperty("userData") === true){
      return res.render("home", { userData: req.session.userData, bookList: results });
    } else{
      return res.render("home", { userData: "", bookList: results });
    }
  } catch (err) {
    console.log(err)
  }
});

// anyone can see the login page
app.get("/login", (req, res) => {
  return res.render("login", {userData: ""})
});

app.post("/login", async (req, res) => {
  const libCardNumFromUI = req.body.libcardnum
  const passwordFromUI = req.body.password
  console.log(`DEBUG: cardNum: ${libCardNumFromUI}, Password:${passwordFromUI}`)

  let correctCredentials = false
  let username = ""
  try {
    //get the users from the database
    const userList = await User.find().lean().exec()

    // search the LIST for a matching libCardNum
    for (let currUser of userList) {
      if (libCardNumFromUI === currUser.libCardNum) {
        // if found, then check that password matches
        //NOTE: The password is always the user’s lib card num + the first letter of their name.
        if (passwordFromUI === (currUser.libCardNum + currUser.name[0])) {

          correctCredentials = true;
          username = currUser.name
          break;
        }
      }
    }
  } catch (err) {
    console.log(err)
  }

  if (correctCredentials === true) {
    req.session.userData = { username: username, libCardNum: libCardNumFromUI }  
    // send user back to home page
    res.redirect("/")
  } else {
    return res.send("Sorry, invalid username/password")
  }
});

app.post("/borrow/:bookId", async (req, res) => {

  //check if the user has logged in
  if (req.session.hasOwnProperty("userData") === true) {
    //get book _id from param
    const bookIDFromParam = req.params.bookId

    //get user info from session var
    const libCardNumFromSession = req.session.userData.libCardNum

    try {
      //get the books from the database
      const bookList = await Book.find()
    
      // search the LIST for a matching _id
      for (let currBook of bookList) {
        //if the book found
        if (currBook._id.toString() === bookIDFromParam){
          //if book did not borrow by someone
          if (currBook.borrowedBy === "") {
            console.log(`SUCCESS: ${currBook.title} is borrowed by ${req.session.userData.username}`)
            //update the borrowedBy at database
            await Book.updateOne({ _id: bookIDFromParam }, {$set: {borrowedBy: libCardNumFromSession}})
            break;
          }
        }
      }

      return res.redirect("/")
    } catch (err) {
      console.log(err)
    }
  } else {
    return res.redirect("/login")
  }
});

app.post("/return/:bookId", async (req, res) => {

  //check if the user has logged in
  if (req.session.hasOwnProperty("userData") === true) {
    //get book _id from param
    const bookIDFromParam = req.params.bookId

    //get user info from session var
    const libCardNumFromSession = req.session.userData.libCardNum

    try {
      //get the books from the database
      const bookList = await Book.find()
      
      // search the LIST for a matching _id
      for (let currBook of bookList) {
        //if the book found
        if (currBook._id.toString() === bookIDFromParam) {
          //if book did not borrow by someone
          if (currBook.borrowedBy !== "") {
            console.log(`SUCCESS: ${currBook.title} is returned to the library!`)
            //update the borrowedBy at database
            await Book.updateOne({ _id: bookIDFromParam }, { $set: { borrowedBy: "" } })
            break;
          }
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
  return res.redirect("/")
});

app.get("/logout", (req, res) => {

 //reset the req.session
  console.log("Logging user out!")
  req.session.destroy()

  // optional: redirect them back to the home page
  return res.redirect("/")
});

const onServerStart = () => {
  console.log("Express http server listening on: " + HTTP_PORT);
  console.log(`http://localhost:${HTTP_PORT}`);
};
app.listen(HTTP_PORT, onServerStart);